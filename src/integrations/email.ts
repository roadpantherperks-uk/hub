import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Transactional email over SMTP (Zoho Mail).
 *
 * Configure (.env / Vercel):
 *   SMTP_HOST          — smtp.zoho.eu  (or smtp.zoho.com — match where the account was created)
 *   SMTP_PORT          — 465 (SSL) or 587 (TLS)
 *   SMTP_USER          — a real mailbox, e.g. hello@roadpantherperks.co.uk
 *   SMTP_PASS          — a Zoho *app-specific* password (SMTP access enabled on the mailbox)
 *   EMAIL_FROM         — sender, e.g. "Road Panther Perks <hello@roadpantherperks.co.uk>"
 *                        (should be on the same domain/mailbox as SMTP_USER for deliverability)
 *   ADMIN_NOTIFY_EMAIL — where "new signup" alerts go (an inbox you actually check)
 *
 * If SMTP_USER/SMTP_PASS are unset, sends are skipped with a warning rather than
 * throwing — so the app keeps working before email is wired up. Every caller
 * treats email as best-effort and never blocks the main flow on it.
 */

const FROM =
  process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "hello@roadpantherperks.co.uk";

export const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL ?? process.env.SMTP_USER ?? "";

let _transport: Transporter | null = null;

function transport(): Transporter | null {
  const host = process.env.SMTP_HOST ?? "smtp.zoho.eu";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  if (!_transport) {
    const port = Number(process.env.SMTP_PORT ?? "465");
    _transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit SSL; 587 = STARTTLS
      auth: { user, pass },
    });
  }
  return _transport;
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const t = transport();
  if (!t) {
    console.warn(`[email] SMTP not configured — skipped: "${subject}" to ${to}`);
    return false;
  }
  if (!to || (Array.isArray(to) && to.length === 0)) return false;

  try {
    await t.sendMail({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/**
 * Escape a user-supplied value for interpolation into email HTML.
 *
 * Every template below builds HTML by string concatenation, so any value that
 * originates from a signup form (names, business names, free-text location)
 * must go through this first. Without it a name containing & or < silently
 * corrupts the markup, and a deliberately crafted one injects into the admin's
 * inbox.
 *
 * Also collapses null/undefined to "" rather than the string "undefined",
 * which is what a partial payload used to render as.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Join name parts into a display name, dropping blank/missing pieces.
 * Returns the fallback when nothing usable is left, so an incomplete payload
 * never renders as "undefined undefined".
 */
export function displayName(parts: unknown[], fallback = "(name not provided)"): string {
  const joined = parts
    .map((p) => (p === null || p === undefined ? "" : String(p).trim()))
    .filter(Boolean)
    .join(" ");
  return joined || fallback;
}

/** Minimal branded wrapper so all emails look consistent. */
export function emailLayout(heading: string, bodyHtml: string): string {
  return `
  <div style="background:#0a0a0a;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
      <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <span style="font-weight:800;letter-spacing:-0.02em;color:#fff;font-size:18px;">Road Panther <span style="color:#f5b301;">Perks</span></span>
      </div>
      <div style="padding:28px;color:#e5e5e5;font-size:15px;line-height:1.6;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">${heading}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#888;font-size:12px;">
        Road Panther Perks · North East &amp; Teesside
      </div>
    </div>
  </div>`;
}
