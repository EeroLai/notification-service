import type { Env } from './types'
import { handleHealth } from './routes/health'
import { handleWebhook } from './routes/webhook'
import { handleTaskComplete } from './routes/task'
import { errorResponse } from './utils/response'

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method

    if (method === 'GET' && pathname === '/health') {
      return handleHealth()
    }

    if (method === 'POST' && pathname === '/line/webhook') {
      return handleWebhook(request, env)
    }

    if (method === 'POST' && pathname === '/task-complete') {
      return handleTaskComplete(request, env)
    }

    return errorResponse('Not Found', 404)
  },
} satisfies ExportedHandler<Env>
