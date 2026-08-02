# Road Panther Perks — from here to there

Internal working doc. The client-facing July slice is [plan-july.md](./plan-july.md);
the handover written when I stepped back is [handover.md](./handover.md).

**Last updated:** 2 August 2026.

---

## Where we actually are

Verified against the codebase and against the live database, not the mockups.

**Database** — `user_roles`, `drivers`, `driver_signups` (legacy waitlist, nothing
writes to it any more), `businesses`, `business_users`, `business_relationships`,
`perk_categories`, `perks`. Enums: `app_role`, `signup_status`, `business_status`,
`billing_status`, `relationship_type`. Three storage buckets: `verification`
(private), `business-logos` (public), `member-photos` (private).

**Site** — landing page, `/perks`, `/partners`, `/how-it-works`, `/about`,
`/contact`, `/join`, `/privacy`, `/terms`, the auth flows, the partner
application → payment flow, the member dashboard including the digital member
card, and a five-section admin area.

**Payments** — Stripe Checkout with monthly subscriptions on two tiers (Basic £9
/ Advanced £24), connected and live, with a signature-verified webhook driving
`billing_status`.

**Not built** — offer redemption, resources, providers, leads, jobs, community.

**Still true and worth restating:** the design mockup showing Pilot Flying J and
Love's perk cards is not the shipped site. Those are US truck-stop chains that
don't trade in the UK, and "25c/gal" is US pricing. They can't survive contact
with a real partner conversation.

---

## The three decisions from Phase 1 — all held up

Recorded because they're the expensive ones to reverse, and a future developer
will be tempted to undo them.

1. **One `businesses` table, not three.** A business's relationship to the
   platform (perk partner / service provider / sponsor) lives in
   `business_relationships`, so one business can be several things at once.
   Three near-identical tables would have meant three approval flows, three admin
   screens and three sets of RLS to keep in sync.
2. **A member and a business owner can be the same person.** Mobile mechanics and
   tyre fitters are members *and* providers. `user_roles` supports multiple roles;
   `drivers` (membership) stays separate from `businesses` (ownership), linked
   through `business_users`. Never assume one auth user maps to one role.
3. **Shape for money before building payments.** `plan`, `billing_status` and the
   Stripe id columns went on `businesses` from day one. This paid off — the
   subscription flow landed later without reshaping a table under a live admin UI.

**Naming:** `drivers` is the wrong word — the product says "road professionals".
It's internal, the rename would touch everything, so it stays. The UI says
"members" and "road professionals" throughout.

---

## Phases

### Phase 0 — stop the bleeding — **INCOMPLETE**

- [x] Column-level grants so drivers can't self-approve —
      `20260717120000_lock_down_driver_self_update.sql`. **Applied status
      unverified.** Confirm with:
      ```sql
      select privilege_type, column_name
        from information_schema.column_privileges
       where table_name = 'drivers' and grantee = 'authenticated'
         and privilege_type = 'UPDATE';
      ```
      Expect only `phone`, `driver_type`, `driver_type_other`, `location`,
      `location_other`, `photo_url`. If `status` is in that list, a driver can
      still self-approve — and the member card's "ID VERIFIED" badge is worthless.
- [ ] Verification replace bug — **still open.** Leading suspect is
      `SUPABASE_SERVICE_ROLE_KEY` missing in the Vercel environment. If it's set,
      the next step is the actual error text from Ahmed.
- [ ] **Signed upload URLs, then drop the anon storage INSERT policy.** Anyone
      with the publishable key — which ships in the JS bundle — can upload
      unlimited files to the `verification` bucket. Do **not** "fix" this by
      moving uploads through a server action: Next caps action bodies at 1MB,
      Vercel caps serverless request bodies at 4.5MB, and the uploader accepts
      10MB files. `member-photos` is already done correctly (authenticated-only,
      each user confined to their own folder) — copy that shape.

