# Gym Tracker Mobile

React Native mobile app built with Expo Router.

## Run

This machine currently has Node available, but `npm` / `npx` are not installed in the shell path. After installing Node.js with npm, run:

```bash
npm install
npm run ios
```

or:

```bash
npm run android
```

## App Structure

- `app/(tabs)/index.tsx` - dashboard
- `app/(tabs)/workouts.tsx` - workout logger
- `app/(tabs)/nutrition.tsx` - meals and macros
- `app/(tabs)/progress.tsx` - body metrics and PRs
- `app/(tabs)/goals.tsx` - goals
- `src/data/mock.ts` - temporary mock data to replace with backend calls
- `src/components/` - reusable native UI components

## Backend Integration Points

Replace the mock data in `src/data/mock.ts` with API calls for:

- `GET /api/dashboard/summary`
- `GET /api/workouts/today`
- `POST /api/workouts`
- `GET /api/nutrition/today`
- `POST /api/nutrition/meals`
- `GET /api/progress`
- `GET /api/goals`
