"use server";

import { createServerClient } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { sendApprovalEmail } from "@/lib/email/sendApproval";

export async function approveRequest(requestId: string, tempPassword: string) {
  const supabase = createServerClient();
  
  // 1. Buscar os dados do pedido
  const { data: request, error: fetchError } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) throw new Error("Request not found");

  // 2. Criar o utilizador no Supabase Auth
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

  // 3. Criar o perfil correspondente ao utilizador
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: user.user.id,
      full_name: request.full_name,
      email: request.email,
      phone: request.phone,
      country: request.country,
      city: request.city,
      role: request.requested_role,
      balance: 0,
    });

  if (profileError) {
    // Se o profile falhar, remover o utilizador criado no Auth
    await supabaseAdmin.auth.admin.deleteUser(user.user.id);
    throw new Error(profileError.message);
  }

  // 4. Atualizar o status do pedido
  const { error: updateError } = await supabase
    .from("registration_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (updateError) throw new Error(updateError.message);

  // 4. Enviar e-mail de boas-vindas com a senha temporária
  try {
    await sendApprovalEmail(
      request.email,
      request.full_name,
      tempPassword
    );
  } catch (emailError) {
    console.error("Failed to send approval email:", emailError);
    // Não paramos o fluxo, mas alertamos o admin
  }

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
