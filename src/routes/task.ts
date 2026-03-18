import type { Env, TaskCompleteRequest } from '../types'
import { verifyBearerToken } from '../utils/auth'
import { getLineUserId, getAllLineUserIds } from '../services/store'
import { pushMessage } from '../services/line'
import { successResponse, errorResponse } from '../utils/response'

const DEFAULT_MESSAGE = '任務已完成'

function formatMessage(source: string | undefined, message: string): string {
  return source ? `[${source}] ${message}` : message
}

export async function handleTaskComplete(request: Request, env: Env): Promise<Response> {
  if (!verifyBearerToken(request, env.TASK_API_KEY)) {
    return errorResponse('Unauthorized', 401)
  }

  let body: TaskCompleteRequest = {}
  try {
    body = await request.json() as TaskCompleteRequest
  } catch {
    // body is optional, use defaults
  }

  const message = formatMessage(body.source, body.message || DEFAULT_MESSAGE)

  if (body.userId) {
    const exists = await getLineUserId(env.NOTIFICATION_KV, body.userId)
    if (!exists) {
      return errorResponse('User not found. The user must add the bot as a friend first.')
    }

    const result = await pushMessage(body.userId, message, env.LINE_CHANNEL_ACCESS_TOKEN)
    if (!result.success) {
      return errorResponse(result.error ?? 'Failed to send LINE message', 502)
    }

    return successResponse()
  }

  const userIds = await getAllLineUserIds(env.NOTIFICATION_KV)
  if (userIds.length === 0) {
    return errorResponse('No LINE users registered. Users must add the bot as a friend first.')
  }

  const results = await Promise.all(
    userIds.map((userId) => pushMessage(userId, message, env.LINE_CHANNEL_ACCESS_TOKEN)),
  )

  const failures = results.filter((r) => !r.success)
  if (failures.length > 0) {
    return errorResponse(`Failed to send to ${failures.length}/${userIds.length} users`, 502)
  }

  return successResponse({ sent: userIds.length })
}
