# Project Structure

This repository contains three main workspaces:

```text
Gym Tracker Mobile/
├── backend/
├── frontend-web/
├── mobile/
├── README.md
├── Backend_structre.md
├── Project_structure.md
├── Db_details.md
├── Theme_guide.md
└── onboarding_data_map.html
```

## Root

### `README.md`

High-level project notes and basic run commands.

### `Theme_guide.md`

Approved visual theme for the mobile and web UI.

Use it as the source of truth for:

- Font
- Main colors
- Brand accent
- Card radius
- UI style direction

### `onboarding_data_map.html`

Reference document for onboarding requirements.

It defines the data collected during account creation:

- Body data
- Goal data
- Activity data

### `.gitignore`

Excludes:

- `.env`
- `node_modules`
- `.expo`
- local tooling
- OS files

## `mobile/`

React Native / Expo mobile app.

```text
mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── workouts.tsx
│       ├── nutrition.tsx
│       ├── progress.tsx
│       └── goals.tsx
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   ├── Card.tsx
│   │   ├── Charts.tsx
│   │   ├── ListItem.tsx
│   │   ├── Metric.tsx
│   │   └── Screen.tsx
│   ├── data/
│   │   └── mock.ts
│   ├── state/
│   │   └── session.ts
│   └── theme.ts
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── babel.config.js
└── run-ios.sh
```

### Mobile Routing

Uses Expo Router.

Routes:

- `mobile/app/index.tsx` - login/register landing screen
- `mobile/app/(tabs)/index.tsx` - dashboard
- `mobile/app/(tabs)/workouts.tsx` - workout logger UI
- `mobile/app/(tabs)/nutrition.tsx` - nutrition UI
- `mobile/app/(tabs)/progress.tsx` - progress UI
- `mobile/app/(tabs)/goals.tsx` - goals UI

### Mobile API Client

Located at:

```text
mobile/src/api/client.ts
```

Responsibilities:

- Login
- Register
- Fetch dashboard summary
- Attach `Authorization: Bearer <token>` for protected requests
- Store API response types

Default API URL:

```text
http://localhost:4000
```

Can be overridden with:

```env
EXPO_PUBLIC_API_URL="http://YOUR_HOST:4000"
```

### Mobile Session State

Located at:

```text
mobile/src/state/session.ts
```

Current behavior:

- Stores session in memory for fast access.
- Persists session with `expo-secure-store`.

Recommended next step:

- Add a visible logout button and session-expired handling in the UI.

### Mobile Components

Shared native UI components live in:

```text
mobile/src/components/
```

Main components:

- `Screen` - page wrapper with safe area and scrolling
- `Card` - surface container
- `Metric` - dashboard metric box
- `ProgressBar` - small progress indicator
- `Charts` - SVG-based charts
- `ListItem` - repeated list row

## `backend/`

Node.js / Express / Prisma backend.

See:

```text
Backend_structre.md
```

## `frontend-web/`

Static web prototype and architecture reference.

```text
frontend-web/
├── index.html
├── styles.css
├── app.js
└── gym_tracker_full_architecture.html
```

This is not the main production app. The main app is the Expo mobile app in `mobile/`.

## Run Commands

### Mobile

```bash
cd mobile
npm install
npm run ios
```

If using the local helper:

```bash
cd mobile
./run-ios.sh
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Apply Database Schema

Preferred with Prisma:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Fallback script:

```bash
cd backend
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" node scripts/apply-schema.mjs
```

## GitHub

Repository:

```text
https://github.com/Maxuodes0/RiotGym
```

Main branch:

```text
main
```
