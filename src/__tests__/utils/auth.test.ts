import { describe, it, expect } from 'vitest'
import { verifyBearerToken } from '../../utils/auth'

describe('verifyBearerToken', () => {
  const token = 'test-api-key'

  it('returns true for valid bearer token', () => {
    const req = new Request('http://localhost', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(verifyBearerToken(req, token)).toBe(true)
  })

  it('returns false when no Authorization header', () => {
    const req = new Request('http://localhost')
    expect(verifyBearerToken(req, token)).toBe(false)
  })

  it('returns false for wrong token', () => {
    const req = new Request('http://localhost', {
      headers: { Authorization: 'Bearer wrong-token' },
    })
    expect(verifyBearerToken(req, token)).toBe(false)
  })

  it('returns false for non-Bearer scheme', () => {
    const req = new Request('http://localhost', {
      headers: { Authorization: `Basic ${token}` },
    })
    expect(verifyBearerToken(req, token)).toBe(false)
  })
})
