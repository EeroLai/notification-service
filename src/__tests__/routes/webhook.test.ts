import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleWebhook } from '../../routes/webhook'
import { createMockEnv } from '../helpers'
import * as lineService from '../../services/line'

vi.mock('../../services/line')

describe('POST /line/webhook', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(lineService.replyMessage).mockResolvedValue({ success: true })
  })

  it('saves userId and replies welcome on follow event', async () => {
    const kvStore: Record<string, string> = {}
    const env = createMockEnv(kvStore)

    const req = new Request('http://localhost/line/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{ type: 'follow', source: { type: 'user', userId: 'U1234' }, replyToken: 'token1' }],
      }),
    })

    const res = await handleWebhook(req, env)
    expect(res.status).toBe(200)
    expect(kvStore['line:user:U1234']).toBe('U1234')
    expect(lineService.replyMessage).toHaveBeenCalledWith(
      'token1',
      expect.stringContaining('歡迎'),
      'test-line-token',
    )
  })

  it('replies with userId when user sends "myid"', async () => {
    const kvStore: Record<string, string> = {}
    const env = createMockEnv(kvStore)

    const req = new Request('http://localhost/line/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          type: 'message',
          source: { type: 'user', userId: 'U5678' },
          message: { type: 'text', text: 'myid' },
          replyToken: 'token2',
        }],
      }),
    })

    const res = await handleWebhook(req, env)
    expect(res.status).toBe(200)
    expect(kvStore['line:user:U5678']).toBe('U5678')
    expect(lineService.replyMessage).toHaveBeenCalledWith(
      'token2',
      'U5678',
      'test-line-token',
    )
  })

  it('replies with help text for unknown messages', async () => {
    const kvStore: Record<string, string> = {}
    const env = createMockEnv(kvStore)

    const req = new Request('http://localhost/line/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          type: 'message',
          source: { type: 'user', userId: 'U9999' },
          message: { type: 'text', text: 'hello' },
          replyToken: 'token3',
        }],
      }),
    })

    const res = await handleWebhook(req, env)
    expect(res.status).toBe(200)
    expect(lineService.replyMessage).toHaveBeenCalledWith(
      'token3',
      expect.stringContaining('可用指令'),
      'test-line-token',
    )
  })

  it('returns 400 for invalid JSON', async () => {
    const env = createMockEnv()
    const req = new Request('http://localhost/line/webhook', {
      method: 'POST',
      body: 'not json',
    })

    const res = await handleWebhook(req, env)
    expect(res.status).toBe(400)
  })

  it('returns 200 for empty events array', async () => {
    const env = createMockEnv()
    const req = new Request('http://localhost/line/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [] }),
    })

    const res = await handleWebhook(req, env)
    expect(res.status).toBe(200)
  })
})
