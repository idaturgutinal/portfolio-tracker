import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — FolioVault",
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: February 23, 2026</p>

      <p>
        Welcome to FolioVault. By accessing or using our service, you agree to
        be bound by these Terms of Service (&quot;Terms&quot;). If you do not
        agree, please do not use FolioVault.
      </p>

      <h2>1. Account Responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials. You agree to provide accurate, current, and complete
        information during registration and to update it as necessary. You are
        responsible for all activity that occurs under your account.
      </p>

      <h2>2. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the service for any unlawful purpose or in violation of any applicable laws.</li>
        <li>Attempt to gain unauthorized access to other accounts, systems, or networks.</li>
        <li>Interfere with or disrupt the integrity or performance of the service.</li>
        <li>Upload or transmit malicious code, viruses, or harmful data.</li>
        <li>Use the service to transmit spam, unsolicited communications, or misleading content.</li>
      </ul>

      <h2>3. Intellectual Property</h2>
      <p>
        All content, trademarks, logos, and intellectual property displayed on
        FolioVault are owned by or licensed to us. You may not reproduce,
        distribute, or create derivative works from any part of the service
        without prior written consent.
      </p>

      <h2>4. User Content</h2>
      <p>
        You retain ownership of any data you submit to FolioVault (such as
        portfolio data and transaction records). By using the service, you grant
        us a limited license to store and process your data solely to provide
        the service to you.
      </p>

      <h2>5. Disclaimers</h2>
      <p>
        FolioVault is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, whether express or implied. We do not
        guarantee that the service will be uninterrupted, error-free, or secure.
      </p>
      <p>
        <strong>FolioVault is not a financial advisor.</strong> All data,
        analytics, and information provided through the service are for
        informational purposes only and do not constitute financial, investment,
        or trading advice. You should consult a qualified financial professional
        before making any investment decisions.
      </p>
      <h3>API Key Security</h3>
      <p>
        You are solely responsible for the security of any third-party API keys
        you provide. FolioVault stores API keys in encrypted form but cannot
        guarantee absolute security. You should use API keys with the minimum
        required permissions and enable IP restrictions.
      </p>
      <h3>Trading Risk</h3>
      <p>
        Trading features are provided for convenience only. FolioVault does not
        execute trades on your behalf — all orders are submitted directly to
        third-party exchanges via your own API keys. You bear full
        responsibility for any trading decisions and resulting financial
        outcomes.
      </p>
      <h3>No Liability for Exchange Actions</h3>
      <p>
        FolioVault is not responsible for any actions taken by third-party
        exchanges, including but not limited to account freezes, order
        rejections, or changes to their API services.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, FolioVault and its creators
        shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, including but not limited to loss of
        profits, data, or investment value, arising from your use of or
        inability to use the service.
      </p>

      <h2>7. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account at any time,
        with or without notice, for conduct that we determine violates these
        Terms or is harmful to the service, other users, or third parties. You
        may delete your account at any time through your account settings.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. When we do, we will revise
        the &quot;Last updated&quot; date above. Continued use of the service
        after changes constitutes acceptance of the updated Terms.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with
        applicable laws, without regard to conflict of law principles.
      </p>

      <h2>10. Contact</h2>
      <p>
        If you have any questions about these Terms, please contact us through
        the application.
      </p>

      <hr />
      <p className="text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>
        {" "}and{" "}
        <Link href="/disclaimer" className="underline underline-offset-4 hover:text-foreground">
          Disclaimer &amp; Risk Disclosure
        </Link>
        .
      </p>
    </article>
  );
}
