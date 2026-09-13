# ArcLaunch Mobile - Architecture Decisions

This document records the key architectural and technical decisions made during development.

## 1. Callback Pattern for API Client (Critical)

**Decision:** Remove circular dependency from API client by using callbacks instead of direct store dispatch.

**Context:**
- Initial design had `api/client.ts` importing the Redux store directly
- This created a circular dependency: `App.tsx` → `store` → `client` → `store`
- Prevented Redux state from being updated on API events (auth failures, sync status)

**Solution:**
- API client provides three setter methods: `setAuthFailureCallback()`, `setSyncStatusCallback()`, `setQueueLengthCallback()`
- App.tsx registers these callbacks at startup with dispatch functions
- Client invokes callbacks when events occur (401 response, queue length changes)
- Eliminates circular dependency while enabling reactive state updates

**Rationale:**
- Maintains separation of concerns: API client doesn't know about Redux
- Enables reactive updates: state changes trigger UI re-renders
- Testable: callbacks can be mocked independently
- Simple: avoids complex dependency injection patterns

**Trade-offs:**
- Callbacks must be registered before API calls (handled in App.tsx startup)
- Event ordering depends on callback execution order (mitigated by simple linear flow)

## 2. Redux Persist for Automatic Offline Support

**Decision:** Use redux-persist to automatically persist and rehydrate Redux state from AsyncStorage.

**Context:**
- App needs offline-first architecture where changes survive app restart
- Users should not lose work when offline or app crashes

**Solution:**
- Redux store configured with redux-persist middleware
- Configured to persist: auth (token, userId), ventures, guide messages, sync state
- AsyncStorage driver persists to device storage automatically
- On app start, persisted state is rehydrated into Redux

**Rationale:**
- Minimal setup: one middleware + config object
- Automatic: no manual serialization/deserialization
- Reliable: proven pattern used in thousands of production apps
- Compatible: works with TypeScript and all other middleware

**Trade-offs:**
- Persisted state must be kept small (AsyncStorage has ~10MB limit per platform)
- No encryption of persisted data (acceptable since no PII stored, only IDs and tokens)
- State bloat if not careful with what gets persisted (mitigated by explicit persist config)

## 3. Exponential Backoff for Offline Request Queue

**Decision:** Implement exponential backoff retry strategy for failed queued requests.

**Context:**
- When offline, requests are queued but not immediately retried
- When online, some requests may still fail (server errors, timeouts)
- Naive immediate retry wastes network and server resources

**Solution:**
- First retry after 1 second
- Second retry after 2 seconds
- Third retry after 4 seconds
- Failed after 3 retries, request discarded
- Max queue size: 100 requests

**Rationale:**
- Balances fast recovery (starts within 1s) with graceful degradation (stops after 3 attempts)
- Exponential pattern reduces load when servers are struggling
- 7 seconds total retry window is reasonable for mobile networks
- Failed requests are discarded (data consistency handled by user re-submission)

**Trade-offs:**
- If server is down for >7 seconds, changes are lost (acceptable: user can retry manually)
- Max queue of 100 could be exceeded by high-activity users (unlikely in normal usage)
- No request prioritization (FIFO queue, all requests treated equally)

**Future Enhancement:**
- Implement per-request priority if certain operations become critical
- Make retry count and delays configurable per environment
- Add request deduplication to prevent duplicate submissions

## 4. Bottom Tab Navigation with Modal Stack

**Decision:** Use React Navigation with bottom tab navigator for main sections, modal stack for detail screens.

**Context:**
- Core sections: Ventures, Guide, Settings (three equal-weight areas)
- Detail screens: VentureDetail, PathStage (temporary, should dismiss after action)

**Solution:**
- Main navigator: BottomTabNavigator with three screens
- Modal screens: Registered at root level with `presentation: 'modal'`
- Navigation flow:
  - VenturesList (tab) → tap venture → navigate to VentureDetail (modal)
  - VentureDetail (modal) → tap stage → navigate to PathStage (modal)
  - Modal dismiss returns to underlying screen

