import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer & Risk Disclosure — FolioVault",
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Disclaimer &amp; Risk Disclosure</h1>
      <p className="text-muted-foreground">Last updated: February 27, 2026</p>

      <p>
        Please read this disclaimer carefully before using FolioVault. By
        accessing or using the service, you acknowledge that you have read,
        understood, and agree to the following.
      </p>

      <h2>1. No Investment Advice</h2>
      <p>
        FolioVault does not provide financial, investment, or trading advice. All
        data, analytics, charts, and information displayed through the service
        are for informational and educational purposes only. Nothing on
        FolioVault should be construed as a recommendation to buy, sell, or hold
        any cryptocurrency or financial instrument. You should consult a
        qualified financial professional before making any investment decisions.
      </p>

      <h2>2. API Key Security</h2>
      <p>
        You are solely responsible for the security and management of any
        third-party API keys you provide to FolioVault. API keys are stored in
        our database to enable the services you request (such as viewing
        balances and placing orders). While we take reasonable measures to
        protect stored data, no system is completely immune to security breaches.
        There is an inherent risk that stored API keys could be exposed in the
        event of a data breach or unauthorized access.
      </p>
      <p>
        We strongly recommend that you use API keys with the minimum required
        permissions (e.g. read-only where possible), enable IP whitelisting on
        your exchange account, and regularly rotate your keys.
      </p>

      <h2>3. Trading Risks &amp; Financial Losses</h2>
      <p>
        FolioVault is not responsible for any financial losses, damages, or
        missed opportunities resulting from trades executed through the service.
        All trading orders are submitted directly to third-party exchanges via
        your own API keys. You bear full responsibility for every trading
        decision and its financial outcome.
      </p>
      <p>
        Cryptocurrency and digital asset investments carry a high degree of
        risk. Prices are extremely volatile and can move significantly in a
        short period of time. You may lose some or all of your invested capital.
        Past performance is not indicative of future results.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        FolioVault relies on third-party services, including but not limited to
        Binance and other cryptocurrency exchanges, for market data and order
        execution. We have no control over the availability, accuracy, or
        reliability of these external services. We are not responsible for any
        actions taken by third-party exchanges, including account freezes, order
        rejections, API changes, or service discontinuations.
      </p>

      <h2>5. Technical Risks</h2>
      <p>
        FolioVault is provided &quot;as is&quot; without warranties of any kind.
        We do not guarantee that the service will be uninterrupted, timely,
        error-free, or secure. Technical issues including but not limited to
        software bugs, server downtime, network latency, and data transmission
        delays may occur at any time. FolioVault accepts no liability for any
        losses or damages arising from such technical issues.
      </p>

      <h2>6. Regulatory Compliance</h2>
      <p>
        You are solely responsible for ensuring that your use of FolioVault and
        any trading activity complies with the laws and regulations of your
        jurisdiction. Cryptocurrency regulations vary by country and region, and
        it is your responsibility to understand and comply with all applicable
        rules, including tax obligations.
      </p>

      <h2>7. Not a Licensed Financial Institution</h2>
      <p>
        FolioVault is not a bank, broker, exchange, custodian, or licensed
        financial institution. We do not hold, manage, or have custody of your
        funds. FolioVault is a portfolio tracking and trading interface tool that
        connects to exchanges on your behalf using the API keys you provide.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, FolioVault and its creators,
        developers, and affiliates shall not be liable for any direct, indirect,
        incidental, special, consequential, or punitive damages arising from
        your use of or inability to use the service, including but not limited
        to financial losses, data loss, or loss of profits.
      </p>

      <h2>9. Changes to This Disclaimer</h2>
      <p>
        We may update this disclaimer from time to time. When we do, we will
        revise the &quot;Last updated&quot; date above. Continued use of the
        service after changes constitutes acceptance of the updated disclaimer.
      </p>

      <hr />
      <p className="text-sm text-muted-foreground">
        See also our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </article>
  );
}
