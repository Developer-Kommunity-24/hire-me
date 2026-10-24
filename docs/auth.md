# Authentication

Sign-in runs on **Neon Auth** (Neon's managed Better Auth service). Neon hosts the
auth service and owns the `neon_auth` schema — `user`, `session`, `account` and
`verification` tables — inside our own Postgres database. We do not implement the
OAuth handshake, store sessions, or hold Google client secrets.

Google is currently the only sign-in method. The email and name inputs on the login
screen are placeholders for a later change and are not wired to anything.

## How it fits together

```
Browser ──► Next.js /api/auth/[...path] ──► Neon Managed Better Auth
              (auth.handler() proxy)           owns neon_auth.*
              HttpOnly session cookie

Browser ──► GET /api/auth/token ──► short-lived EdDSA JWT (~15 min)
              │
              └─ Authorization: Bearer ──► Hono Worker (apps/api)
                                             verifies via JWKS
                                             syncs + reads our users row
```

Two distinct credentials, deliberately:

- **The session cookie** is what the browser holds. It is HttpOnly and only ever
  travels to Next.js.
- **The JWT** is what the API Worker accepts. It is short-lived, signed with EdDSA
  (Ed25519), and verified against
  `${NEON_AUTH_BASE_URL}/.well-known/jwks.json`. The Worker also pins the token's
  `iss` to that URL's origin.

**These two are derived differently, and deliberately so.** Neon Auth URLs look like
`https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth`. The key set is served
under the full path, but Neon configures Better Auth's `baseURL` as the bare origin, so
the origin is what lands in `iss`. Verified against the live service. Making the two
agree — in either direction — breaks verification: resolve the JWKS against the origin
and it 404s; pin `iss` to the path and every token is rejected. The origin still pins
the token to one project, since the hostname carries the Neon endpoint ID.

The Worker never talks to the auth service to validate a request — it only fetches
public signing keys, which `jose` caches per isolate.

### Why roles are not in the token

Neon Auth does not support custom JWT claims. Authorization therefore stays in our
own `users` table: `users.id` is set to the token's `sub` (both are UUIDs, so no
schema change was needed), and `users.roles` is the source of truth, read per
request. The token carries identity only — `sub`, `email`, `name`.

This is why the API exposes `GET /api/users/me` and
`PATCH /api/users/me/role` rather than reading a role off the JWT.

**No migrations are involved.** `users` already exists, and `neon_auth.*` is Neon's
to manage.

## One-time setup

1. In the Neon Console, open **Project → Branch → Auth** and click **Enable**.
2. Copy the **Auth URL** from the **Configuration** tab. This is
   `NEON_AUTH_BASE_URL`, and it must be identical in both apps or JWT verification
   will fail.

`localhost` origins are pre-approved as trusted domains, and Neon supplies shared
Google OAuth credentials for development — so nothing needs registering with Google
to run locally.

## Environment variables

Copy the example files and fill them in. Both targets are gitignored; never commit
real values.

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/web/.env.local.example apps/web/.env.local
```

**`apps/api/.dev.vars`**

| Variable             | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`       | Neon connection string (pooled host)                       |
| `NEON_AUTH_BASE_URL` | Auth URL from the Console; used for JWKS and issuer checks |
| `WEB_ORIGIN`         | Browser origin allowed by CORS (`http://localhost:3000`)   |

**`apps/web/.env.local`**

| Variable                  | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `NEON_AUTH_BASE_URL`      | Same value as the API                                           |
| `NEON_AUTH_COOKIE_SECRET` | Signs the session cookie; 32+ chars — `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_URL`     | Worker base URL (`http://localhost:8787`)                       |

## Running locally

```bash
pnpm install
pnpm dev
```

That starts Next.js on `:3000` and the Worker on `:8787`. Then:

1. Visit `http://localhost:3000/login`.
2. Choose **Continue with Google** and complete the consent screen.
3. You land on `/role-select`. Picking a role sends
   `PATCH /api/users/me/role` and routes you to `/student` or `/recruiter`.

To confirm persistence, open `pnpm --filter @repo/db db:studio` and check that the
`users` row carries the Neon Auth UUID as its `id` and the chosen value in `roles`.

## Troubleshooting

**Every API call returns 401.** Usually `NEON_AUTH_BASE_URL` differs between the two
apps, so the issuer check fails. Confirm both files hold the same value, path included.
Note that tokens expire in about 15 minutes; a token captured from an old session will
also 401. The Worker logs the underlying `jose` error next to `Token verification
failed:`, which distinguishes the cases: `JWKSNoMatchingKey`/`JWKSInvalid` points at the
JWKS URL, `JWTExpired` at the token's age, and `JWTClaimValidationFailed` on `iss` logs
the expected and actual values side by side.

Restart `wrangler dev` after changing `NEON_AUTH_BASE_URL`. `createRemoteJWKSet` caches
its result — failures included, behind a cooldown — for the life of the isolate, so a
running dev server can keep serving a stale 404.

**Requests are blocked by CORS.** `WEB_ORIGIN` in `apps/api/.dev.vars` must exactly
match the browser origin, scheme and port included.

**The API returns 500 "Authentication is not configured".** `NEON_AUTH_BASE_URL` is
missing from the Worker's environment. The middleware fails closed rather than
skipping verification.

**Sign-in returns 409 "An account with this email address already exists".** A
`users` row already holds that email under a different `id` — typically seed data.
The API refuses to re-point the row because `student_profiles` and `recruiters`
reference `users.id`. Resolve the duplicate row directly.

**Next.js throws about `cookies.secret`.** `NEON_AUTH_COOKIE_SECRET` must be at least
32 characters. The auth instance is built lazily, so a short or missing secret surfaces
on the first request rather than at build time.

## Tests

```bash
pnpm test
```

`apps/api/src/tests/auth.test.ts` mints EdDSA tokens with `jose` and points the
middleware at a local JWKS, covering the accepted path plus missing, malformed,
foreign-signed, wrong-issuer, expired, and claim-less tokens, and the fail-closed 500
when `NEON_AUTH_BASE_URL` is unset. Because that local JWKS bypasses URL construction,
`jwksUrl` and `expectedIssuer` are tested on their own — including the fact that they
disagree. `users.test.ts` covers the two routes, including
the rejection of `core_admin` and `club_admin`. On the web side the login and
role-select pages are tested against a mocked auth client and API.

## Security notes

- Never commit `.dev.vars` or `.env.local`. Only the `.example` siblings belong in
  git.
- The API returns bare `401 Unauthorized` for every token failure. The specific
  reason is intentionally not disclosed.
- `PATCH /api/users/me/role` accepts only `student` and `recruiter`. Admin roles are
  granted out-of-band and cannot be self-assigned; the endpoint preserves existing
  admin grants so revisiting onboarding cannot demote an administrator.
