# MerryText Backend API Documentation

> **Version:** 1.0.0  
> **Tech Stack:** Node.js, Express.js, MongoDB, Mongoose, Stripe  
> **Last Updated:** November 8, 2025

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Standard Response Format](#standard-response-format)
- [API Endpoints](#api-endpoints)
  - [Message Endpoints](#message-endpoints)
  - [Payment Endpoints](#payment-endpoints)
  - [Stats & Achievements Endpoints](#stats--achievements-endpoints)
  - [User Endpoints](#user-endpoints)
- [Error Handling](#error-handling)
- [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

This document provides comprehensive documentation for the MerryText backend API. The API enables users to create personalized digital greeting messages, manage user profiles, process payments for virtual coins (MerryCoins), track user statistics, and manage achievements.

**Key Features:**

- Create and share personalized greeting messages
- Virtual currency (MerryCoins) system with Stripe integration
- User leveling and XP system
- Achievement tracking and leaderboards
- Message analytics and engagement tracking

---

## Base URL

All API endpoints use the following base URL:

```
/merrytext/api/v1
```

**Example:** `https://your-domain.com/merrytext/api/v1/message/create`

---

## Authentication

The API uses JWT (JSON Web Token) based authentication for protected endpoints.

**Authentication Methods:**

- **Bearer Token:** Include JWT in the `Authorization` header
  ```
  Authorization: Bearer <your-jwt-token>
  ```
- **Protected Routes:** Currently, authentication is optional for most routes. Check individual endpoint documentation for specific requirements.

**Note:** The authentication middleware is available but not enforced on most routes in the current implementation. Future updates may require authentication for sensitive operations.

---

## Standard Response Format

All API responses follow a consistent structure using the `ApiResponse` wrapper class.

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data object
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Optional: Validation errors or additional error details
  }
}
```

### HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (resource created)
- `400 Bad Request` - Invalid request parameters or validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## API Endpoints

---

## Message Endpoints

### 1. Create Message

Create a new personalized greeting message.

- **Method:** `POST`
- **Path:** `/merrytext/api/v1/message/create`
- **Authentication:** Optional (no middleware enforced)
- **Cost:** 1 MerryCoin per message

**Request Body:**

```json
{
  "ownerEmail": "user@example.com",
  "ownerUsername": "johndoe",
  "templateType": "BIRTHDAY",
  "personalizedText": "Happy Birthday! Wishing you all the best!",
  "mediaUrls": ["https://example.com/image.jpg"],
  "mediaType": ["image"]
}
```

**Request Fields:**

| Field              | Type     | Required | Description                                         |
| ------------------ | -------- | -------- | --------------------------------------------------- |
| `ownerEmail`       | string   | Yes      | Email address of the message creator                |
| `ownerUsername`    | string   | Yes      | Username of the message creator                     |
| `templateType`     | string   | Yes      | Message template type (e.g., "BIRTHDAY", "WEDDING") |
| `personalizedText` | string   | Yes      | Custom message text                                 |
| `mediaUrls`        | string[] | No       | Array of media URLs (images/videos)                 |
| `mediaType`        | string[] | No       | Array of media types corresponding to URLs          |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439011",
      "ownerEmail": "user@example.com",
      "ownerUsername": "johndoe",
      "templateType": "BIRTHDAY",
      "personalizedText": "Happy Birthday! Wishing you all the best!",
      "mediaUrls": ["https://example.com/image.jpg"],
      "mediaType": ["image"],
      "messageUrl": "abc123xyz",
      "timesOpened": 0,
      "coinsSpent": 1,
      "createdAt": "2025-11-08T10:30:00.000Z",
      "updatedAt": "2025-11-08T10:30:00.000Z"
    },
    "uniqueUrl": "abc123xyz",
    "shareableUrl": "https://merrytext.com/view/abc123xyz",
    "shareableText": "Check out this message from johndoe: https://merrytext.com/view/abc123xyz",
    "remainingCoins": 99,
    "user": {
      "username": "johndoe",
      "name": "John Doe",
      "level": 2,
      "totalXp": 250,
      "merryCoins": 99,
      "stats": {
        "totalMessagesSent": 6,
        "totalMessagesViewed": 50,
        "totalCoinsEarned": 100,
        "totalCoinsSpent": 6,
        "uniqueRecipients": 4,
        "currentStreak": 3,
        "longestStreak": 7
      },
      "achievements": [
        {
          "achievementId": {
            "_id": "507f1f77bcf86cd799439020",
            "name": "First Message",
            "description": "Send your first festive message",
            "icon": "✨",
            "total": 1,
            "category": "messaging",
            "xpReward": 50
          },
          "progress": 1,
          "unlocked": true,
          "unlockedAt": "2025-11-08T09:00:00.000Z"
        }
      ]
    }
  }
}
```

**Note:** The response now includes the full user object with stats and populated achievements, providing complete context about the user's current state after the action.

**Error Responses:**

- `404 Not Found` - User not found
- `400 Bad Request` - Insufficient coins

---

### 2. View Message

Retrieve and display a message by its unique URL. This endpoint increments the view counter.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/message/view/:messageUrl`
- **Authentication:** Public (no authentication required)

**Path Parameters:**

| Parameter    | Type   | Description                   |
| ------------ | ------ | ----------------------------- |
| `messageUrl` | string | Unique message URL identifier |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439011",
      "ownerEmail": "user@example.com",
      "ownerUsername": "johndoe",
      "templateType": "BIRTHDAY",
      "personalizedText": "Happy Birthday!",
      "mediaUrls": ["https://example.com/image.jpg"],
      "mediaType": ["image"],
      "messageUrl": "abc123xyz",
      "timesOpened": 15,
      "coinsSpent": 1,
      "createdAt": "2025-11-08T10:30:00.000Z"
    },
    "messageUrl": "abc123xyz",
    "status": "active",
    "shareOptions": ["copy_link", "whatsapp", "email", "social_media"],
    "shareableUrl": "https://merrytext.com/view/abc123xyz",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://merrytext.com/view/abc123xyz"
  }
}
```

**Error Responses:**

- `404 Not Found` - Message not found

**Side Effects:**

- Increments `timesOpened` counter for the message
- Updates `totalMessagesViewed` in user stats

---

### 3. Edit Message

Update an existing message's content.

- **Method:** `PUT`
- **Path:** `/merrytext/api/v1/message/edit/:messageUrl`
- **Authentication:** Public (consider adding authentication in production)

**Path Parameters:**

| Parameter    | Type   | Description                   |
| ------------ | ------ | ----------------------------- |
| `messageUrl` | string | Unique message URL identifier |

**Request Body:**

```json
{
  "templateType": "ANNIVERSARY",
  "personalizedText": "Updated message text",
  "mediaUrls": ["https://example.com/new-image.jpg"],
  "mediaType": ["image"]
}
```

**Request Fields (all optional):**

| Field              | Type     | Description           |
| ------------------ | -------- | --------------------- |
| `templateType`     | string   | Updated template type |
| `personalizedText` | string   | Updated message text  |
| `mediaUrls`        | string[] | Updated media URLs    |
| `mediaType`        | string[] | Updated media types   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439011",
      "templateType": "ANNIVERSARY",
      "personalizedText": "Updated message text",
      "mediaUrls": ["https://example.com/new-image.jpg"],
      "mediaType": ["image"],
      "messageUrl": "abc123xyz",
      "updatedAt": "2025-11-08T11:00:00.000Z"
    },
    "messageUrl": "abc123xyz",
    "shareableUrl": "https://merrytext.com/view/abc123xyz",
    "status": "updated"
  }
}
```

**Error Responses:**

- `404 Not Found` - Message not found

---

### 4. Get User Messages

Retrieve all messages created by a specific user.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/message/user/:username`
- **Authentication:** Public

**Path Parameters:**

| Parameter  | Type   | Description             |
| ---------- | ------ | ----------------------- |
| `username` | string | Username of the creator |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "ownerUsername": "johndoe",
      "templateType": "BIRTHDAY",
      "personalizedText": "Happy Birthday!",
      "messageUrl": "abc123xyz",
      "timesOpened": 15,
      "createdAt": "2025-11-08T10:30:00.000Z"
    }
    // ... more messages
  ]
}
```

---

## Payment Endpoints

### 1. Create Checkout Session

Initialize a Stripe checkout session to purchase MerryCoins.

- **Method:** `POST`
- **Path:** `/merrytext/api/v1/payment/create-checkout-session`
- **Authentication:** Public (user identification via request body)

**Request Body:**

```json
{
  "ownerUsername": "johndoe",
  "ownerEmail": "user@example.com",
  "amount": 200,
  "coins": 30,
  "priceId": "price_1234567890"
}
```

**Request Fields:**

| Field           | Type    | Required | Description                                    |
| --------------- | ------- | -------- | ---------------------------------------------- |
| `ownerUsername` | string  | Yes      | Username of the purchaser                      |
| `ownerEmail`    | string  | Yes      | Email address of the purchaser                 |
| `amount`        | integer | Yes      | Amount in cents (e.g., 200 = $2.00)            |
| `coins`         | integer | Yes      | Number of coins to purchase                    |
| `priceId`       | string  | No       | Stripe price ID (optional, currently not used) |

**Coin Calculation:**

The backend uses the formula: `coins = (amount * 30) / 200`

- $2.00 (200 cents) = 30 coins
- $5.00 (500 cents) = 75 coins
- $10.00 (1000 cents) = 150 coins

**Success Response (200):**

```json
{
  "success": true,
  "message": "Checkout session created",
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6",
    "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6",
    "amount": 200,
    "coins": 30,
    "user": {
      "username": "johndoe",
      "name": "John Doe",
      "level": 2,
      "totalXp": 250,
      "merryCoins": 99,
      "stats": {
        "totalMessagesSent": 6,
        "totalMessagesViewed": 50,
        "totalCoinsEarned": 100,
        "totalCoinsSpent": 6,
        "uniqueRecipients": 4,
        "currentStreak": 3,
        "longestStreak": 7
      },
      "achievements": [
        {
          "achievementId": {
            "_id": "507f1f77bcf86cd799439020",
            "name": "First Message",
            "description": "Send your first festive message",
            "icon": "✨",
            "total": 1,
            "category": "messaging",
            "xpReward": 50
          },
          "progress": 1,
          "unlocked": true,
          "unlockedAt": "2025-11-08T09:00:00.000Z"
        }
      ]
    }
  }
}
```

**Note:** The response includes the full user object with current stats and populated achievements.

**Usage:**

Redirect the user to the `url` in the response to complete payment via Stripe Checkout.

**Error Responses:**

- `400 Bad Request` - Missing username, email, or invalid amount
- `404 Not Found` - User not found
- `500 Internal Server Error` - Stripe API error

---

### 2. Stripe Webhook

Handle Stripe webhook events (server-to-server communication).

- **Method:** `POST`
- **Path:** `/merrytext/api/v1/payment/webhook`
- **Authentication:** Stripe signature verification
- **Content-Type:** `application/json` (raw body)

**Headers:**

```
Stripe-Signature: <stripe-signature>
```

**Webhook Events Handled:**

- `checkout.session.completed` - Payment successful, coins added to user account

**Success Response (200):**

```json
{
  "received": true
}
```

**Error Responses:**

- `400 Bad Request` - Invalid signature or malformed payload
- `500 Internal Server Error` - Failed to process payment

**Important Notes:**

- This endpoint is called by Stripe servers, not by the frontend
- Configure the webhook URL in the Stripe Dashboard
- Webhook secret must be set in environment variable `STRIPE_WEBHOOK_SECRET`
- Transactions are created with "pending" status and updated to "completed" after verification

**Side Effects:**

- Adds purchased coins to user's `merryCoins` balance
- Updates transaction status from "pending" to "completed"
- Updates `totalCoinsEarned` in user stats

---

## Stats & Achievements Endpoints

### 1. Get User Stats

Retrieve comprehensive statistics for a user.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/stats/user/:username`
- **Authentication:** Public

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `username` | string | Username    |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "merryCoins": 150,
    "totalXp": 2500,
    "level": 8,
    "xpToNextLevel": 500,
    "progressToNextLevel": 0.75,
    "totalMessagesSent": 42,
    "totalMessagesViewed": 687,
    "totalCoinsEarned": 200,
    "totalCoinsSpent": 50,
    "uniqueRecipients": 15,
    "currentStreak": 7,
    "longestStreak": 14
  }
}
```

**Response Fields:**

| Field                 | Type    | Description                             |
| --------------------- | ------- | --------------------------------------- |
| `userId`              | string  | MongoDB ObjectId of the user            |
| `name`                | string  | User's display name                     |
| `merryCoins`          | integer | Current MerryCoin balance               |
| `totalXp`             | integer | Total experience points earned          |
| `level`               | integer | Current user level                      |
| `xpToNextLevel`       | integer | XP required to reach next level         |
| `progressToNextLevel` | float   | Progress percentage (0.0 to 1.0)        |
| `totalMessagesSent`   | integer | Total messages created by user          |
| `totalMessagesViewed` | integer | Total views across all user messages    |
| `totalCoinsEarned`    | integer | Lifetime coins earned (purchases)       |
| `totalCoinsSpent`     | integer | Lifetime coins spent (message creation) |
| `uniqueRecipients`    | integer | Number of unique message recipients     |
| `currentStreak`       | integer | Current daily activity streak           |
| `longestStreak`       | integer | Longest daily activity streak           |

**Error Responses:**

- `404 Not Found` - User not found

**Note:** If user stats don't exist, they are automatically created with default values.

---

### 2. Get User Achievements

Retrieve all achievements for a user, including locked and unlocked achievements.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/stats/achievements/:username`
- **Authentication:** Public

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `username` | string | Username    |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "First Message",
      "description": "Send your first MerryText message",
      "icon": "🎉",
      "unlocked": true,
      "progress": 1,
      "total": 1,
      "category": "messages",
      "xpReward": 50,
      "unlockedAt": "2025-11-08T10:30:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Social Butterfly",
      "description": "Send 10 messages",
      "icon": "🦋",
      "unlocked": false,
      "progress": 5,
      "total": 10,
      "category": "messages",
      "xpReward": 200,
      "unlockedAt": null
    }
    // ... more achievements
  ]
}
```

**Achievement Object Fields:**

| Field         | Type    | Description                           |
| ------------- | ------- | ------------------------------------- |
| `id`          | string  | Achievement ID                        |
| `name`        | string  | Achievement name                      |
| `description` | string  | Achievement description               |
| `icon`        | string  | Achievement icon (emoji or URL)       |
| `unlocked`    | boolean | Whether user has unlocked this        |
| `progress`    | integer | Current progress toward achievement   |
| `total`       | integer | Total required to unlock              |
| `category`    | string  | Achievement category                  |
| `xpReward`    | integer | XP awarded when unlocked              |
| `unlockedAt`  | string  | ISO timestamp when unlocked (or null) |

**Error Responses:**

- `404 Not Found` - User not found

---

### 3. Get Leaderboard

Retrieve the top users ranked by XP, level, or coins.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/stats/leaderboard`
- **Authentication:** Public

