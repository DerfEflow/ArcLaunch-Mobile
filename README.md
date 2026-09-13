# ArcLaunch Mobile

React Native mobile app for ArcLaunch - offline-first iOS and Android builds with push notifications.

## Features

- **Offline-First**: Full offline support with AsyncStorage + Redux Persist
- **Automatic Sync**: Queued requests sync when network returns
- **Auth**: Secure token storage via expo-secure-store
- **Guide Chat**: AI guide conversations with streaming support
- **Ventures**: Launch path stages with progress tracking
- **Push Notifications**: Real-time guide replies and venture updates via Expo Notifications

## Architecture

```
src/
├── api/
│   └── client.ts          # Axios with offline queue, retry logic
├── store/
│   ├── index.ts           # Redux store config with persist
│   └── slices/            # Auth, Ventures, Guide, Sync reducers
├── screens/               # React Navigation screens
├── services/
│   └── pushNotifications.ts # Expo Notifications setup
└── App.tsx                # Root component with Redux Provider
```

## Setup & Development

```bash
# Install dependencies
npm install

# Start dev server
npm run start

# Start on iOS simulator
npm run start:ios

# Start on Android emulator
npm run start:android

# Run tests
npm run test
```

## Building

### iOS

```bash
npm run build:ios
# Creates IPA for TestFlight / App Store
```

### Android

```bash
npm run build:android
# Creates APK or AAB for Google Play
```

Build artifacts saved locally for distribution.

## Offline Flow

1. **Offline**: Changes stored locally, API requests queued in AsyncStorage
2. **Syncing**: When online, queued requests retry with exponential backoff
3. **Conflict Resolution**: Last write wins (server state on successful sync)

## Testing

- **Offline Sync**: `tests/integration/offline-sync.test.ts`
- **Manual Flow**: Disable network → edit venture/stage → reenable → verify sync

## Deployment

- **Preview**: `npm run build:preview` (TestFlight/internal testing)
- **Production**: `npm run build` (App Store/Play Store ready)

See `COMPLETION.txt` for build artifact URLs and deployment links.
