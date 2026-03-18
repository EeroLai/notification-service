export interface Env {
  NOTIFICATION_KV: KVNamespace
  LINE_CHANNEL_ACCESS_TOKEN: string
  TASK_API_KEY: string
  LINE_CHANNEL_SECRET: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface TaskCompleteRequest {
  userId?: string
  source?: string
  message?: string
}

export interface LineWebhookEvent {
  type: string
  source: {
    type: string
    userId: string
  }
  message?: {
    type: string
    text: string
  }
  replyToken?: string
}

export interface LineWebhookBody {
  events: LineWebhookEvent[]
}
