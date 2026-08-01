# Supabase Auth emails — branding them as Road Panther Perks

By default Supabase Auth sends confirmation / password-reset / email-change
messages from `noreply@mail.app.supabase.io` with generic Supabase wording and a
"powered by Supabase" footer. Two independent settings change that, both in the
project dashboard (Project: **hub** / `zmoqqnsnxqaxsfmxuaum`).

These are **platform settings, not env vars.** Nothing in `.env` affects them —
that file configures the *app's own* notification emails (`src/integrations/email.ts`),
which are a separate channel. Both need setting up.

---

## 1. Auth → SMTP Settings — changes who the email is FROM

Until this is set, Supabase also rate-limits auth emails to a handful per hour,
which is not viable in production.

| Field | Value |
| --- | --- |
| Enable Custom SMTP | on |
| Host | `smtp.zoho.eu` |
| Port | `465` |
| Username | `donot.reply@roadpantherperks.co.uk` |
| Password | the Zoho password (prefer an app-specific one) |
| Sender email | `donot.reply@roadpantherperks.co.uk` |
| Sender name | `Road Panther Perks` |

Sender email must match the authenticated mailbox (or a verified alias of it) —
Zoho rejects the send otherwise. Same constraint as `EMAIL_FROM` in `.env`.

Deliverability: add SPF/DKIM for the domain in Zoho and publish the records in
DNS, or these land in spam. Zoho's console generates both.

---

## 2. Auth → Email Templates — changes what the email SAYS

Paste each block below into the matching template. Markup matches
`emailLayout()` in `src/integrations/email.ts`, so auth mail and app mail look
identical.

Supabase substitutes these variables:
`{{ .ConfirmationURL }}` `{{ .Token }}` `{{ .TokenHash }}` `{{ .SiteURL }}`
`{{ .Email }}` `{{ .NewEmail }}` `{{ .RedirectTo }}`

> The links resolve against **Site URL** in Auth → URL Configuration. If that
> still points at `localhost:3000`, every button below is dead for real users.

---

### Confirm signup

Subject: `Confirm your email — Road Panther Perks`

```html
<div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
    </div>
    <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">Confirm your email</h1>
      <p style="margin:0 0 16px;">Thanks for signing up. Confirm this address and we'll start reviewing your driver verification — usually within 24 hours.</p>
      <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f5b301;color:#111;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Confirm my email &rarr;</a></p>
      <p style="margin:0;color:#888;font-size:13px;">If the button doesn't work, paste this into your browser:<br><span style="color:#aaa;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
      <p style="margin:16px 0 0;color:#888;font-size:13px;">Didn't sign up? You can safely ignore this email.</p>
    </div>
    <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
      Road Panther Perks &middot; North East &amp; Teesside
    </div>
  </div>
</div>
```

---

### Reset password

Subject: `Reset your password — Road Panther Perks`

```html
<div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
    </div>
    <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">Reset your password</h1>
      <p style="margin:0 0 16px;">We received a request to reset the password for <strong style="color:#fff;">{{ .Email }}</strong>. Choose a new one below.</p>
      <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f5b301;color:#111;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Choose a new password &rarr;</a></p>
      <p style="margin:0;color:#888;font-size:13px;">If the button doesn't work, paste this into your browser:<br><span style="color:#aaa;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
      <p style="margin:16px 0 0;color:#888;font-size:13px;">Didn't request this? Ignore this email — your password won't change.</p>
    </div>
    <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
      Road Panther Perks &middot; North East &amp; Teesside
    </div>
  </div>
</div>
```

---

### Change email address

Subject: `Confirm your new email — Road Panther Perks`

```html
<div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
    </div>
    <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">Confirm your new email</h1>
      <p style="margin:0 0 16px;">You asked to change the email on your account from <strong style="color:#fff;">{{ .Email }}</strong> to <strong style="color:#fff;">{{ .NewEmail }}</strong>. Confirm to make the switch.</p>
      <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f5b301;color:#111;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Confirm the change &rarr;</a></p>
      <p style="margin:0;color:#888;font-size:13px;">If the button doesn't work, paste this into your browser:<br><span style="color:#aaa;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
      <p style="margin:16px 0 0;color:#888;font-size:13px;">Didn't request this? Ignore this email — nothing will change.</p>
    </div>
    <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
      Road Panther Perks &middot; North East &amp; Teesside
    </div>
  </div>
</div>
```

---

### Magic Link

Subject: `Your sign-in link — Road Panther Perks`

```html
<div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
    </div>
    <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">Your sign-in link</h1>
      <p style="margin:0 0 24px;">Tap below to sign in. The link works once and expires shortly.</p>
      <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f5b301;color:#111;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Sign in &rarr;</a></p>
      <p style="margin:0;color:#888;font-size:13px;">If the button doesn't work, paste this into your browser:<br><span style="color:#aaa;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
    </div>
    <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
      Road Panther Perks &middot; North East &amp; Teesside
    </div>
  </div>
</div>
```

---

### Invite user

Subject: `You're invited — Road Panther Perks`

```html
<div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
    </div>
    <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">You've been invited</h1>
      <p style="margin:0 0 24px;">You've been invited to join Road Panther Perks. Accept below to set up your account.</p>
      <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f5b301;color:#111;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">Accept the invite &rarr;</a></p>
      <p style="margin:0;color:#888;font-size:13px;">If the button doesn't work, paste this into your browser:<br><span style="color:#aaa;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
    </div>
    <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
      Road Panther Perks &middot; North East &amp; Teesside
    </div>
  </div>
</div>
```

---

### Reauthentication

Subject: `Your verification code — Road Panther Perks`

```html
<div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
    </div>
    <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">Your verification code</h1>
      <p style="margin:0 0 16px;">Enter this code to confirm it's you:</p>
      <p style="margin:0 0 24px;font-size:30px;font-weight:800;letter-spacing:0.18em;color:#f5b301;">{{ .Token }}</p>
      <p style="margin:0;color:#888;font-size:13px;">Didn't request this? Ignore this email.</p>
    </div>
    <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
      Road Panther Perks &middot; North East &amp; Teesside
    </div>
  </div>
</div>
```

---

## 3. Auth → URL Configuration

Set **Site URL** to the live origin (`https://www.roadpantherperks.co.uk`), and add
redirect URLs for every origin that completes an auth flow:

```
https://www.roadpantherperks.co.uk/auth/callback
http://localhost:3000/auth/callback
```

Keep this consistent with `NEXT_PUBLIC_SITE_URL` — the app builds
`emailRedirectTo` from that env var (`auth-actions.ts`), while Supabase validates
the result against this allowlist. A mismatch produces a redirect error after the
user clicks a link that otherwise looks fine.