**Rationale:**
- Tab navigation provides persistent state: switching tabs doesn't reset scroll position
- Modals provide focus: detail screens appear above tabs, clearly temporary
- Clear IA: three equal sections on tabs, nested details in modals
- Familiar UX: matches standard mobile app patterns (Instagram, Twitter, etc.)

**Trade-offs:**
- Can't navigate between modals directly (must dismiss then navigate)
- Modals don't support swipe-back on Android (mitigated by header back button)
- State is persistent across tab switches (might be unexpected if not designed carefully)

## 5. AsyncStorage for Offline Queue Persistence

**Decision:** Use AsyncStorage for persisting the offline request queue.

**Context:**
- Offline queue must survive app restart
- Queue can be large (up to 100 requests with JSON payloads)
- Need to clear queue on successful sync

**Solution:**
- `offline-queue.ts` implements queue persistence
- Serializes queue to JSON and saves to AsyncStorage key `arclaunch:offline:queue`
- Loads queue on app start from AsyncStorage
- Removes items as they sync successfully

**Rationale:**
- AsyncStorage built-in to React Native, no external dependency
- Simple key-value interface matches queue needs
- Automatic cleanup on successful sync
- Platform-independent (uses NSUserDefaults on iOS, SharedPreferences on Android)

**Trade-offs:**
- ~10MB limit on iOS AsyncStorage (unlikely to hit with 100 requests)
- Synchronous read on app startup (can cause brief freeze on large queue, mitigated by limiting queue size)
- No transactions (losing power during sync could duplicate request, acceptable due to idempotent POST requirements)

## 6. Secure Token Storage via expo-secure-store

**Decision:** Use expo-secure-store for storing JWT authentication token.

**Context:**
- Auth token must be stored securely on device
- Token should not be readable by other apps
- Token must survive app restart

**Solution:**
- `auth.ts` Redux slice stores token reference in state
- `api/client.ts` stores actual token in secure storage via `secureStorage.getItem()` / `setItem()`
- Secure storage uses:
  - iOS: Keychain
  - Android: Encrypted Shared Preferences

**Rationale:**
- Expo-secure-store is standard for React Native auth tokens
- Hardware-backed encryption when available
- Survives app uninstall (optional persistence)
- Clear API: getItem / setItem / removeItem

**Trade-offs:**
- Tokens still sent over HTTPS (secure transport required)
- Secure storage can be slower than regular AsyncStorage (acceptable for auth token)
- No token refresh implemented yet (acceptable for MVP, implement when token expires)

## 7. Offline Detection via NetInfo

**Decision:** Use @react-native-community/netinfo for network connectivity monitoring.

**Context:**
- App must know when device is online/offline
- State should update in real-time as connectivity changes
- Must work on both iOS and Android

**Solution:**
- `App.tsx` initializes NetInfo listener in `useEffect`
- Listener calls `dispatch(setSyncStatus(networkState))` on connectivity change
- Redux `sync` slice stores current online/offline status
- UI components read sync status from Redux

**Rationale:**
- NetInfo is standard for React Native connectivity detection
- Real-time updates via listener pattern
- Works on both platforms out of the box
- Integrates cleanly with Redux state management

**Trade-offs:**
- Listener not cleaned up on unmount in original code (fixed)
- NetInfo state can be inaccurate briefly during network transitions (acceptable)
- No fine-grained connectivity types (WiFi vs cellular) tracked (not needed for MVP)

## 8. TypeScript Strict Mode

**Decision:** Use TypeScript with `strict: true` mode.

**Context:**
- App uses complex Redux state and React Navigation types
- Want to catch type errors at compile time, not runtime
- Team uses TypeScript professionally

**Solution:**
- Configured `tsconfig.json` with `"strict": true`
- All React components are typed with proper prop interfaces
- Redux actions and selectors are typed
- Navigation routes are typed in `RootStackParamList`

**Rationale:**
- Catches errors at compile time (null checks, type mismatches)
- Makes refactoring safer (types catch breaking changes)
- Improves IDE autocomplete (better developer experience)
- Standard for production React/React Native apps

**Trade-offs:**
- More verbose code upfront (mitigated by better tooling)
- Requires discipline in type definitions (pays off in large codebases)
- Some types must be explicitly annotated (unavoidable in strict mode)

