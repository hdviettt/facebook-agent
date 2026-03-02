# Facebook Messenger AI Agent

AI-powered customer service chatbot on Facebook Messenger. Answers product questions and creates orders on Nhanh.vn.

## Architecture

```
Customer (Messenger) --> Facebook Platform --> Express Server --> AI (OpenRouter)
                                                                      |
                                                        +-------------+-------------+
                                                        |                           |
                                                   Supabase                    Nhanh.vn
                                                  (products,                  (orders)
                                                   history)
```

## Tech Stack

- Node.js + TypeScript + Express
- OpenRouter (OpenAI-compatible) for AI with tool use
- Supabase (PostgreSQL) for products, conversations, orders
- Nhanh.vn API v3.0 for order management
- Deployed on Railway

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in all values (see Environment Variables below)
```

### 3. Set up Supabase

Create a Supabase project, then run the SQL migrations in `supabase/setup.md`.

### 4. Connect Facebook

1. Create a Facebook App at developers.facebook.com
2. Add the Messenger product
3. Generate a Page Access Token
4. Configure the webhook:
   - Callback URL: `https://<your-domain>/webhook`
   - Verify Token: same as `FB_VERIFY_TOKEN` in your env
5. Subscribe to `messages` and `messaging_postbacks` events

### 5. Connect Nhanh.vn

1. Register an app at https://open.nhanh.vn
2. Set redirect URL to `https://<your-domain>/nhanh/callback`
3. Set `NHANH_APP_ID` and `NHANH_SECRET_KEY` in env
4. Visit `https://<your-domain>/nhanh/connect` to complete OAuth
5. Copy the returned `NHANH_ACCESS_TOKEN` and `NHANH_BUSINESS_ID` to env

### 6. Sync products to Nhanh.vn

```bash
npx tsx src/scripts/sync-products-to-nhanh.ts
```

### 7. Run

```bash
npm run dev    # development
npm run build  # compile
npm start      # production
```

## Environment Variables

| Variable | Description |
|---|---|
| `FB_PAGE_ACCESS_TOKEN` | Facebook Page Access Token |
| `FB_VERIFY_TOKEN` | Webhook verification token (you choose) |
| `FB_APP_SECRET` | Facebook App Secret |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `AI_MODEL` | Model ID (default: `anthropic/claude-sonnet-4`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `NHANH_APP_ID` | Nhanh.vn app ID |
| `NHANH_SECRET_KEY` | Nhanh.vn app secret key |
| `NHANH_BUSINESS_ID` | Nhanh.vn business ID |
| `NHANH_ACCESS_TOKEN` | Nhanh.vn OAuth access token |

## AI Tools

The chatbot has 4 tools it can use during conversations:

| Tool | Description |
|---|---|
| `search_products` | Search products by name/keyword from Supabase |
| `get_product_details` | Get full details of a product by ID |
| `check_inventory` | Check stock availability |
| `create_order` | Create an order on Nhanh.vn (collects name, phone, address first) |

## Project Structure

```
src/
  index.ts              # Express entry point
  config/               # Environment validation, logger
  routes/               # Webhook, health, Nhanh OAuth routes
  controllers/          # Webhook event handler
  services/
    ai.service.ts       # AI with tool-use loop (OpenRouter)
    facebook.service.ts # Messenger Send API
    nhanh.service.ts    # Nhanh.vn API client
    supabase.service.ts # Database operations
  tools/                # AI tool definitions and handlers
  types/                # TypeScript interfaces
  utils/                # Rate limiter, order ID generator
  scripts/              # Product sync script
```
