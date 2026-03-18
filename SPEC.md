# Project Spec: LINE Task Notification Backend

## 1. Goal
Build a backend service that sends LINE push notifications when an application task is completed.

## 2. Scope
### In Scope
- Receive task completion events
- Send LINE push messages
- Receive LINE webhook events
- Extract and store LINE userId
- Expose health check endpoint
- Use environment secrets for sensitive credentials

### Out of Scope
- Frontend dashboard
- Full account linking UI
- Multi-tenant architecture
- Advanced message templates
- Full admin panel

## 3. Tech Stack
- Cloudflare Workers
- JavaScript or TypeScript
- Wrangler for local development and deployment
- LINE Messaging API
- Storage: Cloudflare KV (namespace binding: `NOTIFICATION_KV`)

## 4. Architecture

### Data Model (KV)
| Key | Value | Description |
|-----|-------|-------------|
| `line:user:<userId>` | LINE userId string | One entry per registered user |

### Flow
1. User adds LINE Official Account as friend → bot 回覆歡迎訊息與 User ID
2. User 傳送「我的ID」→ bot 回覆 User ID
3. User 將 User ID 提供給應用端
4. LINE sends webhook event to `POST /line/webhook`
5. Backend extracts `source.userId` from `follow` or `message` events and saves to KV
6. Application sends `POST /task-complete` with Bearer token auth, optionally specifying `userId`
7. Backend sends LINE push message to the specified user (or broadcasts to all)

## 5. API Endpoints

### `GET /health`
- Auth: None
- Response: `{ "success": true }`

### `POST /line/webhook`
- Auth: None (Phase 2: LINE signature verification via `LINE_CHANNEL_SECRET`)
- Body: LINE webhook event payload
- Behavior:
  - `follow` event → 儲存 userId，回覆歡迎訊息與 User ID
  - `message` event, text = `我的ID` → 回覆 User ID
  - `message` event, other text → 回覆可用指令說明
- Response: `{ "success": true }`

### `POST /task-complete`
- Auth: `Authorization: Bearer <TASK_API_KEY>`
- Body (optional):
  ```json
  {
    "userId": "U1234...",
    "source": "CI/CD",
    "message": "自訂通知訊息"
  }
  ```
  - `userId` — 指定通知對象，不帶則群發給所有已註冊使用者
  - `source` — 應用來源名稱，會加在訊息前綴 `[CI/CD] ...`
  - `message` — 通知內容，預設 `"任務已完成"`
- Success response: `{ "success": true, "data": { "sent": 1 } }`
- Error responses:
  - `401` — Missing or invalid API key
  - `400` — User not found / no users registered
  - `502` — LINE API call failed

## 6. Environment Variables
- `LINE_CHANNEL_ACCESS_TOKEN` — LINE Messaging API token
- `TASK_API_KEY` — Bearer token for `/task-complete` authentication
- `LINE_CHANNEL_SECRET` — For webhook signature verification (Phase 2)

## Coding Rules
- Use TypeScript if possible
- Keep handlers thin, move logic into services
- All responses must be JSON
- Do not hardcode secrets
- Add comments only where necessary
- Prefer small reusable helper functions