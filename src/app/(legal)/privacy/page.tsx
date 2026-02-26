import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — FolioVault",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: February 23, 2026</p>

      <p>
        Your privacy matters to us. This Privacy Policy explains how FolioVault
        collects, uses, stores, and protects your information when you use our
        service.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <p>
        When you create an account, we collect your name, email address, and
        password (stored in hashed form). If you sign in with a third-party
        provider (e.g. Google), we receive your name, email, and profile image
        from that provider.
      </p>
      <h3>Portfolio Data</h3>
      <p>
        You may submit portfolio information including asset names, quantities,
        transaction records, and related financial data. This data is provided
        voluntarily and is used solely to deliver the service.
      </p>
      <h3>API Keys</h3>
      <p>
        If you connect a third-party exchange account, we store your API keys in
        our database. These keys are used solely to execute your requested
        operations (viewing balances, placing orders). We recommend using API
        keys with restricted permissions and IP whitelisting for added security.
      </p>
      <h3>Usage Data</h3>
      <p>
        We may collect basic usage information such as pages visited, features
        used, and timestamps to improve the service.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve the FolioVault service.</li>
        <li>To authenticate your identity and secure your account.</li>
        <li>To send verification codes and essential service communications.</li>
        <li>To respond to your requests or inquiries.</li>
      </ul>

      <h2>3. Data Storage &amp; Security</h2>
      <p>
        Your data is stored locally using SQLite. We implement reasonable
        security measures to protect your information, including password
        hashing and secure session management. However, no method of
        transmission or storage is 100% secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        FolioVault may integrate with third-party services for authentication
        (e.g. Google OAuth) and market data. These services have their own
        privacy policies, and we encourage you to review them. We do not sell or
        share your personal data with third parties for advertising purposes.
      </p>

      <h2>5. Cookies</h2>
      <p>
        We use essential cookies and session tokens to keep you signed in and to
        provide core functionality. We do not use tracking or advertising
        cookies.
      </p>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Export your portfolio data.</li>
      </ul>

      <h2>7. Data Deletion</h2>
      <p>
        You can delete your account at any time through your account settings.
        When you delete your account, all associated personal data and portfolio
        records will be permanently removed from our system.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        FolioVault is not intended for children under the age of 16. We do not
        knowingly collect personal information from children.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the &quot;Last updated&quot; date above. Continued use of the
        service after changes constitutes acceptance of the updated policy.
      </p>

      <h2>10. Contact</h2>
      <p>
        If you have any questions about this Privacy Policy or wish to exercise
        your data rights, please contact us through the application.
      </p>

      <hr />
      <p className="text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
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
