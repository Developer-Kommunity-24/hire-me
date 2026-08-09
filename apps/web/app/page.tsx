export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">hire-me</h1>
      <p className="text-lg opacity-70">
        Turborepo monorepo running a Next.js web app and a Hono API.
      </p>
      <ul className="flex flex-col gap-2 text-sm opacity-70">
        <li>
          <code className="font-mono">apps/web</code> — this app, on port 3000
        </li>
        <li>
          <code className="font-mono">apps/api</code> — Hono on Cloudflare Workers, on port 8787
        </li>
      </ul>
    </main>
  )
}
