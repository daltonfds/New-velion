import LegalPage from "@/components/legal/LegalPage";

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      description="Rules for safe, lawful, and responsible use of the Newvelion platform."
    >
      <h2>1. Lawful use</h2>
      <p>
        Newvelion must only be used for lawful commercial and marketplace
        activities and in accordance with applicable laws and regulations.
      </p>

      <h2>2. Fraud and manipulation</h2>
      <p>Users must not:</p>
      <ul>
        <li>Create fake orders or transactions.</li>
        <li>Manipulate affiliate clicks, conversions, or commissions.</li>
        <li>Use stolen payment information.</li>
        <li>Impersonate another person or business.</li>
        <li>Attempt to bypass platform security or verification.</li>
      </ul>

      <h2>3. Prohibited content and products</h2>
      <p>
        Users must not use Newvelion to sell, promote, distribute, or facilitate
        unlawful products, services, content, or transactions.
      </p>

      <h2>4. Security</h2>
      <p>
        Users must not introduce malware, attempt unauthorized access, probe
        platform systems, interfere with services, or access data belonging to
        other users.
      </p>

      <h2>5. Advertising</h2>
      <p>
        Advertising must be truthful and must clearly represent the product
        being promoted. Deceptive claims, fake scarcity, fraudulent discounts,
        and misleading earnings claims are prohibited.
      </p>

      <h2>6. Spam</h2>
      <p>
        Users must not use Newvelion links or platform resources for unsolicited
        bulk messaging, abusive communications, or other forms of spam.
      </p>

      <h2>7. Enforcement</h2>
      <p>
        Newvelion may investigate suspected violations and may restrict,
        suspend, or terminate accounts when necessary to protect users and the
        platform.
      </p>

      <h2>8. Reporting</h2>
      <p>
        Suspected abuse or security issues should be reported through the
        Support page.
      </p>
    </LegalPage>
  );
}
