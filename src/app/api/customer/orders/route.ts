import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function auth(request:Request){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header=request.headers.get("authorization");
  if(!url||!key||!header?.startsWith("Bearer ")) return null;
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user}}=await admin.auth.getUser(header.slice(7));
  if(!user) return null;
  return {admin,user};
}
export async function GET(request:Request){
  const result=await auth(request); if(!result) return NextResponse.json({error:"Unauthorized."},{status:401});
  const {admin,user}=result;
  const {data:profile}=await admin.from("profiles").select("full_name,role,country_code").eq("id",user.id).maybeSingle();
  if(profile?.role!=="customer") return NextResponse.json({error:"Customer account required."},{status:403});
  const {data:sales,error}=await admin.from("sales").select("id,product_id,quantity,product_amount,shipping_amount,valor_venda,currency,status,vendido_em,gateway_ref,fulfillment_orders(id,status,tracking_number,carrier,tracking_url,public_tracking_token,updated_at)").eq("customer_id",user.id).order("vendido_em",{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  const ids=(sales||[]).map((s:any)=>s.product_id).filter(Boolean);
  const {data:products}=ids.length?await admin.from("products").select("id,nome,slug,fotos").in("id",ids):{data:[]};
  const map=new Map((products||[]).map((p:any)=>[p.id,p]));
  return NextResponse.json({orders:(sales||[]).map((s:any)=>({...s,product:map.get(s.product_id)||null}))});
}
