import type { Metadata } from "next";
import { PageHead, Section, Grid } from "../_components/ui";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <>
      <PageHead title="Built so the numbers can be trusted" lead="Money, stock and permissions are decided on the server, not in the browser." />
      <Section tint>
        <Grid items={[
          { title: "Role permissions", text: "Suppliers, sellers and administrators each see only what their role allows." },
          { title: "Separated records", text: "Row-level rules keep one account's data away from another's." },
          { title: "Verified payments", text: "An order is paid only after the payment is confirmed." },
          { title: "No duplicate commissions", text: "Orders and commissions are written once, even if a request is repeated." },
          { title: "Audit records", text: "Financial changes leave a record that administrators can review." },
          { title: "Protected credentials", text: "API keys and webhook secrets stay on the server and are checked on every request." },
        ]} />
      </Section>
    </>
  );
}
