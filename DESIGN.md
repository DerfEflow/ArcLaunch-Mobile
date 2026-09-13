# ArcLaunch Mobile - Design System

Visual and interaction design standards for the ArcLaunch mobile app.

## Design Philosophy

**Clarity over complexity.** The app guides founders through their launch path one step at a time. Every screen should communicate clearly what the user can do and why it matters.

## Color Palette

### Primary Colors

- **Primary Blue**: `#1E90FF` (Dodger Blue)
  - Used for: Primary buttons, navigation highlights, key data points
  - Conveys: Trust, clarity, forward momentum
  - WCAG AA: Pass on white backgrounds

- **Accent Orange**: `#FF9500` (Warning/Success accent)
  - Used for: Important alerts, key achievements, stage completions
  - Conveys: Energy, validation, progress
  - WCAG AA: Pass on white backgrounds

- **Neutral Dark**: `#1F2937` (Charcoal)
  - Used for: Primary text, headers, strong emphasis
  - Supports readability on all backgrounds

- **Neutral Light**: `#F3F4F6` (Off-white)
  - Used for: Card backgrounds, section dividers, subtle containers
  - Creates visual separation without harshness

### Semantic Colors

- **Success**: `#10B981` (Emerald) - Stage completion, valid actions
- **Warning**: `#F59E0B` (Amber) - Pending sync, unsaved changes
- **Error**: `#EF4444` (Red) - Network errors, failed requests
- **Info**: `#3B82F6` (Light Blue) - Tips, contextual help

### Dark Mode

Dark mode inverts the palette:
- Dark backgrounds: `#1F2937`
- Light text: `#F9FAFB`
- Accent colors remain the same (adjusted opacity if needed)

## Typography

### Display Font: Outfit

- Used for: Screen titles, stage names, venture titles
- Style: Modern, geometric sans-serif
- Weights: 600 (bold for emphasis)
- Scale: 24px-32px for headers, 16px-20px for section titles

### Body Font: Inter

- Used for: Body text, form labels, explanations
- Style: Highly readable, professional
- Weights: 400 (regular), 500 (medium emphasis), 600 (strong emphasis)
- Sizes: 16px for body, 14px for captions, 12px for helpers

### Line Heights

- Headers: 1.2 (tight for impact)
- Body: 1.5 (open for readability)
- Captions: 1.4 (balanced)

## Spacing

Use an 8px base unit for consistent rhythm:

- 4px - Micro spaces (badges, tight groups)
- 8px - Button padding, small gaps
- 12px - Card padding tops, section gaps
- 16px - Main content padding, element margins
- 24px - Section spacing, large gaps
- 32px - Screen padding, major section breaks
- 48px - Oversized gaps, full-screen sections

## Component Styles

### Buttons

