import { requireSupplier } from "@/lib/supplier-auth";

export async function POST(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const amount = Number(body.amount);
  const method = String(body.method ?? "");
  const provider = body.provider ? String(body.provider) : undefined;
  if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: "Invalid withdrawal amount." }, { status: 400 });
  if (!["bank_transfer","mobile_wallet"].includes(method)) return Response.json({ error: "Unsupported payout method." }, { status: 400 });

  const { data, error } = await auth.userClient.rpc("server_request_withdrawal", {
    p_user_id: auth.userId,
    p_amount: amount,
    p_method: method,
    p_data: provider ? { provider } : {},
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}
