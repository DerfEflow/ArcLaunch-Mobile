# ArcLaunch Mobile - Expected API Endpoints

This document describes the API endpoints that the ArcLaunch backend must implement for the mobile app to function correctly.

## Authentication

### POST /auth/signin
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "jwt-token-here",
  "userId": "user-123",
  "workspaceId": "workspace-456"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

## Ventures

### GET /api/ventures
List all ventures for the current user.

**Response (200 OK):**
```json
{
  "ventures": [
    {
      "id": "venture-1",
      "title": "My Startup",
      "description": "A description of my venture",
      "path_json": {
        "stages": [
          {
            "id": "stage-1",
            "name": "Problem Validation",
            "description": "Validate the problem exists",
            "prompt": "What problem are you solving?",
            "answer": null
          }
        ]
      },
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/ventures/:id
Get a single venture by ID.

**Response (200 OK):**
```json
{
  "id": "venture-1",
  "title": "My Startup",
  "description": "A description of my venture",
  "path_json": {
    "stages": [
      {
        "id": "stage-1",
        "name": "Problem Validation",
        "description": "Validate the problem exists",
        "prompt": "What problem are you solving?",
        "answer": "The problem is X"
      }
    ]
  },
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### POST /api/ventures/:id/stages/:stageId/confirm
Confirm/answer a stage in the venture path.

**Request:**
```json
{
  "answer": "The user's answer to the stage prompt"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "stage": {
    "id": "stage-1",
    "answer": "The user's answer to the stage prompt"
  }
}
```

## Guide (AI Assistant)

### GET /api/guide/conversations
List all guide conversations for the current user.

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "id": "conv-1",
      "title": "Conversation about market research",
      "ventureId": "venture-1",
      "messages": [
        {
          "id": "msg-1",
          "role": "user",
          "body": "How should I validate my market?",
          "timestamp": 1609459200000
        },
        {
          "id": "msg-2",
          "role": "assistant",
          "body": "You can start by talking to potential customers...",
          "timestamp": 1609459300000,
          "sources": []
        }
      ],
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/guide/message
Send a message to the AI guide and get a response.

**Request:**
```json
{
  "conversationId": "conv-1",
  "message": "How should I validate my market?"
}
```

**Response (200 OK):**
```json
{
  "message": "You can start by talking to potential customers. Here are the steps...",
  "sources": [
    {
      "title": "Customer Discovery Guide",
      "url": "https://example.com/discovery"
    }
  ]
}
```

## Push Notifications

### POST /users/push-tokens
Register a device token for push notifications.

**Request:**
```json
{
  "device_token": "expo-push-token",
  "platform": "ios" | "android"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes:
- 401: Unauthorized (invalid/missing token)
- 404: Not found
- 422: Unprocessable entity (validation error)
- 500: Server error

For 401 responses, the mobile app will:
1. Clear the auth token from secure storage
2. Dispatch clearAuth action to Redux
3. Navigate to Auth screen

## Headers

All requests (except /auth/signin) should include:
```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

The mobile app automatically adds the Authorization header via axios interceptor.

## Request Queuing

The mobile app automatically queues POST, PUT, PATCH, DELETE requests when offline. These queued requests are:
1. Stored in AsyncStorage as JSON
2. Retried up to 3 times with exponential backoff when coming online
3. Discarded if they fail after 3 retries

GET requests are never queued (read-only operations).

## Testing Endpoints

For development and testing, you can:
1. Mock these endpoints in the backend
2. Use a tool like Postman to test the API
3. Enable logging in the mobile app via `console.log` statements in api/client.ts

