# ArcLaunch Mobile

A React Native mobile app for ArcLaunch that provides offline-first access to your venture launch path and AI guide, with automatic syncing and push notifications.

## Features

- **Offline-First**: Work without internet - all changes sync automatically when you reconnect
- **Automatic Queue & Sync**: Requests queue locally and retry with exponential backoff
- **Secure Auth**: Token stored in native secure storage, cleared on logout
- **AI Guide Chat**: Multi-turn conversations with the AI business advisor
- **Venture Management**: Track your launch path stages and progress
- **Push Notifications**: Real-time notifications for guide replies and updates
- **Cross-Platform**: iOS and Android via Expo

## Tech Stack

- **React Native** 0.76 with TypeScript strict mode
- **Redux Toolkit** with redux-persist for state management
- **React Navigation** for routing (bottom tab + stack navigation)
- **Expo** for build and deployment
- **Axios** with custom offline queue middleware
- **expo-secure-store** for secure token storage
- **@react-native-community/netinfo** for offline detection

## Project Structure

```
src/
├── api/
│   └── client.ts              # API client with offline queue & retry logic
├── store/
│   ├── index.ts               # Redux store with persist config
│   └── slices/
│       ├── auth.ts            # Auth state (token, userId, workspaceId)
│       ├── ventures.ts        # Ventures list and current venture
│       ├── guide.ts           # Guide conversations and messages
│       └── sync.ts            # Sync status and offline queue length
├── screens/
│   ├── Auth.tsx               # Login form
│   ├── VenturesList.tsx       # List of ventures
│   ├── VentureDetail.tsx      # Venture info and path stages
│   ├── PathStage.tsx          # Stage confirmation form
│   ├── Guide.tsx              # AI guide chat interface
│   └── Settings.tsx           # App settings and sync status
├── navigation/
│   └── index.tsx              # Navigation structure and typing
├── services/
│   └── pushNotifications.ts   # Push notification setup and handlers
├── App.tsx                    # Root component (Redux + Redux Persist)
└── index.tsx                  # Expo entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ (check: `node --version`)
- npm or yarn
- Expo account (optional, for EAS builds): https://expo.dev

### Installation

```bash
# Clone the repository
git clone https://github.com/DerfEflow/ArcLaunch-Mobile.git
cd arclaunch-mobile

# Install dependencies (legacy peer deps needed for React Navigation)
npm install --legacy-peer-deps

# Verify TypeScript compilation
npm run typecheck
```

### Development

```bash
# Start the Expo dev server
npm run start

# In the terminal, press:
#   i - Open iOS simulator
#   a - Open Android emulator
#   w - Open in web browser
#   Or scan QR code with Expo Go app on your phone
```

### Building

```bash
# For development/testing
npm run build:preview  # Creates preview builds for both platforms

# For production (requires EAS account setup)
npm run build:ios     # Creates IPA for App Store / TestFlight
npm run build:android # Creates AAB for Google Play

# For specific platform
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Offline Behavior

When the app detects no internet connection:

1. **Stores Changes Locally**: All form submissions (venture stage confirmations, guide messages) are saved to local state
2. **Queues Requests**: POST/PUT/PATCH/DELETE requests are queued in AsyncStorage
3. **Skips Reads**: GET requests fail immediately (they're read-only)
4. **Shows Offline Status**: Settings screen shows "Offline" badge and pending sync count

When connection returns:

1. **Auto-Sync**: Queued requests automatically retry
2. **Exponential Backoff**: Failed requests retry up to 3 times with increasing delays
3. **Updates UI**: Sync status updates to show progress or errors
4. **Clears Queue**: Successful requests are removed; failed ones discarded after 3 retries

## API Endpoints

The app expects these endpoints from the backend:

| Method | Path | Purpose |
|--------|------|---------|
| POST | /auth/signin | Login with email/password |
| GET | /api/ventures | List user's ventures |
| GET | /api/ventures/:id | Get venture details |
| POST | /api/ventures/:id/stages/:stageId/confirm | Confirm stage answer |
| GET | /api/guide/conversations | List guide conversations |
| POST | /api/guide/message | Send message to AI guide |
| POST | /users/push-tokens | Register push notification token |

See `API_ENDPOINTS.md` for detailed documentation.

## Testing

### TypeScript Type Checking

```bash
npm run typecheck
```

### Offline Queue Integration Tests

```bash
npm run test -- tests/integration/offline-sync.test.ts
```

Tests cover:
- Queueing requests when offline
- Persisting queue to AsyncStorage
- Syncing requests when online
- Retry logic with max 3 retries
- GET requests not being queued
- Clearing queue on user request
- Graceful error handling

## Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Backend API URL
REACT_APP_API_URL=https://arclaunch.net

# Request timeout in milliseconds
REACT_APP_API_TIMEOUT=10000

# Expo project ID (for push notifications and EAS builds)
EXPO_PROJECT_ID=your-expo-project-id

# Environment
NODE_ENV=development
```

### App Configuration

- **iOS Bundle ID**: `com.arclaunch.mobile` (app.json)
- **Android Package**: `com.arclaunch.mobile` (app.json)
- **Version**: `1.0.0` (package.json, app.json)

## Troubleshooting

### Dependencies Won't Install

```bash
# Use legacy peer deps flag (React Navigation is slightly outdated in npm)
npm install --legacy-peer-deps
```

### TypeScript Errors

```bash
# Run type check to see all errors
npm run typecheck

# Common issues:
# - Missing types: npm install --save-dev @types/package-name
# - Incompatible versions: Use versions in package.json
```

### Offline Queue Not Syncing

1. Check Settings screen shows "Pending Sync" count
2. Verify network connectivity (Settings → Connection Status)
3. Check app console for error messages
4. Try clearing cache and restarting app

### Push Notifications Not Working

1. Ensure you've registered the device:
   - App calls `pushNotificationService.registerDevice(platform)` on startup
   - Backend receives the push token via POST /users/push-tokens
2. Verify Expo project is set up:
   - Run `eas init` to link Expo project
   - Set EXPO_PROJECT_ID in .env
3. Check notification payload structure (see `API_ENDPOINTS.md`)

## Deployment

### EAS Build Process

```bash
# 1. Link to Expo project (if not already linked)
eas init

# 2. Set up credentials
eas credentials

# 3. Build for preview (iOS simulator/Android APK)
npm run build:preview

# 4. Build for production (device/TestFlight/Play Store)
npm run build:ios
npm run build:android

# 5. Submit to stores (optional)
eas submit --platform ios
eas submit --platform android
```

### Manual Deployment

Build artifacts are stored in `.eas/` directory:
- iOS: `.eas/builds/project.archive`
- Android: `.eas/builds/app-release.aab` or `app-release.apk`

Submit manually via:
- **App Store Connect**: TestFlight or App Store
- **Google Play Console**: Internal Testing, Closed Testing, or Production

## Contributing

See `DECISIONS.md` for architectural decisions and `COMPLETION.txt` for project status.

## License

© 2026 ArcLaunch. All rights reserved.
