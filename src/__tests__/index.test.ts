import { describe, it, expect, vi } from 'vitest'
import worker from '../index'
import { createMockEnv } from './helpers'

// Mock LINE service to avoid real HTTP calls
vi.mock('../services/line', () => ({
  pushMessage: vi.fn().mockResolvedValue({ success: true }),
}))

describe('Worker router', () => {
  const env = createMockEnv()
  const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() } as unknown as ExecutionContext

  it('GET /health returns 200', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' })
    const res = await worker.fetch(req, env, ctx)
    expect(res.status).toBe(200)
  })

  it('POST /line/webhook returns 200', async () => {
    const req = new Request('http://localhost/line/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [] }),
    })
    const res = await worker.fetch(req, env, ctx)
    expect(res.status).toBe(200)
  })

  it('returns 404 for unknown routes', async () => {
    const req = new Request('http://localhost/unknown', { method: 'GET' })
    const res = await worker.fetch(req, env, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 404 for wrong method on existing route', async () => {
    const req = new Request('http://localhost/health', { method: 'POST' })
    const res = await worker.fetch(req, env, ctx)
    expect(res.status).toBe(404)
  })
})
