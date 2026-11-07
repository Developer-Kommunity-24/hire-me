const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** Returns today's date in IST as YYYY-MM-DD. */
export function todayIST(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10)
}
