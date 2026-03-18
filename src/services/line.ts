const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push'
const LINE_REPLY_URL = 'https://api.line.me/v2/bot/message/reply'

interface LineMessageResult {
  success: boolean
  error?: string
}

export async function pushMessage(
  userId: string,
  message: string,
  channelAccessToken: string,
): Promise<LineMessageResult> {
  const response = await fetch(LINE_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    return { success: false, error: `LINE API error (${response.status}): ${body}` }
  }

  return { success: true }
}

export async function replyMessage(
  replyToken: string,
  message: string,
  channelAccessToken: string,
): Promise<LineMessageResult> {
  const response = await fetch(LINE_REPLY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    return { success: false, error: `LINE API error (${response.status}): ${body}` }
  }

  return { success: true }
}
