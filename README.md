# Local Development Setup

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

| Application | Local URL |
|---|---|
| Next.js Web Application | `http://localhost:3000` |
| Hono API Worker | `http://localhost:8787` |

## 6. Further Documentation

For detailed authentication architecture, configuration, troubleshooting, and testing instructions, refer to:

[`./docs/auth.md`](./docs/auth.md)