### Phase 1 — sell to businesses — **DONE**

`businesses` / `business_users` / `business_relationships` + RLS, the public
partner application flow, admin list + detail + approve/reject, the four public
pages, repositioning copy, and Stripe.

Went further than scoped: rather than a manual payment link, this is full
Checkout Sessions with inline subscription pricing and a webhook, written against
Stripe's REST API with no SDK. Tier offer limits are enforced server-side.

→ *Revenue stream 1 unlocked.*

### Phase 2 — show the perks — **MOSTLY DONE**

- [x] `perk_categories`, `perks`
- [x] Public `business-logos` bucket
- [x] Admin perks CRUD, plus a cross-business Perks & Offers section
- [x] Public perks listing
- [x] Digital member card (`/dashboard/card`) — the in-store redemption mechanism
- [ ] **Actual redemption.** A member can show a card but there's nowhere to get
      a discount code. `getActivePerks` deliberately withholds `code` and `link`,
      and the dashboard has no perks view. **This is the next piece of real work**
      — until it exists, an approved member logs in and finds nothing.
- [ ] Perk detail pages and category filtering on `/perks`

Note the card's badge depends on `drivers.status`, which makes Phase 0's first
item load-bearing rather than merely tidy.

### Phase 3 — content pillars — blocked on Ahmed's PDFs

`resources` table, private `resources` bucket, gated download via signed URL,
hubs at `/road-professionals/{support,wellbeing,opportunities}`, and
`resource_downloads` — which is sponsor-pitch data, not vanity.

~half a day each once the first one exists.

### Phase 4 — roadside support + leads

`service_providers` (→ `businesses`), `service_categories`, Twilio tracked
numbers, `leads` fed by the call webhook, admin lead report → manual invoicing.

→ *Revenue stream 2 — and the evidence base that makes Phase 6 sellable.*

### Phase 5 — money infrastructure (trigger: ~20 partners, not a date)

Mirror Stripe's records into our own tables: `subscriptions`, `invoices`. Only
then are invoice history, refunds and revenue-over-time real rather than
decorative. The Payments admin section is deliberately built to show only what we
can state accurately today.

Smaller loose end: no customer-portal link, so partners can't update a card or
cancel without going through you.

### Phase 6 — marketplace

Mostly a listing tier on `businesses` plus affiliate links. Cheap now Phase 1
exists. → *Revenue streams 3 and 5.*

### Phase 7 — jobs board

A product in its own right. → *Revenue stream 4.*

---

## Known gaps that aren't phases

- **No partner login.** `business_users` exists but nothing writes to it.
  Partners can't manage their own listing; everything is admin-managed. A
  deliberate choice to ship faster — decide it rather than drift into it.
- **The member card is not tamper-proof.** It's a web page; a screenshot works.
  The live date stamp ages a shared screenshot, nothing more. A real fix is a QR
  the merchant scans, or a lookup by member ID — but that's a decision about the
  merchant experience, not just a build task.
- **Members can change their own card photo after approval**, so "ID VERIFIED"
  attests to the signup document check, not to the current photo.
- **Categories are hardcoded** in `src/lib/options.ts` and seeded in SQL. Ahmed's
  admin spec has "Platform Settings → Categories", which means a DB-backed list
  and a settings screen. Worth doing once rather than editing code each time.

---

## Not building

- **Pillar 5 (Community)** — Ahmed offered to drop it; taken. Moderation and GDPR
  load, and a quiet forum reads worse than none.
- **In-app payment for roadside jobs** — the only way to *guarantee* 10%, but it
  means KYC for every small operator, refunds, disputes and payment-facilitator
  exposure, for the smallest pillar.
- **10%-of-job-value billing** — unenforceable. We never see the money. Bill the
  lead instead. Reasoning in [plan-july.md](./plan-july.md) section 1.
- **Login activity, analytics, notifications, suspend/reactivate** — real
  features, none needed to sign a founding partner.