**Query Parameters:**

| Parameter | Type    | Required | Default | Description                                      |
| --------- | ------- | -------- | ------- | ------------------------------------------------ |
| `sortBy`  | string  | No       | `xp`    | Sort field: `xp`, `coins`, or `level`            |
| `limit`   | integer | No       | `10`    | Number of users to return (max recommended: 100) |

**Example Request:**

```
GET /merrytext/api/v1/stats/leaderboard?sortBy=xp&limit=20
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "rank": 1,
      "username": "topuser123",
      "name": "Top User",
      "level": 25,
      "totalXp": 15000,
      "merryCoins": 500,
      "profilePicture": "https://example.com/avatar.jpg"
    },
    {
      "rank": 2,
      "username": "secondplace",
      "name": "Second Place",
      "level": 22,
      "totalXp": 12000,
      "merryCoins": 350,
      "profilePicture": null
    }
    // ... more users
  ]
}
```

**Leaderboard Entry Fields:**

| Field            | Type    | Description                       |
| ---------------- | ------- | --------------------------------- |
| `rank`           | integer | Position on leaderboard (1-based) |
| `username`       | string  | Username                          |
| `name`           | string  | Display name                      |
| `level`          | integer | User level                        |
| `totalXp`        | integer | Total XP                          |
| `merryCoins`     | integer | Current coin balance              |
| `profilePicture` | string  | Profile picture URL (or null)     |

