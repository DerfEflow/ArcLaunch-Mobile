# Changelog

All notable changes to the ArcLaunch Mobile app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-13

### Added

#### Core Features
- Offline-first mobile app for managing venture launch paths
- Bottom tab navigation: Ventures, Guide (AI advisor), Settings
- Auth screen with email/password login
- Ventures list with filtering and selection
- Venture detail screen showing launch path stages
- Path stage confirmation screen with custom prompts
- AI Guide chat interface for multi-turn conversations
- Settings screen with sync status monitoring and offline queue visibility
- Push notification support for guide messages and venture updates

#### Offline & Sync
- Automatic offline detection via NetInfo
- Request queuing in AsyncStorage when offline
- Exponential backoff retry logic (1s, 2s, 4s max attempts)
- Redux Persist for automatic state hydration
- Visual offline indicators in Settings screen
- Pending sync count display

#### Security & Storage
- Secure token storage via expo-secure-store (Keychain on iOS, Encrypted Shared Preferences on Android)
- Redux-based state management with slices for auth, ventures, guide, sync
- HTTP interceptors for Authorization headers
- Automatic auth token clearing on 401 responses
- Request timeout configuration (default 10 seconds)

#### Deep Linking
- Support for app:// scheme (push notifications)
- Support for https://arclaunch.net scheme (web links)
- Deep link navigation to ventures, guide, and settings

#### Development & Build
- TypeScript strict mode for type safety
- ESLint and Prettier for code quality
- React Navigation with proper type definitions
- EAS build configuration for iOS (archive) and Android (AAB)
- Preview build profiles for testing
- Comprehensive dependency management with legacy peer deps resolution

#### Documentation
- Comprehensive README with Getting Started, offline behavior, troubleshooting
- API_ENDPOINTS.md documenting complete backend API contract
- DECISIONS.md detailing architectural decisions and rationale
- DESIGN.md with complete design system (colors, typography, components)
- RUNBOOK.md with operations guide for EAS builds and deployment
- .env.example with all configuration options documented
- STATUS.md with project state and completion checklist
- CHANGELOG.md (this file)

### Infrastructure

- GitHub repository at https://github.com/DerfEflow/ArcLaunch-Mobile
- All code pushed and version controlled
- Git history clean with no secrets committed
- Comprehensive .gitignore for sensitive files and build artifacts

### Known Limitations

- No token refresh flow (tokens assumed not to expire)
- No end-to-end encryption for offline queue
- Last-write-wins conflict resolution (no merge strategy)
- Max 100 requests in offline queue
- Sync only active when app is open (no background sync)
- No Stripe integration (payment processing deferred)
- Placeholder assets (final branding pending)

### What's Next

#### Immediate (After EAS Setup)
- [ ] Link Expo project via `eas init`
- [ ] Set up Apple Developer credentials for iOS
- [ ] Set up Google Play credentials for Android
- [ ] Run EAS preview builds for testing
- [ ] Run EAS production builds for App Store and Play Store
- [ ] Submit to App Store and Google Play

#### Phase 2 (After Launch)
- [ ] Token refresh implementation (if backend requires)
- [ ] Photo/document upload for venture documentation
- [ ] Background sync API for improved reliability
- [ ] Push notification action buttons for quick replies
- [ ] Venture PDF export for presentations
- [ ] Search and filter ventures (when > 5 ventures common)

#### Phase 3 (Scale)
- [ ] Collaborative venture access (team members)
- [ ] Venture progress analytics dashboard
- [ ] In-app tutorial and guided first-run flow
- [ ] Conversation branching in guide (what-if scenarios)
- [ ] Voice input for hands-free guide interaction

## Migration Guide

### From Version 0.x (Pre-Release)

This is the first public release (1.0.0). No migrations needed.

### Environment Setup

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
# Edit .env with your API_URL and EXPO_PROJECT_ID
```

### Running Locally

```bash
npm install --legacy-peer-deps
npm run start
# Scan QR code with Expo Go app
```

### Building for Stores

See [RUNBOOK.md](RUNBOOK.md) for complete build instructions.

## Versioning

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes to API, features, or user experience
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, security updates, documentation

## Release Process

1. Update version in `package.json` and `app.json`
2. Update this CHANGELOG with changes
3. Commit: `git commit -m "Release v<version>"`
4. Tag: `git tag -a v<version> -m "Release v<version>"`
5. Push: `git push origin master --tags`
6. Build: Run EAS builds for iOS and Android
7. Deploy: Submit to App Store and Google Play

## Support

For issues, feature requests, or questions:
- GitHub Issues: https://github.com/DerfEflow/ArcLaunch-Mobile/issues
- Documentation: See README.md and API_ENDPOINTS.md
- Architecture: See DECISIONS.md for design rationale

## Credits

Built by the ArcLaunch team using:
- Expo and React Native
- Redux and redux-persist
- React Navigation
- Axios HTTP client
- TypeScript

See package.json for full dependency list.
