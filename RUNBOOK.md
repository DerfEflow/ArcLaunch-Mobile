# ArcLaunch Mobile - Operations Runbook

Complete guide for setting up, building, and deploying the ArcLaunch React Native app.

## Prerequisites

Before starting any build or deployment, ensure you have:

- Node.js 18+ installed (`node --version`)
- npm 8+ installed (`npm --version`)
- Expo CLI installed (`npm install -g eas-cli expo-cli`)
- An Expo account (free at https://expo.dev)
- Apple Developer account (for iOS builds)
- Google Play Developer account (for Android builds)
- `git` configured with push access to GitHub

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/DerfEflow/ArcLaunch-Mobile.git
cd arclaunch-mobile

# Install with legacy peer deps flag (required for React Navigation compatibility)
npm install --legacy-peer-deps

# Verify TypeScript compilation
npm run typecheck
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `REACT_APP_API_URL`: Backend API endpoint (default: https://arclaunch.net)
- `REACT_APP_API_TIMEOUT`: Request timeout in ms (default: 10000)
- `EXPO_PROJECT_ID`: Will be set up in the next step

### 3. Link Expo Project

Link your app to an Expo project for builds and push notifications:

```bash
# Login to Expo
eas login

# Initialize or link to an existing project
eas init

# Answer the prompts:
# - Project name: ArcLaunch Mobile
# - Slug: arclaunch-mobile (must match app.json slug)
# - Platform: Both iOS and Android

# Get your project ID
eas project info
# Copy the Project ID and add it to .env: EXPO_PROJECT_ID=<id>
```

### 4. Start Development Server

```bash
npm run start

# In the Expo CLI prompt:
#   i - Open iOS simulator
#   a - Open Android emulator
#   w - Open web browser
#   Or scan the QR code with Expo Go app
```

## Building for iOS

### Prerequisites

- Apple Developer account ($99/year)
- Mac with Xcode (for TestFlight submission)
- Expo account (free)

### Build Flow

#### Step 1: Set Up Apple Credentials

```bash
# Interactive credential setup
eas credentials

# Select platform: iOS
# Follow prompts to create or upload:
#   - Provisioning Profile (automatic or manual)
#   - Code Signing Certificate (automatic or manual)

# Save credentials to your Expo account (recommended)
```

#### Step 2: Build for Preview (Simulator)

Use this for testing on iOS simulator:

```bash
npm run build:ios
# or: eas build --platform ios --profile preview

# Result: Download and install on simulator
# eas build:list  # See all builds
```

#### Step 3: Build for Production (Device/TestFlight)

Use this for App Store and TestFlight distribution:

```bash
npm run build:ios
# or: eas build --platform ios --profile production

# Build type: archive (device and TestFlight compatible)
# Notifications: Get notified when build completes
# Download: Get IPA file when ready
```

#### Step 4: Submit to TestFlight or App Store

Option A - Automatic submission (requires App Store credentials):

```bash
eas submit --platform ios --profile production
# Follow prompts to sign in to App Store Connect
# App will be uploaded to TestFlight automatically
```

Option B - Manual submission:

```bash
# Download the IPA from EAS build page
# Open in Xcode or use Transporter:
# https://apps.apple.com/app/transporter/id1450874784

# Then submit via App Store Connect (https://appstoreconnect.apple.com):
# 1. Go to My Apps > ArcLaunch Mobile
# 2. Click TestFlight tab
# 3. Upload build
# 4. Add beta testers
# 5. Submit for review or distribute internally
```

## Building for Android

### Prerequisites

- Google Play Developer account ($25 one-time)
- Expo account (free)
- No Mac required

### Build Flow

#### Step 1: Set Up Google Play Credentials

```bash
# Interactive credential setup
eas credentials

# Select platform: Android
# Choose keystore:
#   - Let EAS generate (recommended for first build)
#   - Use existing keystore (if you have one)

# Save credentials to your Expo account (recommended)
```

#### Step 2: Build for Preview (APK)

Use this for testing on devices before Play Store:

```bash
npm run build:android
# or: eas build --platform android --profile preview

# Result: APK file ready for download
# Supports direct installation on Android devices
```

#### Step 3: Build for Production (Play Store)

Use this for Google Play distribution:

```bash
npm run build:android
# or: eas build --platform android --profile production

# Build type: AAB (Android App Bundle)
# Optimized for Play Store distribution
# Play Store handles per-device APK generation
```

#### Step 4: Submit to Google Play

Option A - Automatic submission:

```bash
eas submit --platform android --profile production

# Sign in to Google Play
# App will be uploaded to internal testing track
```

Option B - Manual submission:

```bash
# Download AAB from EAS build page
# Open Google Play Console (https://play.google.com/console)
# Go to ArcLaunch Mobile > Release > Create release
# Upload AAB file
# Review content rating, pricing, etc.
# Submit for review
```

## Build Troubleshooting

### iOS Builds Failing

**Error: "No provisioning profiles found"**

```bash
eas credentials
# Delete and recreate iOS certificate and provisioning profile
```

**Error: "Code signing identity not found"**

```bash
# Ensure valid Apple Developer Certificate
# Reset credentials: eas credentials --platform ios --clear
# Then run eas credentials to set up fresh credentials
```

### Android Builds Failing

**Error: "Keystore is invalid"**

```bash
eas credentials --platform android --clear
# Recreate keystore
eas build --platform android --profile production
```

**Error: "Play Store API access required"**

```bash
# Ensure Google Play Developer account is active
# Check that you can sign in to https://play.google.com/console
# Validate Play Store access in eas credentials
```

## Push Notifications

### Setup

1. Backend registers device token:
   - App calls `pushNotificationService.registerDevice(platform)` on startup
   - Device sends push token to backend via `POST /users/push-tokens`

2. Backend sends notifications:
   - Use Expo Push API: `https://exp.host/--/api/v2/push/send`
   - Include `to` (push token), `title`, `body`, and optional `data`

### Sending Test Notification

```bash
# Via Expo CLI (requires permissions)
expo send:notifications --where "app.id=<project-id>"

# Or directly to device token via Expo API:
curl -X POST "https://exp.host/--/api/v2/push/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "<push-token-from-device>",
    "title": "Test Notification",
    "body": "This is a test push notification",
    "data": { "ventureId": "venture-123" }
  }'
```

## Deployment Verification

After each build/deployment:

1. **Test on Device/Simulator**
   - Verify app launches without errors
   - Test core flow: Login → Ventures → Guide → Settings
   - Test offline: Disable network, make changes, re-enable, verify sync

2. **Check Logs**
   - Monitor build logs in EAS dashboard
   - Check app console for errors (via Expo dev client)

3. **Verify Backend Integration**
   - Confirm API calls succeed
   - Check backend logs for any errors
   - Verify offline queue syncs when online

4. **Test Push Notifications**
   - Send test notification from backend
   - Verify device receives and displays it
   - Verify tap navigation works (deep linking)

## Managing Credentials

### Store Credentials in Expo (Recommended)

```bash
eas credentials
# Choose platform and follow prompts to save securely
```

### Rotate Credentials

```bash
# iOS
eas credentials --platform ios --clear
eas credentials  # Set up new credentials

# Android
eas credentials --platform android --clear
eas credentials  # Set up new credentials
```

### Export Credentials for Backup

```bash
# Retrieve credentials (requires Expo login)
# Use Expo dashboard: https://expo.dev > Projects > ArcLaunch Mobile > Settings > Credentials

# Backup location: Save in secure password manager
```

## Monitoring Builds

### View Build Status

```bash
eas build:list                    # List all builds
eas build:list --platform ios     # iOS builds only
eas build:list --platform android # Android builds only
```

### Get Build Logs

```bash
eas build:log <build-id>
```

### Subscribe to Build Notifications

```bash
# Email notifications are automatic
# Configure in Expo dashboard: https://expo.dev > Notifications
```

## Rollback Procedure

If a deployed build has critical issues:

1. **Identify Last Good Build**
   - Check `eas build:list` for previously successful builds
   - Note the build ID and commit hash

2. **Revert Code (if issue is code-related)**
   - `git checkout <last-good-commit>`
   - Or `git revert <bad-commit>` and push new commit

3. **Rebuild**
   - `eas build --platform ios --profile production`
   - `eas build --platform android --profile production`

4. **Resubmit to Stores (if already reviewed)**
   - App Store: TestFlight > Submit to Review (same version number)
   - Play Store: Release > Create release > Upload new AAB

## Monitoring Production

### Health Checks

```bash
# API endpoint availability
curl https://arclaunch.net/health

# App analytics (if configured)
# Check Expo dashboard for crash reports

# Push notification delivery
# Monitor backend push logs
```

### Common Issues in Production

**High Crash Rate**
- Check error monitoring (Sentry if configured)
- Review app console messages
- Rebuild and deploy patched version

**Offline Queue Not Syncing**
- Check network connectivity in app settings
- Monitor AsyncStorage queue in Redux DevTools
- Verify backend API endpoints are accessible

**Push Notifications Not Received**
- Verify device token is registered in backend
- Check push payload format matches Expo API
- Verify app has notification permissions

## References

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/eas-update/getting-started
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview

## Contact

For issues or questions, refer to:
- GitHub Issues: https://github.com/DerfEflow/ArcLaunch-Mobile/issues
- API Documentation: See `API_ENDPOINTS.md`
- Offline Architecture: See `README.md`