---

## User Endpoints

### 1. Get All Users

Retrieve a list of all registered users.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/user/all`
- **Authentication:** Public

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user1@example.com",
      "username": "user1",
      "name": "User One",
      "authProvider": "email",
      "merryCoins": 100,
      "totalXp": 500,
      "level": 3,
      "profilePicture": null,
      "stats": {
        "totalMessagesSent": 5,
        "totalMessagesViewed": 20,
        "totalCoinsEarned": 100,
        "totalCoinsSpent": 5,
        "uniqueRecipients": 3,
        "currentStreak": 2,
        "longestStreak": 5
      },
      "achievements": [
        {
          "achievementId": {
            "_id": "507f1f77bcf86cd799439020",
            "name": "First Message",
            "description": "Send your first festive message",
            "icon": "✨",
            "total": 1,
            "category": "messaging",
            "xpReward": 50
          },
          "progress": 1,
          "unlocked": true,
          "unlockedAt": "2025-11-01T10:30:00.000Z"
        }
      ],
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-08T10:00:00.000Z"
    }
    // ... more users
  ]
}
```

**Note:** Password field is excluded. Stats and achievements are included with full achievement details populated.

---

### 2. Get User by Username

Retrieve detailed information about a specific user.

- **Method:** `GET`
- **Path:** `/merrytext/api/v1/user/:username`
- **Authentication:** Public

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `username` | string | Username    |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "johndoe@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "authProvider": "email",
    "merryCoins": 150,
    "totalXp": 2500,
    "level": 8,
    "profilePicture": "https://example.com/avatar.jpg",
    "stats": {
      "totalMessagesSent": 42,
      "totalMessagesViewed": 687,
      "totalCoinsEarned": 200,
      "totalCoinsSpent": 50,
      "uniqueRecipients": 15,
      "currentStreak": 7,
      "longestStreak": 14
    },
    "achievements": [
      {
        "achievementId": {
          "_id": "507f1f77bcf86cd799439020",
          "name": "First Message",
          "description": "Send your first festive message",
          "icon": "✨",
          "total": 1,
          "category": "messaging",
          "xpReward": 50
        },
        "progress": 1,
        "unlocked": true,
        "unlockedAt": "2025-10-01T10:30:00.000Z"
      },
      {
        "achievementId": {
          "_id": "507f1f77bcf86cd799439021",
          "name": "Social Butterfly",
          "description": "Send messages to 10 different people",
          "icon": "🎯",
          "total": 10,
          "category": "social",
          "xpReward": 100
        },
        "progress": 10,
        "unlocked": true,
        "unlockedAt": "2025-10-15T14:20:00.000Z"
      }
    ],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-11-08T10:00:00.000Z"
  }
}
```

**Note:** Includes embedded stats and achievements with full achievement details populated.

**Error Responses:**

- `404 Not Found` - User with username not found

---

### 3. Register User

Create a new user account.

- **Method:** `POST`
- **Path:** `/merrytext/api/v1/user/register`
- **Authentication:** Public

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "name": "New User",
  "password": "securePassword123",
  "authProvider": "email"
}
```

