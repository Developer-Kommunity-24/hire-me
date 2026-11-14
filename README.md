# Hire Me

Hire Me is a monorepo for a job platform, with a Next.js web application and a Hono API running on Cloudflare Workers. The workspace also includes shared database code and configuration packages.

## Tech Stack

- **Web:** Next.js, React, and TypeScript
- **API:** Hono on Cloudflare Workers
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Neon Auth
- **Workspace:** pnpm and Turborepo

## Repository Structure

| Path | Purpose |
| ---- | ------- |
| `apps/web` | Next.js web application |
| `apps/api` | Hono API Worker |
| `packages/db` | Shared database client, queries, and migrations |
| `packages/eslint-config` | Shared ESLint configuration |
| `packages/typescript-config` | Shared TypeScript configuration |
| `docs` | Project documentation |

## Prerequisites

- Node.js 24 or newer
- pnpm 10.32.1 (the version declared by `package.json`)
- Access to the project's environment configuration values

## Local Development Setup

Follow these steps to configure and run the project locally.

## 1. Create Environment Files

From the project root, run:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/web/.env.local.example apps/web/.env.local
```

This creates your local environment configuration files using the provided example templates.

## 2. Configure Environment Variables

Open the following files and replace the placeholder values with the corresponding values shared in the WhatsApp group:

- `apps/api/.dev.vars`
- `apps/web/.env.local`

Make sure all required environment variables are populated correctly.

**Important:** Do not commit `.dev.vars` or `.env.local` to GitHub. These files contain sensitive configuration values.

## 3. Install Dependencies

From the project root, run:

```bash
pnpm install
```

## 4. Build the Project

Run:

```bash
pnpm build
```

## 5. Start the Development Servers

Run:

```bash
pnpm dev
```

This starts both applications locally:

| Application             | Local URL               |
| ----------------------- | ----------------------- |
| Next.js Web Application | `http://localhost:3000` |
| Hono API Worker         | `http://localhost:8787` |

## Available Commands

Run these commands from the project root:

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Start the web app and API for local development |
| `pnpm build` | Build all workspace applications and packages |
| `pnpm lint` | Run ESLint across the workspace |
| `pnpm check-types` | Check TypeScript types across the workspace |
| `pnpm test` | Run workspace tests |
| `pnpm format` | Format supported source and documentation files |
| `pnpm format:check` | Check formatting without changing files |

## Further Documentation

For detailed authentication architecture, configuration, troubleshooting, and testing instructions, refer to:

[`./docs/auth.md`](./docs/auth.md)
