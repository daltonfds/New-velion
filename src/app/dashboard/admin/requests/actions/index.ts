"use server";

import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveRequest(requestId: string, tempPassword: string) {
  const supabase = createServerClient();
  
  // 1. Buscar os dados do pedido
  const { data: request, error: fetchError } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) throw new Error("Request not found");

  // 2. Criar o utilizador no Supabase Auth com senha temporária
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: request.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: request.full_name,
      role: request.requested_role,
      country: request.country,
      phone: request.phone,
    },
  });

  if (createError) throw new Error(createError.message);

  // 3. Atualizar o status do pedido para 'approved'
  const { error: updateError } = await supabase
    .from("registration_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (updateError) throw new Error(updateError.message);

  // 4. Recarregar a página do Admin para mostrar o pedido como aprovado
  revalidatePath("/dashboard/admin/requests");
  return { success: true, userId: user.user.id };
}

export async function rejectRequest(requestId: string) {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from("registration_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/requests");
  return { success: true };
}
