# Merrytext Backend — Frontend Integration Guide

This document lists all available HTTP endpoints that the frontend may integrate with. Each entry includes the HTTP method, path, authentication notes, request payload (if any), response shape and usage notes.

Base URL prefix for all endpoints in this repo:

`/merrytext/api/v1/`

---

## Message endpoints

1. Create message

- Method: POST
- Path: `/merrytext/api/v1/message/create`
- Auth: requires an authenticated user (controller method has `@AuthenticationPrincipal User user`).
- Request body (JSON): CreateMessageRequest

Example fields (from controller usage):

```
{
  "ownerEmail": "owner@example.com",
  "ownerUsername": "owner_username",
  "templateType": "BIRTHDAY",    // enum name or string depending on backend
  "personalizedText": "Happy birthday!",
  "mediaUrls": ["https://.../img.jpg"],
  "mediaType": "image"            // e.g. "image", "video"
}
```

- Response: ApiResponse wrapping a Map with keys: `message` (message object), `uniqueUrl` (string), `shareableUrl` (string), `shareableText` (string), `remainingCoins` (number).

Notes:

- On success the API returns a JSON object: `{ success: true, data: { ... } }` (the project uses an `ApiResponse` wrapper). Handle the `data` field in the frontend.

2. View message

- Method: GET
- Path: `/merrytext/api/v1/message/view/{messageUrl}`
- Auth: public (no authentication annotation in controller)
- Path params: `messageUrl` — unique part of the message URL
- Response: ApiResponse wrapping a Map with keys: `message` (message object), `messageUrl`, `status` (e.g. "active"), `shareOptions` (array of strings), `shareableUrl`, `qrCodeUrl`.

Notes:

- The backend increments `timesOpened` when this endpoint is called. Use this endpoint to render the message view, and the returned `shareableUrl` and `qrCodeUrl` to populate share UI.

3. Edit message

- Method: PUT
- Path: `/merrytext/api/v1/message/edit/{messageUrl}`
- Auth: controller does not require `@AuthenticationPrincipal` (so appears public). Confirm with backend owner if this should require authentication.
- Path params: `messageUrl`
- Request body (JSON): EditMessageRequest

Example fields:

```
{
  "templateType": "BIRTHDAY",
  "personalizedText": "Updated text",
  "mediaUrls": ["https://.../new.jpg"],
  "mediaType": "image"
}
```

- Response: ApiResponse wrapping a Map with keys: `message`, `messageUrl`, `shareableUrl`, `status` (e.g. "updated").

---

## Payment endpoints

1. Create Checkout Session (start payment)

- Method: POST
- Path: `/merrytext/api/v1/payment/create-checkout-session`
- Auth: no `@AuthenticationPrincipal` on controller method — the request must include `ownerUsername` and `ownerEmail` in the body
- Request body (JSON): PaymentRequest

Example fields:

```
{
  "ownerUsername": "owner_username",
  "ownerEmail": "owner@example.com",
  "amount": 1000,
  "coins": 100,
  "priceId": "price_..."    // optional depending on Stripe setup
}
```

- Response: ApiResponse wrapping a Map (contains checkout session info/URLs) used by frontend to redirect to Stripe Checkout.

Notes:

- Backend validates presence of `ownerUsername` and `ownerEmail` and may throw `400` with an error message.

2. Stripe webhook (server-to-server)

- Method: POST
- Path: `/merrytext/api/v1/payment/webhook`
- Auth: none — Stripe posts here. The server verifies signature with `Stripe-Signature` header and a webhook secret on the backend (`stripe.webhook.secret`).
- Request: raw webhook payload (string) — frontend does not call this.
- Response: plain text `Success` or error message.

Notes:

- Frontend does not call this endpoint. Ensure Stripe is configured to call this URL from the Stripe Dashboard.

---

## Stats & Achievements

1. Get user stats

- Method: GET
- Path: `/merrytext/api/v1/stats/user/{username}`
- Auth: public (no authentication annotation)
- Path params: `username`
- Response: ApiResponse<UserStatsResponse>

Key fields included in `UserStatsResponse` (from controller assembly):

- `userId`, `name`, `merryCoins`, `totalXp`, `level`, `xpToNextLevel`, `progressToNextLevel`,
  `totalMessagesSent`, `totalMessagesViewed`, `totalCoinsEarned`, `totalCoinsSpent`,
  `uniqueRecipients`, `currentStreak`, `longestStreak`.

2. Get user achievements

- Method: GET
- Path: `/merrytext/api/v1/stats/achievements/{username}`
- Auth: public
- Path params: `username`
- Response: ApiResponse<List<AchievementResponse>> where each AchievementResponse includes: `id`, `name`, `description`, `icon`, `unlocked` (boolean), `progress`, `total`, `category`, `xpReward`.

3. Get leaderboard

- Method: GET
- Path: `/merrytext/api/v1/stats/leaderboard`
- Query params (optional): `sortBy` (default: `xp`), `limit` (default: `10`)
- Response: ApiResponse<List<Map<String,Object>>> — placeholder structure includes `rank`, `username`, `level`, `totalXp`.

---

## User endpoints

1. Get all users

- Method: GET
- Path: `/merrytext/api/v1/user/all`
- Auth: public
- Response: HTTP 200 with a JSON array of `User` objects (no `ApiResponse` wrapper used here; controller returns `ResponseEntity<List<User>>`).

2. Get user by username

- Method: GET
- Path: `/merrytext/api/v1/user/{username}`
- Auth: public
- Response: single `User` object (controller method returns `User` directly).

---

## General notes for frontend integration

- All controller endpoints under `merrytext/api/v1/...` follow these patterns. Some controllers use the project's `ApiResponse<T>` wrapper; inspect responses and always look for a top-level `success`/`data` or `error` object. Specifically, Message, Payment, and Stats controllers return `ApiResponse` while `UserController` returns raw `User` objects.
- Error cases: controllers typically return `400 Bad Request` on validation errors with `ApiResponse.error(message)`. The frontend should handle non-2xx responses and show error messages from the response body.
- Authentication: where controller method includes `@AuthenticationPrincipal User user` (currently only `POST /message/create`), you must include the authenticated session (e.g. cookie or Authorization header with JWT) so Spring Security can populate the principal. Confirm with backend which auth scheme is used (JWT bearer or session cookie).
- Content type: send `Content-Type: application/json` for POST/PUT requests.
- Stripe Payment: for `create-checkout-session` the backend returns session info — the frontend should redirect to the session URL or use Stripe.js as instructed by the returned data.

## Example responses (simplified)

1. Successful ApiResponse wrapper

```
{
  "success": true,
  "data": { ... }
}
```

2. Error

```
{
  "success": false,
  "error": "error message"
}
```

---

If you'd like, I can also:

- Add sample TypeScript API client functions for each endpoint (fetch/axios wrappers).
- Provide example UI flows for create-message, view-message, and payment checkout.

Last updated: 2025-11-07