**Primary Button** (Call to action)
- Background: Primary Blue (#1E90FF)
- Text: White
- Padding: 12px 20px (vertical, horizontal)
- Border radius: 8px
- Min touch target: 44px height

**Secondary Button** (Alternative action)
- Background: Neutral Light (#F3F4F6)
- Text: Neutral Dark (#1F2937)
- Padding: 12px 20px
- Border radius: 8px
- Border: 1px solid #E5E7EB

**Disabled Button**
- Opacity: 50%
- Cursor: Not allowed
- No hover effects

### Cards

- Background: White (light mode) / #374151 (dark mode)
- Padding: 16px
- Border radius: 12px
- Box shadow: 0px 1px 3px rgba(0, 0, 0, 0.1)
- Hover shadow (optional): 0px 4px 6px rgba(0, 0, 0, 0.15)

### Form Inputs

- Border: 1px solid #E5E7EB
- Padding: 12px 12px (vertical, horizontal)
- Border radius: 8px
- Focus state: 2px solid #1E90FF border
- Placeholder text: #9CA3AF (light gray)

### Loading States

- Skeleton loader (preferred): Gray pulse animation over placeholder
- Spinner (fallback): 24px diameter, Primary Blue color
- Duration: 2-3 second pulse cycle

### Offline Indicator

- Background: #FEF3C7 (Amber light)
- Border: 1px solid #F59E0B
- Text: #92400E (Dark amber)
- Icon: Wifi-off or cloud-offline
- Placement: Top banner or top-right corner

## Spacing & Layout

### Mobile (375px)

- Full width layouts
- 16px side padding
- Single column
- Cards stack vertically
- Touch targets all ≥44px

### Tablet (768px)

- 24px side padding
- Optional two-column layouts
- Modals centered with max-width 600px

### Desktop (1440px)

- 48px side padding
- Three-column layouts possible (not expected for this MVP)
- Modals max-width 800px

## Motion

### Transitions

- Screen transitions: 300ms (fade or slide)
- Button feedback: 150ms (highlight on press)
- Loading: 2-3s pulse cycle
- Dismissal: 200ms (fade out)

### Principles

- Motion supports UX, not decoration
- Respects `prefers-reduced-motion` setting
- Duration 150-300ms (fast enough to feel responsive)
- Easing: cubic-bezier(0.4, 0, 0.2, 1) (standard ease-out)

## Icons

### Icon Set

- Source: Expo vector icons (Ionicons, MaterialCommunityIcons)
- Size: 24px default, 32px for headers, 16px for inline
- Color: Inherit text color (or specific color for semantic icons)
- Consistency: One icon set family, not mixed

### Common Icons

- Back/Close: `chevron-back`
- Menu: `menu`
- Settings: `settings`
- Chat: `chatbubble-outline`
- Ventures: `briefcase`
- Loading: `spinner` (with animation)
- Error: `alert-circle`
- Success: `checkmark-circle`
- Offline: `cloud-offline-outline`

## Accessibility

### Contrast Ratios

- All text on background: ≥4.5:1 (WCAG AA standard)
- UI components: ≥3:1
- Tested for red/green colorblindness

### Touch Targets

- Minimum 44x44px on mobile
- 8px spacing between targets
- Generous padding around interactive elements

### Keyboard Navigation

- All interactive elements keyboard accessible
- Focus indicator: 2px outline in Primary Blue
- Tab order follows visual flow
- Escape key closes modals

### Screen Reader Support

- Semantic HTML structure (using React Native primitives)
- Meaningful alt text on images
- Form labels associated with inputs
- Loading states announced

## Component Examples

### Venture Card

```
┌─────────────────────────────────────┐
│ My Startup                          │
│ A SaaS for project management       │
│                                     │
│ Stage 3 of 7: Product Launch        │
│ ████████░░░░░░░░░░ (43% complete)   │
│                                     │
│           [View Details]            │
└─────────────────────────────────────┘
```

### Stage Confirmation Screen

```
┌─────────────────────────────────────┐
│ ← Problem Validation                │
│                                     │
│ What problem are you solving?       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ We're solving X problem because │ │
│ │ our customers struggle with...  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ You're offline. Changes will be     │
│ saved locally and synced when       │
│ online.                             │
│                                     │
│         [Confirm Stage]             │
└─────────────────────────────────────┘
```

## Design Patterns

### Empty States

**No ventures yet**
- Icon: Briefcase (outline)
- Headline: "No ventures yet"
- Subheading: "Create your first venture to get started"
- CTA: "Create Venture" button

**No offline queue**
- Icon: Cloud (check mark)
- Headline: "All changes synced"
- Subheading: "Your offline changes have been saved to the server"

### Error States

**Network error**
- Icon: Cloud (offline)
- Headline: "Connection lost"
- Subheading: "You're offline. Changes will sync when you reconnect."
- CTA: "Retry" button (if applicable)

**API error**
- Icon: Alert circle
- Headline: "Something went wrong"
- Subheading: "The server returned an error. Please try again."
- CTA: "Try again" button

### Loading States

**Data loading**
- Use skeleton loader: Gray placeholder shapes pulsing
- Show while fetching ventures, guide messages

**Request processing**
- Use spinner in button: Disabled state with loading animation
- Show while submitting forms, confirming stages

## Theming Implementation

Colors and fonts are defined in `src/theme.ts` (if created) or inline with TypeScript constants:

```typescript
export const colors = {
  primary: '#1E90FF',
  accent: '#FF9500',
  success: '#10B981',
  error: '#EF4444',
  neutral: {
    dark: '#1F2937',
    light: '#F3F4F6',
  },
};

export const typography = {
  display: { fontFamily: 'Outfit', fontSize: 28, fontWeight: '600' },
  body: { fontFamily: 'Inter', fontSize: 16, fontWeight: '400' },
};
```

## Testing Design

### Visual Regression Testing

- Screenshot every screen at 375px, 768px, 1440px
- Test both light and dark modes
- Compare against reference images in `/screenshots`

### Accessibility Testing

- Automated axe scans (≥90 issues pass)
- Manual keyboard navigation test
- Screen reader testing (iOS VoiceOver, Android TalkBack)
- Color contrast verification

### Performance

- Images optimized (WebP/AVIF when possible)
- CSS animations use GPU acceleration
- Font loading optimized (system fonts fallback)
- Lighthouse Performance score ≥90

## Future Design Enhancements

1. **Illustration system**: Custom SVG illustrations for empty states, onboarding, error states
2. **Animation library**: Micro-interactions for form validation, list reordering
3. **Theming variants**: Alternative color schemes for different occasions
4. **Component library**: Documented and exported React Native components
5. **Design tokens**: Exported to Figma for design-code sync

## References

- [Material Design 3](https://m3.material.io)
- [Expo Font Catalog](https://docs.expo.dev/guides/using-custom-fonts/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