**Request Fields:**

| Field          | Type   | Required | Description                                       |
| -------------- | ------ | -------- | ------------------------------------------------- |
| `email`        | string | Yes      | User email (must be unique)                       |
| `username`     | string | Yes      | Username (must be unique)                         |
| `name`         | string | Yes      | User's display name                               |
| `password`     | string | Yes      | User password (hashed before storage)             |
| `authProvider` | string | No       | Auth method: "email", "google" (default: "email") |

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "username": "newuser",
    "name": "New User",
    "authProvider": "email",
    "merryCoins": 100,
    "totalXp": 0,
    "level": 1,
    "stats": {
      "totalMessagesSent": 0,
      "totalMessagesViewed": 0,
      "totalCoinsEarned": 0,
      "totalCoinsSpent": 0,
      "uniqueRecipients": 0,
      "currentStreak": 0,
      "longestStreak": 0
    },
    "achievements": [
      {
        "achievementId": {
          "_id": "507f1f77bcf86cd799439020",
          "name": "First Message",
          "description": "Send your first festive message",
          "icon": "✨",
          "total": 1,
          "category": "messaging",
          "xpReward": 50
        },
        "progress": 0,
        "unlocked": false
      },
      {
        "achievementId": {
          "_id": "507f1f77bcf86cd799439021",
          "name": "Social Butterfly",
          "description": "Send messages to 10 different people",
          "icon": "🎯",
          "total": 10,
          "category": "social",
          "xpReward": 100
        },
        "progress": 0,
        "unlocked": false
      }
      // ... all achievements initialized
    ],
    "createdAt": "2025-11-08T10:00:00.000Z"
  }
}
```

**Default Values on Registration:**

- `merryCoins`: 100 (starting bonus)
- `totalXp`: 0
- `level`: 1
- `stats`: All counters initialized to 0
- `achievements`: All achievements automatically linked with 0 progress

**Error Responses:**

- `400 Bad Request` - User with email or username already exists

---

### 4. Update User Profile

Update user profile information.

- **Method:** `PUT`
- **Path:** `/merrytext/api/v1/user/:username`
- **Authentication:** Required (JWT Bearer token)

**Path Parameters:**

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `username` | string | Username    |

**Request Body (all fields optional):**

```json
{
  "name": "Updated Name",
  "profilePicture": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio text"
}
```

**Protected Fields:**

The following fields cannot be updated through this endpoint for security reasons:

- `password`
- `merryCoins`
- `totalXp`
- `level`

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "name": "Updated Name",
    "profilePicture": "https://example.com/new-avatar.jpg",
    "bio": "Updated bio text",
    "updatedAt": "2025-11-08T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - User not found

---

## Error Handling

### Error Response Structure

All errors follow the standard ApiResponse format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": {
    // Optional: Additional error details
  }
}
```

