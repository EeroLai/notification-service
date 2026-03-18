import type { Env, LineWebhookBody, LineWebhookEvent } from '../types'
import { saveLineUserId } from '../services/store'
import { replyMessage } from '../services/line'
import { successResponse, errorResponse } from '../utils/response'

const HELP_TEXT = '可用指令：\n• myid - 查詢你的 User ID'

async function handleMessageEvent(event: LineWebhookEvent, env: Env): Promise<void> {
  const { source, message, replyToken } = event

  if (!source?.userId || !replyToken) return

  await saveLineUserId(env.NOTIFICATION_KV, source.userId)

  if (message?.type === 'text' && message.text.trim().toLowerCase() === 'myid') {
    await replyMessage(
      replyToken,
      source.userId,
      env.LINE_CHANNEL_ACCESS_TOKEN,
    )
    return
  }

  await replyMessage(replyToken, HELP_TEXT, env.LINE_CHANNEL_ACCESS_TOKEN)
}

async function handleFollowEvent(event: LineWebhookEvent, env: Env): Promise<void> {
  const { source, replyToken } = event

  if (!source?.userId) return

  await saveLineUserId(env.NOTIFICATION_KV, source.userId)

  if (replyToken) {
    await replyMessage(
      replyToken,
      `歡迎！\n\n${HELP_TEXT}`,
      env.LINE_CHANNEL_ACCESS_TOKEN,
    )
  }
}

export async function handleWebhook(request: Request, env: Env): Promise<Response> {
  let body: LineWebhookBody
  try {
    body = await request.json() as LineWebhookBody
  } catch {
    return errorResponse('Invalid JSON body')
  }

  if (!body.events || !Array.isArray(body.events)) {
    return successResponse()
  }

  for (const event of body.events) {
    if (event.type === 'follow') {
      await handleFollowEvent(event, env)
    } else if (event.type === 'message') {
      await handleMessageEvent(event, env)
    }
  }

  return successResponse()
}
