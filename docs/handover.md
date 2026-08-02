# Road Panther Perks — handover

**Date:** 2 August 2026
**From:** Elwin Daniel
**To:** Ahmed El-Ghrably

Ahmed,

I'm stepping back from the project. Everything is in your hands and in working
order — the code, the hosting, the database and the accounts are all under your
ownership, and nothing is locked to me.

This document is written so that you can hand it straight to the next developer.
It lists what is built and live, what is not, and the things I'd want them to
look at in their first week. I've been deliberately plain about the unfinished
items, including two security ones, because a handover that only lists the good
news isn't much use to anyone.

> **[Elwin — fill in]** One line on your last working day and whether you're
> available for questions afterwards. Say something you'll actually honour.

---

## 1. What is live right now

### The public site

Six pages, all live at roadpantherperks.co.uk:

- **Home** — repositioned around the new statement, with the Road Professionals
  dropdown in the navigation
- **Perks** — the offers listing (shows a "launching soon" state until partners
  are signed)
- **Partners** — approved partners, with Advanced-tier partners ranked above Basic
- **How it works**, **About**, **Contact**
- Plus Privacy and Terms

### Members ("road professionals")

- Sign up, email confirmation, login, password reset
- Upload a verification document at signup
- A profile they can keep up to date
- A dashboard showing their verification status
- **A digital member card** — see section 3

### Businesses

- A business can apply to become a partner from the site
- The application lands in your admin area for approval or rejection
- Approved partners get emailed a secure Stripe link to choose a plan and pay
- Two tiers: **Basic £9/month** (1 offer) and **Advanced £24/month** (3 offers).
  The tier's offer limit is enforced automatically — the system won't let a Basic
  partner be given a second offer
- Advanced partners are badged "Recommended Road Panther Partner" and rank
  higher in listings

### Your admin area

Rebuilt to the layout you asked for — sections down the left, content on the
right — with five sections:

| Section | What you can do |
| --- | --- |
| **Overview** | Total and active members, new signups today / this week / this month, businesses awaiting approval, offers live, paying partners, monthly recurring revenue, and a single list of everything waiting on a decision |
| **Road Professionals** | See every member and waitlist signup, view and edit them, add one by hand, approve or reject |
| **Businesses** | Applications and partners, approve/reject, edit details, manage their offers, generate a payment link, add a business by hand, delete one |
| **Perks & Offers** | Every offer across every partner in one place, live vs draft |
| **Payments** | Each partner's subscription status, MRR, failed payments, and who's approved but never paid |

### Payments

Stripe Checkout with monthly subscriptions, connected and live. It automatically
marks a partner active when they pay, flags them when a payment fails, clears the
flag when they pay again, and marks them cancelled if they cancel — all without
you touching anything.

---

## 2. Your recent feedback — all four done

1. **"Other" category had no text box.** Choosing Other now requires you to type
   what the business actually is, and that text shows throughout the admin.
2. **You couldn't add a business yourself.** You can now — there's an "Add
   business" button, and you choose the status and plan directly, so a partner
   you signed over the phone can go straight to approved.
3. **The category list.** Replaced with yours: MOT & Services, Car Repair, Tyres,
   Car Wash, Car Sales Garages, Barbers, Beauty/Nail/Hair Salons, Gyms, Food &
   Drink, Mobile Phone Shops, Other. I combined your beauty, nail and hair line
   into one option — easy to split into three if you'd rather.
4. **The admin dashboard layout.** Rebuilt as sections-on-the-left, as above.

I also fixed something you spotted indirectly: the application email still said
**£150/month** from the old pricing. All prices now come from one place in the
code, so they can't drift out of step with what Stripe actually charges again.

---

## 3. The member card

Built from the design you sent. A verified member gets a card showing their
photo, name, member ID (`RPP-10001` and up), verified driver type, verification
badges and the benefits row.

Two things you should know before partners start honouring it:

**It is not tamper-proof.** It's a web page. A member can screenshot it, and a
merchant has no way to tell a real card from a convincing fake. I've put a date
on the card that updates daily so a shared screenshot visibly ages, but that's a
speed bump, not a lock. If the discounts are worth real money, the merchant side
eventually needs either a QR code the partner scans or a lookup by member ID.
That's a decision about the *merchant* experience and it's worth making
deliberately rather than discovering later.

**Members can change their own photo after approval.** That's the right trade-off
for now — an admin approving every photo doesn't scale — but it means the
"ID verified" badge attests to the document check at signup, not to the photo
currently on the card.

---

## 4. What is *not* built

Being clear about this so nobody promises it to a partner.

- **Redeeming an offer.** A member can see that offers exist and show their card,
  but there is no in-app redemption flow — no discount codes revealed, no
  redemption tracking. This is the most valuable next piece of work.
- **Pillar 2 (Roadside support), Pillar 3 (Wellbeing), Pillar 4 (Jobs board)** —
  not started. Pillars 2–4 content is blocked on your PDFs (see section 7).
- **Pillar 5 (Community)** — deliberately left out, as we agreed.
- **A partner login.** Partners have no account and can't manage their own
  listing; everything about them is managed by you in the admin. This was a
  deliberate choice to ship faster, not an oversight.
