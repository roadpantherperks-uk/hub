# Road Panther Perks — Plan to 31 July

Hi Ahmed,

I've been through the pillars document, the dashboard sketch, the admin dashboard doc and your questions. Here's the plan, my answer on the commission question, and the few things I need from you.

---

## 1. Your question on Pillar 2 — tracking the 10%

**Short answer: billing 10% of job value isn't enforceable, and I'd recommend we don't build it. There's a model that gets you paid more reliably and is far less work.**

The problem is that the money never touches the platform. A driver breaks down, the recovery firm takes £120 on a card reader at the roadside, and we have no visibility. Any system where the provider tells us "that was a £120 job, here's your £12" relies entirely on their honesty, and the incentive runs the wrong way — under-reporting would grow as volume grows. We'd have built an invoicing system on top of numbers we can't check.

We only get paid reliably if we control **the money** or **the introduction**.

Controlling the money means taking payment in-app and passing 90% on to the provider. It's the only way to *guarantee* the 10%, but it means card onboarding and ID checks for every small operator, handling refunds and disputes, and drivers paying through an app while the mechanic is stood there with a card machine. Big build, regulatory weight, for the smallest pillar. I'd rule it out.

**Controlling the introduction is the answer.** Each provider gets their own tracked phone number on their listing. The driver taps Call, it routes through our number to theirs. We then have a log we can't fake — which provider, which driver, when, how long they spoke. We bill per lead, so we never need to know the job value at all.

This is what Checkatrade, MyBuilder and Bark all do, for exactly this reason. It also sells better: *"free listing, you only pay when we send you a real customer"* is a much easier first conversation than asking a small operator for a cut of their takings.

**My suggestion:** launch with free listings and tracked numbers, charging nothing at first. After 4–8 weeks we'll have real call logs, and converting providers to a paid per-lead model is then straightforward — we can show them exactly how many customers we sent. That's a conversation we simply can't have if we're relying on self-reporting.

As a bonus, that call data is also what makes the Pillar 6 sponsor pitch credible. *"We generated 400 calls to partner businesses last quarter"* is a real number, and it's the kind of thing sponsors pay for.

Cost is roughly £1/month per number plus pennies per minute.

---

## 2. What ships by 31 July

Your goal — start approaching businesses and start getting paid — is what I've scoped to. Everything here serves it.

1. **Homepage repositioning.** Your new positioning statement, and the Road Professionals dropdown. This also means building the Perks, Partners, How it Works and About pages, which don't exist yet — the site is currently a single page.
2. **Partner applications.** A business can apply to become a partner from the site. You see applications in the admin area and approve or reject them.
3. **Taking payment.** A Stripe payment link — see the note below on why I wouldn't build subscriptions yet.
4. **Two fixes**, covered in section 5.

That's roughly 7 days of work against about 10 working days before the 31st. The gap is deliberate — I'd rather hold slack than miss the date.

> **[Elwin — fill in]** One line here on your realistic availability across the month. Better to state it plainly now than to have it become the reason the date slips.

---

## 3. What follows, and why in that order

Your dashboard document is the right destination and we'll get there. But some of it can't usefully be built yet.

**Perks & offers management, and the public perks listing.** These exist to display partners, and right now we have none. Built in July they'd be empty screens showing data that only exists once the outreach works. Built in early August, you'll have real partners to put in them — and I'll know what the perks actually look like instead of guessing at the shape.

**Revenue, MRR, payments and subscriptions.** For your first ten partners at £150/month, a Stripe payment link and a spreadsheet does the job perfectly and works today. An MRR chart showing £1,500 is a nice screen that tells you something you already know. This becomes worth building at around twenty partners, when the manual process starts genuinely costing you time.

**Login activity, notifications, analytics, suspend/reactivate.** All sensible for a mature platform. None of them needed to sign a founding partner.

**Pillar 5 (Community).** Taking you up on your offer to leave this one out. Beyond the build cost, a community needs enough active members to feel alive — a quiet forum reads worse than no forum at all. It also brings moderation and data-protection obligations that are real work to run, not just to build. Worth revisiting once we're at a few hundred active members.

**Pillar 4 (Jobs board).** A substantial product in its own right. It deserves its own slot rather than being squeezed into a corner of this month.

As you asked, I'll have the database structured for all of these as we go, so none of it needs rework when we come to it.

---

## 4. What I need from you

1. **The PDFs for Pillars 2, 3 and 4.** These are blocked until they arrive. Once I have them each hub is quick — roughly half a day, since drivers just browse and download them behind a login. Worth knowing they sit on your side of the critical path, not mine.
2. **A decision on the lead model in section 1** — happy to talk it through on a call if that's easier than messages.
3. **Brand assets and copy for any partner you're already confident of**, so the perks pages have something real in them when we build them in August.

---

## 5. Two things I found

**The verification 'replace' link.** I've traced the upload path, but I'd rather tell you I don't yet know the exact cause than guess at it. My leading suspect is a server configuration value that may be missing in the live environment rather than anything in the code — I'm checking that regardless. **If you still have the error message, send it over and I'll almost certainly have this fixed the same day.** It's a small fix once I know which of two things it is.

**A permissions issue I want to flag.** While reviewing the driver system I found that a driver could, with some technical knowledge, set their own account status to approved. Nothing suggests anyone has. But since we're about to tell businesses that every member is hand-verified, that needs to be true before we make the claim — so that one is fixed and going live this week. Flagging it rather than quietly patching it, because you should know what's in your platform.

---

## 6. On communication

You were right, and I meant what I said. I'll send you a short update every **[Elwin — set a cadence you will actually hold to. Weekly is fine. A cadence you hit beats an ambitious one you don't.]**, whether or not there's much to report, so you're never left wondering.

Thanks for the amount of thought you've put into the planning — the pillars document made this much easier to scope than it would otherwise have been.

Elwin
