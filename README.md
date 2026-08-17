# Baraha Hotel — Next.js 15 + Prisma

Marketing site + admin room board for Baraha Hotel and Lodge, a hill-station retreat in Bhedetar, Dhankuta, Nepal.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind v4)
- **Prisma + PostgreSQL** (Neon)
- **NextAuth v5** (credentials, JWT)
- **Vercel Blob** (image uploads)
- **Resend** (transactional email)
- **googleapis** (optional Google Sheets sync)

## Local development

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, etc.
2. Install dependencies: `npm install`
3. Run Prisma generate: `npx prisma generate`
4. (Optional) Seed demo data: `npm run db:seed`
5. Start the dev server: `npm run dev`

## Scripts

- `npm run dev` — start Next.js on localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm run db:seed` — seed the database with demo data

## Architecture

### Public site (marketing/SEO)

- `/` — homepage with hero, USPs, featured rooms, viewpoint highlight, testimonials
- `/rooms` — room type listing
- `/rooms/[slug]` — room detail with enquire CTA
- `/about`, `/gallery`, `/dining`, `/blog`, `/blog/[slug]`, `/contact` — CMS-driven pages
- ISR at 3600s with on-demand revalidation via `revalidatePublicSite()`

### Admin

- `/admin` — room board (dashboard)
  - Grid of room cards color-coded Vacant / Occupied
  - Tap a vacant room → short check-in form (guest name, phone, guests, rate)
  - Tap an occupied room → guest info, running list of room charges, add charge form, check-out button with confirm step
- `/admin/content` — CMS pages, settings, blog, gallery, testimonials

### Data model

- `RoomType` — room category (Standard, Deluxe, Family Suite)
- `Room` — physical room (number, floor, status)
- `RoomEntry` — a guest stay linked to a room
- `RoomCharge` — line items added during a stay (free-text items)
- `Invoice` — generated from RoomEntry + sum of RoomCharge rows

No online booking engine. No Guest / Booking / FoodOrder tables.

### Google Sheets sync (optional)

Set `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, and `GOOGLE_SHEETS_SPREADSHEET_ID` to mirror room entries to a Google Sheet. Sheets failures are non-blocking — the app's Postgres DB is the source of truth.
