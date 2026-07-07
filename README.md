# Village — Mobile App

**It takes a village. Find yours.** The community app for single parents.

React Native + Expo (one codebase → App Store + Play Store), Supabase backend (same `village` project as [village-landing](https://github.com/Vincentarobinson/village-landing)).

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (iOS/Android), or press `i` for the iOS simulator / `a` for Android.

## What's in the scaffold

Every v1 screen, navigable end-to-end with mock data:

| Area | Screens |
|---|---|
| Onboarding | Welcome, Sign up, Sign in (real Supabase Auth), ID-verify gate (stubbed), Profile setup (required photo, age ranges, interests), Not-in-your-area |
| Discover | Feed with filters (distance/moms/dads), parent profile, connect (mutual-consent) |
| Meetups | List, detail + RSVP + group-chat link, host flow |
| Market | **Sitters live** (browse, profile, message, in-app application → Supabase), Deals + Give & Get show "coming soon" |
| Messages | Threads, chat UI, report/block on every thread |
| Me | Profile, stats, trust & safety card, settings, sign out |

Cross-cutting: screenshots/recordings blocked app-wide (`expo-screen-capture`), Village design tokens (`lib/theme.js`), photo picking with EXIF disabled.

## Build milestones (what's stubbed → real)

1. **Profiles on Supabase** — write profile-setup to `profiles` + storage upload with moderation pipeline
2. **Discover on PostGIS** — real geo queries + connections table
3. **Realtime chat** — Supabase Realtime channels replacing mock threads
4. **Meetups CRUD** + auto group chats + push notifications
5. **Stripe Identity** — replace the stub in `app/(onboarding)/verify-identity.js` (see `docs/INTEGRATIONS.md`)
6. **Checkr** sitter onboarding (sitter pays; Hosted Apply + webhooks)
7. EAS Build → TestFlight

## Structure

```
app/            expo-router screens (file = route)
  (onboarding)/ auth + verification + profile setup
  (tabs)/       discover / meetups / market / messages / me
components/     shared UI primitives (Village design system)
lib/            theme tokens, supabase client, app state, mock data
docs/           integration wiring notes
```
