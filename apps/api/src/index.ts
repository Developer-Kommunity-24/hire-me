import { app } from './app.js'

// A Worker's default export is its fetch handler — Hono apps satisfy that shape
// directly, so there is no server to start.
export default app
