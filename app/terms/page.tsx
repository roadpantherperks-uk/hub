import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing your use of Road Panther Perks and the discounts offered through the platform.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" effectiveDate="7 May 2026">
      <p>
        These Terms &amp; Conditions (the &quot;<strong>Terms</strong>&quot;) govern
        your access to and use of the Road Panther Perks website, waitlist and
        membership platform (the &quot;<strong>Service</strong>&quot;). By joining
        the waitlist or using the Service you agree to these Terms. If you do not
        agree, please do not use the Service.
      </p>

      <h2>1. About us</h2>
      <p>
        Road Panther Perks (&quot;<strong>we</strong>&quot;, &quot;
        <strong>us</strong>&quot;, &quot;<strong>our</strong>&quot;) is an
        independent driver support and discount platform serving the North East and
        Teesside in the United Kingdom. You can contact us at{" "}
        <a href="mailto:hello@roadpantherperks.co.uk">
          hello@roadpantherperks.co.uk
        </a>
        .
      </p>

      <h2>2. Eligibility</h2>
      <p>To join the waitlist or become a member you must:</p>
      <ul>
        <li>be 18 years of age or older;</li>
        <li>
          drive for a living in the North East or Teesside (taxi, private hire,
          delivery, courier, instructor, tradesperson with a registered work
          vehicle, or similar);
        </li>
        <li>
          provide accurate, current and complete information when signing up;
        </li>
        <li>
          submit a genuine verification document (taxi badge, platform account
          screenshot, instructor badge, etc.) when requested.
        </li>
      </ul>

      <h2>3. Verification</h2>
      <p>
        Membership is subject to manual verification. We may approve, reject or
        request further information from any applicant at our discretion. Submitting
        false, misleading or fraudulent verification documents will result in
        rejection and may be reported to relevant authorities.
      </p>

      <h2>4. Membership and discounts</h2>
      <ul>
        <li>
          Membership is <strong>free</strong> for verified drivers. We do not
          charge subscription fees.
        </li>
        <li>
          Discounts are provided by independent participating businesses. The
          terms of each discount (eligibility, redemption method, expiry) are set
          by the participating business.
        </li>
        <li>
          We do not guarantee that any specific discount, business or category will
          be available at launch or remain available indefinitely. Discounts and
          partners may change without notice.
        </li>
        <li>
          To redeem a discount you may be asked to show proof of active membership.
          Discounts are personal to you and may not be transferred or sold.
        </li>
      </ul>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          share your member status or membership credentials with anyone who is not
          a verified member;
        </li>
        <li>
          attempt to redeem discounts on behalf of someone who is not a verified
          member;
        </li>
        <li>upload documents that are not yours or that are forged or altered;</li>
        <li>
          use the Service for any unlawful, fraudulent, harassing or harmful
          purpose;
        </li>
        <li>
          interfere with the Service, attempt to access it without authorisation,
          or scrape it for commercial purposes.
        </li>
      </ul>

      <h2>6. Suspension and termination</h2>
      <p>
        We may suspend or terminate your membership at any time, with or without
        notice, if we reasonably believe you have breached these Terms or
        compromised the integrity of the Service. You can cancel your membership at
        any time by emailing{" "}
        <a href="mailto:hello@roadpantherperks.co.uk">
          hello@roadpantherperks.co.uk
        </a>
        .
      </p>

      <h2>7. Relationship with participating businesses</h2>
      <p>
        Road Panther Perks is independent and is not partnered with Uber, Bolt, any
        local council, or any specific employer. We do not provide the goods or
        services discounted through the Service. Any contract for goods or services
        is between you and the participating business, and any complaint about
        those goods or services should be raised with that business directly. We
        will, where reasonable, help connect you with the right point of contact.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Road Panther Perks name, logo, website design and all related content
        are owned by us or our licensors. You may not use, reproduce or distribute
        any of it without our prior written permission, except as needed to use the
        Service personally as a member.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;. To
        the fullest extent permitted by law we do not warrant that the Service will
        be uninterrupted, error-free, or that any specific discount will be
        available at any given time.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        Nothing in these Terms limits any liability that cannot lawfully be limited
        — including liability for death or personal injury caused by negligence or
        for fraud or fraudulent misrepresentation.
      </p>
      <p>
        Subject to that, our total liability to you in connection with the Service
        is limited to £100. We are not liable for indirect or consequential losses,
        loss of profits, loss of business, loss of opportunity or loss of
        anticipated savings.
      </p>

      <h2>11. Changes to the Service or Terms</h2>
      <p>
        We may update the Service and these Terms from time to time. The effective
        date at the top of this page reflects the latest version. Continued use of
        the Service after changes are posted means you accept the updated Terms.
      </p>

      <h2>12. Privacy</h2>
      <p>
        Our use of your personal information is described in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of England and Wales. Any disputes
        will be subject to the exclusive jurisdiction of the courts of England and
        Wales, save where you are a consumer with mandatory rights to bring claims
        in your local jurisdiction.
      </p>

      <h2>14. Contact</h2>
      <p>
        For any questions about these Terms, email{" "}
        <a href="mailto:hello@roadpantherperks.co.uk">
          hello@roadpantherperks.co.uk
        </a>
        .
      </p>
    </LegalPage>
  );
}
