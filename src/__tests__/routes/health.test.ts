import { describe, it, expect } from 'vitest'
import { handleHealth } from '../../routes/health'

describe('GET /health', () => {
  it('returns 200 with success: true', async () => {
    const res = handleHealth()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual({ success: true })
  })
})