### Common Error Scenarios

#### 1. Validation Errors (400)

```json
{
  "success": false,
  "message": "Amount must be greater than 0"
}
```

#### 2. Resource Not Found (404)

```json
{
  "success": false,
  "message": "User not found"
}
```

#### 3. Insufficient Resources (400)

```json
{
  "success": false,
  "message": "Insufficient coins"
}
```

#### 4. Server Errors (500)

```json
{
  "success": false,
  "message": "Failed to create checkout session: <error details>"
}
```

---

## Frontend Integration Guide

### Best Practices

#### 1. Always Check Response Structure

```javascript
const response = await fetch("/merrytext/api/v1/user/johndoe");
const json = await response.json();

if (json.success) {
  // Handle successful response
  const userData = json.data;
} else {
  // Handle error
  console.error(json.message);
}
```

#### 2. Handle HTTP Status Codes

```javascript
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message || "Request failed");
}
```

#### 3. Set Content-Type Header

```javascript
fetch("/merrytext/api/v1/message/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // 'Authorization': 'Bearer <token>' // If auth required
  },
  body: JSON.stringify({
    ownerEmail: "user@example.com",
    ownerUsername: "johndoe",
    templateType: "BIRTHDAY",
    personalizedText: "Happy Birthday!",
  }),
});
```

