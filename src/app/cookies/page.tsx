import LegalPage from "@/components/legal/LegalPage";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="How Newvelion uses cookies and similar technologies across its website and platform."
    >
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small files stored on your device that allow a website to
        remember information and maintain functionality.
      </p>

      <h2>2. Essential cookies</h2>
      <p>
        Essential cookies may be required for login sessions, security,
        authentication, account functionality and other core platform features.
      </p>

      <h2>3. Affiliate attribution</h2>
      <p>
        Newvelion may use cookies or similar technologies to identify the
        affiliate link through which a customer arrived. This allows an
        eligible transaction to be attributed to the appropriate seller.
      </p>

      <h2>4. Analytics</h2>
      <p>
        We may use analytics technologies to understand traffic, performance
        and platform usage. Where required, non-essential analytics will be
        subject to the appropriate consent requirements.
      </p>

      <h2>5. Managing cookies</h2>
      <p>
        Most browsers allow you to block or delete cookies. Blocking essential
        cookies may prevent parts of Newvelion from functioning correctly.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about cookies can be sent to{" "}
        <a href="mailto:contact@newvelion.com">contact@newvelion.com</a>.
      </p>
    </LegalPage>
  );
}
