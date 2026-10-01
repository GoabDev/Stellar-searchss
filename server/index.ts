import dotenv from 'dotenv'
import { addReceipt, createApp, getStartupDetails, receipts, validateQuery } from './app.js'
import type { Receipt } from './app.js'

dotenv.config()

const PORT = process.env.PORT || 3001

const app = createApp()

// ─── Start ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  const details = getStartupDetails()
  app.listen(PORT, () => {
    console.log(`\n🚀 StellarSearch on http://localhost:${PORT}`)
    console.log(`   Network:     ${details.network}`)
    console.log(`   Facilitator: ${details.facilitator}`)
    console.log(`   Serper:      ${details.serperConfigured ? '✓' : '✗ MISSING'}`)
    console.log(`   Groq:        ${details.groqConfigured ? '✓' : '✗ MISSING'}`)
    console.log(`   Receiving:   ${details.receiving}`)
    console.log(`   ${details.cors}\n`)
  })
}

// Backwards-compatible re-exports for callers/tests that used server/index.ts
// directly before the app/handlers split.
export { addReceipt, receipts, validateQuery }
export type { Receipt }

export { createApp }
export default app
