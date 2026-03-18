# LINE Task Notification Service

Cloudflare Workers 後端服務，當應用任務完成時透過 LINE 推播通知。

## 功能

- 接收 LINE webhook 事件，自動註冊使用者
- 使用者傳送 `myid` 查詢自己的 User ID
- 支援指定使用者或群發推播通知
- 訊息支援來源前綴（如 `[CI/CD] Build 完成`）

## Tech Stack

- Cloudflare Workers
- TypeScript
- Cloudflare KV
- LINE Messaging API

## 設定手順

### 1. 安裝依賴

```bash
npm install
```

### 2. 登入 Cloudflare

```bash
npx wrangler login
```

### 3. 建立 KV Namespace

```bash
npx wrangler kv namespace create NOTIFICATION_KV
```

將回傳的 Namespace ID 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "NOTIFICATION_KV"
id = "你的 Namespace ID"
```

### 4. 設定 LINE Channel

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 建立或選擇 Messaging API Channel
3. 在 **Messaging API** 分頁取得 **Channel access token**（按 Issue 產生）

### 5. 設定 Secrets

```bash
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put TASK_API_KEY
```

- `LINE_CHANNEL_ACCESS_TOKEN`：從 LINE Developers Console 取得
- `TASK_API_KEY`：自行產生，用於 API 認證（可用 `openssl rand -hex 32`）

### 6. 部署

```bash
npm run deploy
```

### 7. 設定 LINE Webhook

1. 回到 LINE Developers Console → Messaging API 分頁
2. **Webhook URL** 填入：`https://<你的Worker>.workers.dev/line/webhook`
3. 打開 **Use webhook** 開關

## API

### `GET /health`

健康檢查。

```bash
curl https://<YOUR_URL>/health
```

### `POST /line/webhook`

接收 LINE 事件。由 LINE 平台呼叫，不需手動操作。

### `POST /task-complete`

發送推播通知。

```bash
curl -X POST https://<YOUR_URL>/task-complete \
  -H "Authorization: Bearer <TASK_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234...",
    "source": "CI/CD",
    "message": "Build #42 完成"
  }'
```

| 欄位 | 必填 | 說明 |
|------|------|------|
| `userId` | 否 | 指定通知對象，不帶則群發所有使用者 |
| `source` | 否 | 來源名稱，加在訊息前綴 `[source]` |
| `message` | 否 | 通知內容，預設「任務已完成」 |

## 使用者取得 User ID

1. 加 LINE Bot 好友
2. 傳送 `myid`
3. Bot 回覆 User ID
4. 將 User ID 提供給應用端

## 開發

```bash
npm run dev       # 本地開發
npm test          # 執行測試
npm run deploy    # 部署
```
