import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.NODE_ENV = 'test'
process.env.GROQ_API_KEY ??= 'test-key'

const { tools, formatPaymentLine } = await import('./index.js')

const PAID_TOOL_NAMES = ['web_search', 'image_search', 'news_search'] as const

function paidToolDescription(name: string): string {
  const tool = tools.find((t) => t.name === name)
  assert.ok(tool, `expected a tool named ${name}`)
  return tool.description ?? ''
}

describe('paid MCP tool descriptions', () => {
  it('does not claim the tools pay automatically', () => {
    for (const name of PAID_TOOL_NAMES) {
      const description = paidToolDescription(name)
      assert.doesNotMatch(description, /automatically pays/i)
      assert.doesNotMatch(description, /server handles the full payment flow/i)
    }
  })

  it('states that the MCP server does not configure a payment signer', () => {
    for (const name of PAID_TOOL_NAMES) {
      assert.match(paidToolDescription(name), /does not configure a payment signer/i)
    }
  })
})

describe('formatPaymentLine', () => {
  it('does not claim a payment when there is no settlement transaction', () => {
    const line = formatPaymentLine({
      paidAmount: '0.001',
      currency: 'USDC',
      network: 'stellar:testnet',
      txHash: null,
    })
    assert.doesNotMatch(line, /\bpaid\b/i)
    assert.match(line, /not confirmed/i)
  })

  it('reports the payment only when a settlement transaction is present', () => {
    const line = formatPaymentLine({
      paidAmount: '0.001',
      currency: 'USDC',
      network: 'stellar:testnet',
      txHash: 'deadbeef',
    })
    assert.match(line, /Paid: 0\.001 USDC on stellar:testnet/)
  })
})
