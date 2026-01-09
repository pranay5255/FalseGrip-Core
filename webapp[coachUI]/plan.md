# FalseGrip Coach UI — Expo Mobile Plan

## Overview

Build a new Expo (React Native) app inside `ui/` that mirrors the web UI in `ui/app/page.tsx`.
The UI folder is the home for all UI surfaces, and `src/` is reserved for backend/server-side
services. The mobile app should match the web app's color scheme and styling as closely as
possible, while adapting layouts for touch-first mobile usage.

---

## Non-Negotiable Design Decisions

- UI lives under `ui/` only. The Expo app must be created in `ui/`.
- Backend/server services live under `src/` only.
- The Expo UI should visually match `ui/app/page.tsx` (palette, typography, spacing, and
  component tone).

---

## UI Style Parity Targets (from `ui/app/page.tsx`)

Key palette and UI traits to mirror in mobile:

- Base background: `slate-50` (#f8fafc)
- Card surfaces: `white`
- Primary text: `slate-900` (#0f172a)
- Secondary text: `slate-500` (#64748b)
- Borders: `slate-200` (#e2e8f0)
- Subtle hover/active fills: `slate-100` (#f1f5f9)
- Rounded corners: medium radius (~10px)
- Buttons: solid dark primary (slate-900) and light outline variants

Implementation guidance:

- Use NativeWind for class parity with web tailwind-style classes.
- Define shared design tokens in a mobile theme file (colors, spacing, radius).
- Use lucide icons via `lucide-react-native` or `@expo/vector-icons`.

---

## Recommended Folder Layout (within `ui/`)

```
ui/
├── app/                  # Existing Next.js web UI (keep)
├── mobile/               # New Expo app root (create)
│   ├── app/              # Expo Router screens
│   ├── src/              # Mobile-only components, hooks, theme
│   ├── assets/
│   ├── app.json
│   └── package.json
└── plan.md               # This plan
```

Reason: Expo Router uses an `app/` folder, so the mobile app should be isolated under
`ui/mobile/` to avoid collisions with the web `ui/app/`.

---

## Implementation Phases

### Phase 1: Expo App Scaffold (in `ui/mobile/`)

- Create Expo app with TypeScript template.
- Add Expo Router and configure entry to use router.
- Install NativeWind and configure tailwind config for RN.
- Add required Expo modules (safe-area, image picker, haptics as needed).

Deliverable: Expo app launches to a placeholder screen.

---

### Phase 2: Theme + Design Tokens (mobile parity)

- Create `ui/mobile/src/theme.ts` with shared color tokens mapped from web UI.
- Wire a simple `ThemeProvider` or export helpers used by components.
- Ensure global background uses `slate-50` and cards use white surfaces.

Deliverable: base layout uses correct colors and rounding.

---

### Phase 3: Core Screen Mapping

Map the web structure in `ui/app/page.tsx` to mobile:

- Clients list (cards) screen
- Client detail screen
- Section navigation (tabs) for:
  - Intake
  - Safety
  - Chat & Persona
  - Rituals
  - Habits
  - Nutrition
  - Training
  - Education

Mobile layout guidance:

- Use a top header with client name + save button.
- Use a horizontal scrollable tab bar or segmented control.
- Keep card-based layout, spacing, and typography consistent with web.

---

### Phase 4: Component Library (RN equivalents)

Build RN components that match the web UI tone:

- Card, Button, Tabs, Switch, Input, Textarea equivalents
- Client card list items
- Sidebar replacement (bottom tab or drawer for mobile)

Deliverable: UI components render with similar colors and weights.

---

### Phase 5: Data + Backend Integration (from `src/`)

- Define API client in `ui/mobile/src/api/` that talks to server code in `src/`.
- Use mock data until endpoints exist.
- Wire screens to fetch and update client configurations.

Deliverable: UI interactions are wired to services.

---

## Validation Checklist

- Mobile app matches web palette (slate background, card surfaces, border colors).
- Typography hierarchy aligns with web (bold titles, muted body text).
- Navigation flow mirrors `ui/app/page.tsx`.
- Screen layouts work on common device sizes.
- No backend logic lives inside `ui/` beyond API client wrappers.

