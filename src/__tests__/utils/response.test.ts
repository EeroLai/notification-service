import { describe, it, expect } from 'vitest'
import { jsonResponse, successResponse, errorResponse } from '../../utils/response'

describe('response utils', () => {
  it('jsonResponse returns correct status and content-type', async () => {
    const res = jsonResponse({ success: true }, 201)
    expect(res.status).toBe(201)
    expect(res.headers.get('Content-Type')).toBe('application/json')

    const body = await res.json()
    expect(body).toEqual({ success: true })
  })

  it('successResponse returns 200 with success: true', async () => {
    const res = successResponse({ id: 1 })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual({ success: true, data: { id: 1 } })
  })

  it('successResponse works without data', async () => {
    const res = successResponse()
    const body = await res.json()
    expect(body).toEqual({ success: true })
  })

  it('errorResponse returns correct status and error message', async () => {
    const res = errorResponse('bad request', 400)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body).toEqual({ success: false, error: 'bad request' })
  })
})