## 9. Expo for Build and Deployment

**Decision:** Use Expo (EAS) for iOS and Android builds instead of managed Expo CLI.

**Context:**
- App uses native modules: expo-secure-store, expo-notifications
- Need production builds for App Store and Play Store
- Don't want to manage Xcode/Android Studio build configs

**Solution:**
- Use EAS Build: `eas build --platform ios/android`
- Generates IPA (iOS) and AAB (Android) ready for stores
- Stores build artifacts in Expo cloud
- Can download and submit manually to App Store/Play Store

**Rationale:**
- Handles all build complexity (Xcode, Gradle, signing, provisioning)
- No local build environment needed
- Reliable CI-like builds (reproducible results)
- Integrates with Expo notifications and other services

**Trade-offs:**
- Requires Expo account (free tier available)
- Build queue depends on Expo service availability
- Can't customize build process beyond eas.json config (acceptable for MVP)
- iOS builds still require Apple Developer credentials (unavoidable)

## 10. Redux over Context API

**Decision:** Use Redux Toolkit + redux-persist instead of React Context API for state management.

**Context:**
- App has complex state: auth, ventures list, guide conversations, sync status
- State must persist to AsyncStorage
- Multiple components need read/write access

**Solution:**
- Redux store with four slices: auth, ventures, guide, sync
- Redux middleware handles persistence
- Components dispatch actions and select state with Redux hooks

**Rationale:**
- Redux DevTools provide powerful debugging and time-travel
- Middleware ecosystem (persist, thunk, etc.) handles complex patterns
- Clear separation of state, actions, reducers
- Scales well as app grows (Context API patterns get messy with many slices)
- Standard for production React Native apps

**Trade-offs:**
- More boilerplate than Context API (mitigated by Redux Toolkit)
- Requires understanding Redux patterns (good long-term investment)
- DevTools need explicit setup (included in App.tsx)

## 11. Deep Linking Configuration

**Decision:** Configure deep linking for app:// and https://arclaunch.net schemes.

**Context:**
- Push notifications should link to specific ventures or guide
- Web links should open app if installed
- Need consistent routing for both schemes

**Solution:**
- Navigation container configured with `linking` prop
- Prefixes: `app://` and `https://arclaunch.net`
- Routes map to navigation screens:
  - `app://signin` → Auth screen
  - `app://ventures` → Ventures list
  - `app://ventures/:id` → Venture detail
  - `app://guide` → Guide chat
  - etc.

**Rationale:**
- Standard React Navigation deep linking pattern
- Works with push notifications (data contains deep link URL)
- Web shares same routes as app (seamless deep link experience)
- Single source of truth for navigation routes

**Trade-offs:**
- Deep link structure must match navigation structure (mitigated by careful routing design)
- Requires manual testing of each deep link (included in test plan)

## Future Considerations

### Not Implemented (For Later)

1. **Token Refresh**: Current design assumes tokens don't expire. Add refresh token logic when backend implements token expiry.

2. **End-to-End Encryption**: PII not encrypted in AsyncStorage. Implement if handling sensitive user data.

3. **Request Prioritization**: All offline requests treated equally. Implement priority queue if some requests become critical.

4. **Retry Customization**: Retry counts and delays are hardcoded. Make configurable per environment.

5. **Background Sync**: Currently only syncs when app is open. Implement background sync for continuous reliability.

6. **Compression**: Large offline queue not compressed. Implement compression if storage becomes constrained.

### Known Limitations

1. **Queue Losing on Uninstall**: Offline queue stored in AsyncStorage, lost if app uninstalled. Acceptable for MVP.

2. **No Request Deduplication**: Duplicate requests can be queued if user submits twice. Implement if user action is non-obvious.

3. **No Request Cancellation**: No way to remove request from queue once queued. Implement if needed for user control.

4. **No Conflict Resolution**: If server state changed while offline, last write wins. Implement merge strategy if conflicts common.

## Change Log

- **2026-09-13**: Initial documentation of all decisions made during MVP development.

## Contact

For questions about these decisions, refer to the commit history or contact the development team.
