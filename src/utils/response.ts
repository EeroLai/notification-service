import type { ApiResponse } from '../types'

export function jsonResponse<T>(body: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function successResponse<T>(data?: T): Response {
  return jsonResponse({ success: true, data })
}

export function errorResponse(error: string, status = 400): Response {
  return jsonResponse({ success: false, error }, status)
}
