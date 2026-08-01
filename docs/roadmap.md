# Road Panther Perks — from here to there

Internal working doc. The client-facing version of the July slice is [plan-july.md](./plan-july.md).

---

## Where we actually are

Verified against the codebase, not the mockups.

**Database** — three tables. `user_roles`, `drivers`, and `driver_signups` (a legacy waitlist; nothing writes to it any more, the public flow goes `auth.signUp` → `handle_new_driver` trigger → `drivers`). Enums: `app_role` (admin, user, driver, business), `signup_status` (pending, approved, rejected). One private storage bucket, `verification`.

**Site** — a single landing page plus `/join`, `/contact`, `/privacy`, `/terms`, the auth flows, `/dashboard`, `/dashboard/profile`, and three admin pages. `Header.tsx` has two links: Login and Sign up.

**Not built** — businesses, perks, payments, resources, providers, leads, jobs, community. That's five of the six pillars and all five revenue streams.

**Worth being clear about:** the design mockup showing the full nav and the Pilot Flying J / Love's perk cards is not the shipped site. Those are US truck-stop chains that don't trade in the UK, and "25c/gal" is US pricing — they can't survive contact with a real partner conversation. The live landing page is honest about being pre-launch, which is better.

---

## Three decisions to make now

Ahmed asked for the database to be "ready" for the later pillars. These are the three that are expensive to reverse, so they're worth getting right before Phase 1 rather than after.

### 1. One `businesses` table, not three

Pillar 1 partners offer perks. Pillar 2 emergency services take leads. Pillar 6 sponsors pay for branding. It is tempting to build three tables, and it would be a mistake — three near-identical approval flows, three admin screens, three sets of RLS to keep in sync.

They are all *businesses*; what differs is their relationship to the platform. And a business can hold more than one at once — a mobile tyre fitter could plausibly offer members a discount **and** take emergency leads **and** sponsor. So the relationship goes in a join table, not a type column on `businesses`.

### 2. A member and a business owner are the same person

This one is easy to miss. The positioning explicitly covers "mobile mechanic, tyre fitter, recovery operator, tradesperson" as **members** — and Pillar 2 lists mobile mechanics, tyre fitters and recovery firms as **providers**. Those are the same people on both sides of the marketplace.

So: never assume one auth user maps to one role. `user_roles` already supports multiple, which is good. Keep `drivers` (membership) separate from `businesses` (ownership) and link users to businesses through a `business_users` table. Do not hang business fields off `drivers`.

### 3. Shape for money before building payments

Don't build subscriptions yet (see Phase 5). But put `plan`, `billing_status` and `stripe_customer_id` on `businesses` from the start. Backfilling twenty rows later is trivial; reshaping a table underneath a live admin UI is not.

**Naming:** `drivers` is now the wrong word — the product says "road professionals". It's internal and the rename would touch everything, so keep it. New tables should use `member_*` where it matters.

---

## Phases

### Phase 0 — stop the bleeding (this week, ~1 day)

- [x] Column-level grants so drivers can't self-approve — `20260717120000_lock_down_driver_self_update.sql`. **Written, untested** (no Docker locally). Apply to staging first; verify a driver can still save their profile and can no longer set `status`.
- [ ] Verification replace bug — **blocked**. Need the error text from Ahmed, or check whether `SUPABASE_SERVICE_ROLE_KEY` is set in the Vercel env (30 seconds, and it's my leading suspect).
- [ ] Signed upload URLs, then drop the anon storage INSERT policy. Right now anyone with the publishable key — which ships in the JS bundle — can upload unlimited files to the bucket. Do **not** "fix" this by moving uploads through a server action: Next caps action bodies at 1MB, Vercel caps serverless request bodies at 4.5MB, and the uploader accepts 10MB files.

### Phase 1 — sell to businesses (by 31 July, ~7 days)

The only phase with a deadline. Everything in it serves "reach out to businesses and get paid".

- `businesses`, `business_users`, `business_relationships` + RLS
- Public partner application flow
- Admin: application list, detail, approve/reject
- Public pages: `/perks`, `/partners`, `/how-it-works`, `/about` + Road Professionals dropdown
- Repositioning copy from the PDF
- Stripe payment link — manual, not a subscriptions system

→ *Unlocks revenue stream 1.*

### Phase 2 — show the perks (early Aug, ~4 days)

Deliberately **after** Phase 1: these screens display partners, and until the outreach works there are none. Built now they'd be empty shells built on guesses about what a perk looks like.

- `perk_categories`, `perks`
- Public `business-logos` bucket
- Admin perks CRUD
- Public perks listing + detail, redemption gated on `drivers.status = 'approved'` — which is only meaningful once Phase 0 lands

### Phase 3 — content pillars (Aug, blocked on Ahmed's PDFs)

- `resources` (pillar, category, title, file_path, published_at)
- Private `resources` bucket, gated download via signed URL
- Hubs: `/road-professionals/{support,wellbeing,opportunities}`
- `resource_downloads` — this is sponsor-pitch data, not vanity

→ *Pillars 2, 3 and 4 content. ~half a day each once the first one exists.*

### Phase 4 — roadside support + leads (Sep)

- `service_providers` (→ `businesses`), `service_categories`
- Twilio tracked numbers, `leads` table fed by the call webhook
- Admin lead report → manual invoicing

→ *Revenue stream 2 — and the evidence base that makes Phase 6 sellable.*

### Phase 5 — money infrastructure (trigger: ~20 partners, not a date)

- Stripe customers, subscriptions, webhooks
- `subscriptions`, `invoices`
- **Only now** are the revenue/MRR dashboard tiles real rather than decorative

### Phase 6 — marketplace (cheap once Phase 1 exists)

Mostly a listing tier on `businesses` plus affiliate links. → *Revenue streams 3 and 5.*

### Phase 7 — jobs board

A product in its own right. → *Revenue stream 4.*

---

## Not building

- **Pillar 5 (Community)** — Ahmed offered; taken. Moderation and GDPR load, and a quiet forum reads worse than none.
- **In-app payment for roadside jobs** — the only way to *guarantee* 10%, but it means KYC for every small operator, refunds, disputes and payment-facilitator exposure, for the smallest pillar.
- **10%-of-job-value billing** — unenforceable. We never see the money. Bill the lead instead.
- **Login activity, analytics, notifications, suspend/reactivate** — real features, none needed to sign a founding partner.
