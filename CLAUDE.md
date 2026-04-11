# Training Performance Tracker

A minimalist gym/weightlifting tracking app built with React Native (Expo). Tracks exercises, lift entries (weight in KG + reps), and calculates estimated 1-rep max metrics.

## Tech Stack

- **Framework:** React Native 0.83 via Expo SDK 55
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native) + inline `style` props for font family/sizing
- **Navigation:** React Navigation v7 (bottom tabs + native stack)
- **Backend:** Supabase (optional) with AsyncStorage offline fallback. When Supabase env vars are not set, the app seeds demo data and persists to local cache.
- **Fonts:** Inter (400 Regular through 900 Black via `@expo-google-fonts/inter`)

## Commands

```bash
npm start        # Start Expo dev server
npm run android  # Run on Android device/emulator
npm run ios      # Run on iOS simulator
npm run web      # Start web version
```

No test runner or linter is currently configured.

## Project Structure

```
src/
  hooks/          # React hooks (useTrainingData — central data access hook)
  lib/            # Business logic and data access
    supabase.ts       # Supabase client init (gracefully handles missing env vars)
    trainingRepository.ts  # CRUD operations (Supabase with AsyncStorage fallback)
    oneRm.ts          # 1-rep max estimation (Epley variant) and helpers
  navigation/     # React Navigation setup (bottom tabs + History stack)
  screens/        # Screen components (Workout, History, ExerciseDetail, Metrics, Profile)
  theme/          # Mono theme constants (colors, typography)
  types/          # TypeScript domain types (Exercise, LiftEntry)
docs/
  DESIGN.md                    # Design system spec ("Kinetic Monolith" editorial aesthetic)
  design_specification_design.md  # Screen/component design spec
  supabase_schema.sql          # Supabase database schema (exercises, lift_entries, exercise_stats view)
```

## Architecture Patterns

- **Offline-first dual data path:** Every repository function in `trainingRepository.ts` tries Supabase first, falls back to AsyncStorage on failure or when Supabase is not configured. Cache is keyed as `training-performance-tracker:v1`.
- **Single hook for data access:** `useTrainingData()` provides exercises, liftEntries, loading/error state, and mutation functions (addEntry, updateEntry, deleteEntry, deleteExerciseById). All screens consume this hook directly.
- **No auth:** v1 is single-user. Supabase RLS is disabled.
- **All weights are in kilograms (KG).** No unit conversion exists.

## Design System (Mono Theme)

The UI follows a warm monochrome palette — not pure black/white. Key colors are defined in both `src/theme/mono.ts` and `tailwind.config.js` under the `mono-*` prefix:

| Token                | Hex       | Usage                        |
|----------------------|-----------|------------------------------|
| `mono-background`    | `#f5f0e8` | Page/screen background       |
| `mono-primary`       | `#1a1a1a` | Headlines, buttons, key text |
| `mono-secondary`     | `#6b6560` | Labels, metadata             |
| `mono-surface`       | `#ece7de` | Card/section backgrounds     |
| `mono-surfaceContainer` | `#ddd8cf` | Input fields, chips       |
| `mono-primaryContainer` | `#2e2e2e` | Dark containers             |

Key design rules from the spec:
- **No border lines** for sectioning. Use background color shifts and spacing instead.
- **Sharp corners** (border-radius `sm` = 4px). Nothing above 12px.
- **Inter font only**, with aggressive letter-spacing on display/headline sizes.
- **Typography hierarchy:** Display (54/42px Black) for hero metrics, Headline (32px Bold), Body (16px Regular), Label (11px Bold uppercase) for unit markers.

## Data Model

Two Supabase tables (see `docs/supabase_schema.sql`):

- **exercises:** `id` (uuid), `name` (unique text), `created_at`
- **lift_entries:** `id` (uuid), `exercise_id` (FK), `weight_kg`, `reps`, `performed_at`, `notes`, `created_at`
- **exercise_stats** (view): aggregates max weight, last session, entry count per exercise

TypeScript domain types use camelCase (mapped from snake_case DB columns in `trainingRepository.ts`).

## Environment Variables

Copy `.env.example` to `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

The app works fully without these — it will use local AsyncStorage with seeded demo data.

## Navigation

Bottom tabs: **Workout** | **History** (default) | **Metrics** | **Profile**

History tab has a nested stack: `HistoryList` -> `ExerciseDetail` (receives `exerciseId` + `exerciseName` as route params). Long-press on a lift entry in ExerciseDetail opens an action menu (edit/delete).
