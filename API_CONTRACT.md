# Adcrea API Contract

## Base URL
`/api/v1`

## Auth
- `POST /api/v1/auth/signup` — `{ email, password, name }` → `{ token, user }`
- `POST /api/v1/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/v1/auth/me` — `Authorization: Bearer <token>` → `{ user, plan, usage }`

## Assets
- `POST /api/v1/assets/upload` — multipart form: `file` (product photo), `name` → `{ asset_id, url }`
- `POST /api/v1/assets/generate` — `{ asset_id, formats: ["static_ad", "video_ad", "product_photo", "ugc", "faceless_video"], platforms: ["facebook", "google", "amazon", "shopify", "tiktok", "instagram"] }` → `{ outputs: [{ format, platform, url, dimensions }] }`
- `GET /api/v1/assets` — list all user assets → `{ assets: [...] }`
- `GET /api/v1/assets/:id` — single asset detail
- `DELETE /api/v1/assets/:id` — delete asset

## Plans & Billing
- `GET /api/v1/plans` — list plans → `{ plans: [{ id, name, price, exports, features }] }`
- `POST /api/v1/subscribe` — `{ plan_id, payment_method_id }` → `{ status, subscription }`
- `POST /api/v1/webhooks/stripe` — Stripe event handler

## Usage
- `GET /api/v1/usage` — current month usage count and limit

## Response Format
Always: `{ ok: boolean, data?: any, error?: string }`