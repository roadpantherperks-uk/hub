import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Road Panther Perks collects, uses and protects your personal information.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="7 May 2026">
      <p>
        Road Panther Perks (&quot;<strong>Road Panther Perks</strong>&quot;, &quot;
        <strong>we</strong>&quot;, &quot;<strong>us</strong>&quot;, &quot;
        <strong>our</strong>&quot;) operates the website{" "}
        <a href="https://roadpantherperks.co.uk">roadpantherperks.co.uk</a> and the
        related driver discount platform (the &quot;<strong>Service</strong>&quot;).
        This policy explains what personal information we collect about you, how we
        use it, who we share it with, and the rights you have under UK data
        protection law (UK GDPR and the Data Protection Act 2018).
      </p>
      <p>
        If anything is unclear or you want to exercise your rights, email us at{" "}
        <a href="mailto:hello@roadpantherperks.co.uk">
          hello@roadpantherperks.co.uk
        </a>
        .
      </p>

      <h2>1. Who is the data controller</h2>
      <p>
        Road Panther Perks is the data controller for the personal information
        described in this policy. We are based in the North East of England, United
        Kingdom.
      </p>

      <h2>2. Information we collect</h2>
      <p>When you join the waitlist or use the platform, we may collect:</p>
      <ul>
        <li>
          <strong>Identity &amp; contact data</strong> — full name, email address and
          phone number.
        </li>
        <li>
          <strong>Driver profile data</strong> — driver type (taxi, Uber, Bolt,
          delivery, instructor, tradesperson, courier, other) and the location you
          drive in (e.g. Newcastle, Gateshead, Sunderland).
        </li>
        <li>
          <strong>Verification documents</strong> — the photo, screenshot or PDF you
          upload to prove you are a working driver (for example, a taxi badge,
          Uber/Bolt account screenshot, instructor badge or delivery account
          screenshot).
        </li>
        <li>
          <strong>Account data</strong> — if you are an admin user, your sign-in
          credentials and authentication tokens.
        </li>
        <li>
          <strong>Technical data</strong> — IP address, browser type and device
          information collected automatically by our hosting providers for security
          and abuse prevention.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use your personal information to:</p>
      <ul>
        <li>verify your eligibility as a driver before granting membership;</li>
        <li>
          contact you about your application status and the upcoming launch of the
          Service;
        </li>
        <li>
          let participating local businesses confirm that you are an active member
          (we share <em>only</em> your member status, never your documents);
        </li>
        <li>provide, secure and improve the Service;</li>
        <li>
          comply with legal and regulatory obligations and respond to lawful
          requests.
        </li>
      </ul>

      <h2>4. Legal bases</h2>
      <p>We rely on the following legal bases under UK GDPR:</p>
      <ul>
        <li>
          <strong>Consent</strong> — when you submit your details to join the
          waitlist and upload your verification document.
        </li>
        <li>
          <strong>Contract</strong> — to provide the membership and discounts you
          have signed up for.
        </li>
        <li>
          <strong>Legitimate interests</strong> — to operate, secure and improve the
          Service and prevent fraud.
        </li>
        <li>
          <strong>Legal obligation</strong> — where required by law.
        </li>
      </ul>

      <h2>5. Who we share information with</h2>
      <p>
        We do not sell your personal information. We share limited information only
        with:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — our database, authentication and storage
          provider, which hosts your data on our behalf.
        </li>
        <li>
          <strong>Hosting and infrastructure providers</strong> — to deliver the
          website and email.
        </li>
        <li>
          <strong>Participating businesses</strong> — only your active membership
          status (yes/no) when you redeem a discount, never your documents.
        </li>
        <li>
          <strong>Authorities or advisers</strong> — where required by law or to
          enforce our rights.
        </li>
      </ul>

      <h2>6. Verification documents</h2>
      <p>
        Verification documents are uploaded to a private, access-controlled storage
        bucket. They are reviewed by our team for the sole purpose of verifying you
        are a working driver. We never publish them, never share them with third
        parties, and never use them for marketing.
      </p>

      <h2>7. International transfers</h2>
      <p>
        Some of our service providers may process data outside the UK. Where they
        do, we rely on adequate-country status or standard contractual clauses, and
        we apply appropriate safeguards.
      </p>

      <h2>8. How long we keep information</h2>
      <ul>
        <li>
          If your application is <strong>approved</strong>, we keep your account
          data for as long as you remain a member, plus a reasonable period after
          you cancel.
        </li>
        <li>
          If your application is <strong>rejected</strong>, we keep your record only
          as long as necessary to handle appeals and prevent duplicate submissions,
          and then delete or anonymise it.
        </li>
        <li>
          Verification documents are deleted within a reasonable period after a
          decision is made on your application.
        </li>
      </ul>

      <h2>9. Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li>access the personal information we hold about you;</li>
        <li>correct inaccurate or incomplete information;</li>
        <li>ask us to delete your information (subject to legal exceptions);</li>
        <li>restrict or object to certain processing;</li>
        <li>withdraw consent at any time where we rely on it;</li>
        <li>request a copy of your data in a portable format;</li>
        <li>
          complain to the Information Commissioner&apos;s Office (
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            ico.org.uk
          </a>
          ).
        </li>
      </ul>
      <p>
        To exercise any of these, email{" "}
        <a href="mailto:hello@roadpantherperks.co.uk">
          hello@roadpantherperks.co.uk
        </a>
        . We will respond within one month.
      </p>

      <h2>10. Cookies</h2>
      <p>
        We use a small number of strictly necessary cookies to keep you signed in
        and to keep the Service secure. We do not use advertising or third-party
        tracking cookies.
      </p>

      <h2>11. Children</h2>
      <p>
        The Service is intended for adults (18+) who drive for a living. We do not
        knowingly collect personal information from anyone under 18. If you believe
        a child has submitted information, contact us and we will delete it.
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The effective date at the top
        of this page reflects the latest version. Material changes will be
        communicated by email where appropriate.
      </p>

      <h2>13. Contact</h2>
      <p>
        Email{" "}
        <a href="mailto:hello@roadpantherperks.co.uk">
          hello@roadpantherperks.co.uk
        </a>{" "}
        for any privacy questions, including data subject requests.
      </p>
    </LegalPage>
  );
}
