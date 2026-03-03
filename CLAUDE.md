# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (tsx watch, auto-reload)
- **Build:** `npm run build` (tsc → dist/)
- **Start production:** `npm start` (runs dist/index.js)
- **Seed products:** `npm run seed`
- **No test/lint scripts configured**

## Architecture

Facebook Messenger AI chatbot for Vietnamese customer service. Customers message a Facebook Page → webhook receives events → AI (Claude via OpenRouter) processes with tool-use loop → responds via Send API.

```
Customer → Messenger → Express webhook → OpenRouter AI (tool loop) → Supabase / Nhanh.vn
```

### Request Flow

1. Facebook POST → signature validated (HMAC-SHA256) → 200 response sent immediately (Facebook requires <20s)
2. Messages processed **asynchronously** after response, with per-user locking to prevent race conditions
3. AI runs tool-use loop (max 10 iterations) until it produces a text response
4. Response sent back via Facebook Send API (auto-split at 2000 chars, markdown stripped)

### Key Services

- **`src/services/ai.service.ts`** — OpenRouter client (OpenAI SDK with custom base URL). Tool-use loop, per-sender conversation history (Map, max 20 messages).
- **`src/services/facebook.service.ts`** — Graph API v21.0. Webhook verification, signature validation, message parsing (text/quick_reply/postback), typing indicators, markdown stripping.
- **`src/services/nhanh.service.ts`** — Nhanh.vn API v3.0 client. Rate limited (150 req/30s sliding window). Auth: `Authorization: {accessToken}` header + `appId`/`businessId` query params.
- **`src/services/supabase.service.ts`** — Lazy-initialized Supabase client. Product search (ilike), stock management, order storage.

### AI Tools (src/tools/)

Four tools exposed to Claude: `search_products`, `get_product_details`, `check_inventory`, `create_order`. Tool definitions in `definitions.ts`, handler registry in `index.ts`, implementations in individual files. The `create_order` tool receives `senderId` as extra context.

### Routes

- `GET /health` — health check
- `GET /webhook` — Facebook verification handshake
- `POST /webhook` — message event processing
- `GET /nhanh/connect` + `/nhanh/callback` — Nhanh.vn OAuth flow

### Database (Supabase)

Three tables: `products` (with `nhanh_id` foreign key to Nhanh.vn), `conversations` (chat history by `sender_id`), `orders` (with `app_order_id` format `FB_timestamp_uuid`, JSONB `order_data`). Migrations in `supabase/migrations/`.

## Conventions

- **ES Modules** — `"type": "module"` in package.json, `NodeNext` module resolution
- **System prompt is Vietnamese** — casual tone ("bạn"/"mình"), no emojis, no markdown formatting, prices in VND (e.g., 189.000d), responses under 500 chars
- **Zod v4** (not v3) — `z.coerce.number()` syntax is available
- **Express 5** — uses v5.2.1
- **Environment validation** — `src/config/env.ts` validates all env vars with Zod on startup
- **Logging** — Pino with pino-pretty