#### 4. Handle Stripe Payment Flow

```javascript
// 1. Create checkout session
const response = await fetch(
  "/merrytext/api/v1/payment/create-checkout-session",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerUsername: "johndoe",
      ownerEmail: "user@example.com",
      amount: 500, // $5.00
      coins: 75,
    }),
  }
);

const { data } = await response.json();

// 2. Redirect to Stripe checkout
if (data.url) {
  window.location.href = data.url;
}
```

### Example API Client (TypeScript)

```typescript
class MerryTextAPI {
  private baseURL = "/merrytext/api/v1";

  async createMessage(data: CreateMessageRequest): Promise<MessageResponse> {
    const response = await fetch(`${this.baseURL}/message/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  }

  async getUserStats(username: string): Promise<UserStats> {
    const response = await fetch(`${this.baseURL}/stats/user/${username}`);
    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  }

  async getLeaderboard(sortBy: "xp" | "coins" | "level" = "xp", limit = 10) {
    const response = await fetch(
      `${this.baseURL}/stats/leaderboard?sortBy=${sortBy}&limit=${limit}`
    );
    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  }
}
```

### Environment Variables Required

Configure these environment variables in your backend `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/merrytext

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT (if implementing auth)
JWT_SECRET=your-secret-key

# Server
PORT=5000
NODE_ENV=development
```

### CORS Configuration

Ensure your frontend domain is whitelisted in the backend CORS configuration to avoid cross-origin issues.

---

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [MongoDB Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Express.js Documentation](https://expressjs.com/)

---

**For questions or issues, please contact the MerryText development team.**
