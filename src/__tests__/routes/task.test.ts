import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleTaskComplete } from '../../routes/task'
import { createMockEnv } from '../helpers'
import * as lineService from '../../services/line'

vi.mock('../../services/line')

describe('POST /task-complete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without auth token', async () => {
    const env = createMockEnv()
    const req = new Request('http://localhost/task-complete', { method: 'POST' })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(401)
  })

  it('sends to specific userId', async () => {
    const env = createMockEnv({ 'line:user:U1234': 'U1234' })
    vi.mocked(lineService.pushMessage).mockResolvedValue({ success: true })

    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'U1234', message: 'done' }),
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(200)
    expect(lineService.pushMessage).toHaveBeenCalledWith('U1234', 'done', 'test-line-token')
  })

  it('returns 400 when specified userId not found', async () => {
    const env = createMockEnv()
    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'U9999' }),
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(400)
  })

  it('broadcasts to all users when no userId specified', async () => {
    const env = createMockEnv({ 'line:user:U1': 'U1', 'line:user:U2': 'U2' })
    vi.mocked(lineService.pushMessage).mockResolvedValue({ success: true })

    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'all done' }),
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(200)
    expect(lineService.pushMessage).toHaveBeenCalledTimes(2)

    const body = await res.json() as { data: { sent: number } }
    expect(body.data.sent).toBe(2)
  })

  it('formats message with source prefix', async () => {
    const env = createMockEnv({ 'line:user:U1': 'U1' })
    vi.mocked(lineService.pushMessage).mockResolvedValue({ success: true })

    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'U1', source: 'CI/CD', message: 'Build #1 done' }),
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(200)
    expect(lineService.pushMessage).toHaveBeenCalledWith('U1', '[CI/CD] Build #1 done', 'test-line-token')
  })

  it('uses default message when none provided', async () => {
    const env = createMockEnv({ 'line:user:U1': 'U1' })
    vi.mocked(lineService.pushMessage).mockResolvedValue({ success: true })

    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-api-key' },
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(200)
    expect(lineService.pushMessage).toHaveBeenCalledWith('U1', '任務已完成', 'test-line-token')
  })

  it('returns 400 when no users registered', async () => {
    const env = createMockEnv()
    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-api-key' },
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(400)
  })

  it('returns 502 when LINE API fails', async () => {
    const env = createMockEnv({ 'line:user:U1': 'U1' })
    vi.mocked(lineService.pushMessage).mockResolvedValue({
      success: false,
      error: 'LINE API error (401): Unauthorized',
    })

    const req = new Request('http://localhost/task-complete', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'U1', message: 'test' }),
    })

    const res = await handleTaskComplete(req, env)
    expect(res.status).toBe(502)
  })
})
