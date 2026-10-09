import LegalPage from "@/components/legal/LegalPage";

export default function SecurityReportingPage() {
  return (
    <LegalPage title="Security" description="How to report security issues affecting Newvelion.">
      <h2>Responsible disclosure</h2>
      <p>
        If you believe you have found a security issue in Newvelion, please
        report it privately before publishing details. Include the affected URL,
        a concise description, reproduction steps and any relevant request IDs.
      </p>
      <h2>Security contact</h2>
      <p>
        Email: <a href="mailto:contact@newvelion.com">contact@newvelion.com</a>
      </p>
      <h2>Scope</h2>
      <p>
        Reports concerning authentication, authorization, customer data,
        payment flows, integrations, account access, attribution and other
        security-sensitive platform behaviour are welcome.
      </p>
      <h2>Good-faith testing</h2>
      <p>
        Do not access, modify, delete or retain data belonging to other users.
        Avoid denial-of-service testing, social engineering and actions that
        could disrupt production services.
      </p>
    </LegalPage>
  );
}