- **Invoice history, refunds, revenue-over-time charts.** The Payments section
  shows what we can state accurately today. Anything more needs Stripe's records
  copied into our own database first.
- **Analytics, notifications, email campaigns, suspend/reactivate, login
  activity.** All on your original admin spec, none of them needed to sign a
  partner, so none built.

---

## 5. Things the next developer should do first

I'd ask them to look at these in this order. The first two are security items
and I would not leave them long.

### a) Close the file-upload hole — **highest priority**

Anyone can currently upload unlimited files to the verification storage bucket
without logging in. The key that allows it is visible in the website's code, as
it is on every website of this type — the mistake is the storage rule that trusts
it. Nothing suggests this has been abused.

The fix is to switch to signed upload links. A note in the code explains why the
obvious alternative doesn't work (server upload limits are smaller than the files
we accept). **Do not let a developer "fix" this by moving uploads through the
server without reading that note first.**

### b) Verify the driver-permissions fix is actually applied

I found that a driver could, with technical knowledge, set their own account
status to approved. I wrote the fix but was never able to test it against a
running database. The member card now depends on it: the card says "ID VERIFIED",
and that claim is worthless if a member can approve themselves.

A developer can confirm it in under a minute — the check is in
`docs/roadmap.md`. **Treat this as unverified until someone confirms it.**

### c) Take a real payment end to end before trusting it

Stripe is connected and the webhook is live, so this is verification rather than
work. Put a real partner (or yourself) through checkout once and confirm the
business flips to "active" in the Payments section by itself. That's the only
proof the whole chain works.

Worth knowing there was a bug here that would have bitten silently: Stripe
changed the shape of their payment data in 2025 and the code was reading the old
format, so failed payments would never have been flagged. It now handles both
formats — but that path only gets exercised when a card actually fails, so it
hasn't been seen working in the wild.

**When you go live**, Stripe's test mode and live mode are separate. The live
mode needs its own webhook connection and its own keys in Vercel; the test ones
won't carry over.

### d) The verification "replace" button

You reported this and I never got the error message from you. My strongest
suspicion is a missing configuration value in the live environment rather than a
code fault — the value is called `SUPABASE_SERVICE_ROLE_KEY` and it needs to be
set in Vercel. That's a 30-second check and probably the whole fix. If it's
already set, the next developer will need the actual error text from you.

### e) Then: build offer redemption

Section 4, first bullet. Until it exists, a member who signs up and gets approved
finds nothing to actually use.

---

## 6. Access and accounts

Everything is in your name or handed to you. Nothing depends on my accounts.

| What | Where | Notes |
| --- | --- | --- |
| Code | GitHub — `roadpantherperks-uk/hub` | Owned by you. Full history, every change documented |
| Hosting | Vercel | Deploys automatically when code is pushed |
| Database, logins, file storage | Supabase — project `hub` | |
| Payments | Stripe | |
| Email | Zoho Mail | Both the app's emails and the login emails |
| Domain | roadpantherperks.co.uk | |

GitHub is under your ownership already.

> **[Elwin — fill in]** Confirm the same for **Vercel, Supabase and Stripe** —
> that Ahmed is owner, not just a member — and remove your own access where
> appropriate. Worth doing before you send this, not after: an account still
> tied to you is the thing that turns a clean exit into a phone call in three
> months.

**Tell the next developer:** the configuration values the site needs are listed
in `.env.example` in the repository, with a comment explaining each one. The real
values live in Vercel's settings, never in the code.

**Documentation in the repo:**

- `docs/roadmap.md` — the technical plan, phase by phase, including why certain
  things were deliberately not built
- `docs/plan-july.md` — the July scope and my reasoning on the commission question
- `docs/supabase-auth-emails.md` — how to brand the login/confirmation emails
- `docs/handover.md` — this document

`docs/roadmap.md` was brought up to date on 2 August 2026 and reflects the
current state of the code, including the two unfinished security items in
section 5.

---

## 7. What's still with you

- **The PDFs for Pillars 2, 3 and 4.** Nothing on those three pillars can be
  built until they arrive. Each one is roughly half a day of work once it does.
  These have been on your side of the critical path for a while.
- **The lead model for Pillar 2.** My recommendation stands: tracked phone
  numbers and billing per lead, rather than a percentage of job value we can't
  verify. The reasoning is in `docs/plan-july.md` section 1.
- **Brand assets and copy for partners you're confident of**, so the perks pages
  have something real in them.

---

## 8. A note on hiring the next developer

Two things worth asking any candidate, because both would cost you real money to
get wrong:

1. **Ask them to read `docs/roadmap.md` before quoting.** It explains why certain
   things were built in the order they were. Someone who wants to rebuild it all
   differently on day one may be right, but they should be able to say why.
2. **Give them section 5 as their first task list.** How they handle the two
   security items — whether they verify before claiming they're fixed — will tell
   you a lot.

---

Thank you for the amount of thought you put into the planning. The pillars
document made this far easier to scope than it would otherwise have been, and
the project is in a genuinely good state to hand on.

> **[Elwin — fill in]** Close it however you want to. Keep it short and don't
> apologise for leaving.

Elwin
