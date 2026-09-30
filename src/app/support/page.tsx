import LegalPage from "@/components/legal/LegalPage";

export default function SupportPage() {
  return (
    <LegalPage
      title="Support"
      description="Get help with your Newvelion account, marketplace activity, orders, commissions, and platform access."
    >
      <h2>1. Seller and affiliate support</h2>
      <p>
        Sellers can contact Newvelion for assistance with accounts, affiliate
        links, product promotion, commissions, withdrawals, and dashboard
        issues.
      </p>

      <h2>2. Customer support</h2>
      <p>
        Customers can contact Newvelion regarding checkout, delivery,
        transactions, buyer protection, and refund-related questions.
      </p>

      <h2>3. Privacy requests</h2>
      <p>
        Requests concerning personal information, privacy, data access,
        correction, or deletion should be sent through our support contact.
      </p>

      <h2>4. Contact</h2>
      <p>
        Email: <a href="mailto:contact@newvelion.com">contact@newvelion.com</a>
      </p>
      <p>
        Phone: +27 72 295 8915
      </p>
      <p>
        Instagram: @newvelion
      </p>

      <h2>5. Security reports</h2>
      <p>
        If you discover a security vulnerability or unauthorized activity,
        contact Newvelion promptly and provide enough information for the
        issue to be investigated.
      </p>
    </LegalPage>
  );
}
