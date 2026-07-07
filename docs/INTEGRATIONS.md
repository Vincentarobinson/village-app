# Integration wiring notes

## Stripe Identity (ID verification gate)

One **platform** Stripe account (Vincent's) — users never create Stripe
accounts. ~$1.50/verification, billed to the platform.

1. Create Stripe account → enable Identity
2. Supabase Edge Function `create-verification-session`:
   `POST /v1/identity/verification_sessions` → return `client_secret` + hosted URL
3. App (`app/(onboarding)/verify-identity.js`): open the hosted flow via
   `expo-web-browser`, replacing the current stub
4. Webhook Edge Function: on `identity.verification_session.verified` →
   set `users.id_verified_at`
5. RLS everywhere: profile reads require the caller's `id_verified_at` to be set

## Checkr (sitter background checks — Phase 3)

One platform Checkr account. **Sitters pay the screening fee** (collect via
Stripe payment at application before creating the Checkr invitation).

1. `POST /v1/candidates` with sitter's info (SSN collected by Checkr Hosted
   Apply — never store it)
2. `POST /v1/invitations` → Checkr emails the FCRA-compliant flow
3. Webhooks `report.completed`: `clear` → `sitters.check_status='verified'`;
   `consider` → manual review + FCRA adverse-action tooling
4. Re-check annually (cron on `verified_at`)

Package: Basic+ (SSN trace, national criminal, sex-offender registry,
county criminal), ~$30–55.

## Photo pipeline (every upload)

1. Client: `expo-image-manipulator` → resize 1600px, JPEG q80, EXIF stripped
2. Upload to Supabase Storage (signed URL; bucket per surface: avatars,
   meetups, listings, chat-media)
3. Storage webhook → Edge Function → moderation API (Hive or AWS Rekognition):
   auto-reject high-confidence NSFW/violence, queue medium for review
4. Photo goes public only after `photo_moderation.verdict='pass'`
5. Serve via CDN transform URLs; long-press report on every image surface

## Push notifications

Expo Notifications: connection requests, accepted connections, RSVPs,
messages, "Village is live in your area."
