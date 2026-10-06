import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) return NextResponse.json({error:"Checkout service is not configured."},{status:500});
  const auth=request.headers.get("authorization");
  if(!auth?.startsWith("Bearer ")) return NextResponse.json({error:"Please sign in to checkout."},{status:401});
  const body=await request.json();
  const productId=String(body?.product_id||"");
  const quantity=Math.max(1,Math.min(50,Number(body?.quantity||1)));
  const fullName=String(body?.full_name||"").trim();
  const phone=String(body?.phone||"").trim();
  const province=String(body?.province||"").trim();
  const city=String(body?.city||"").trim();
  const postalCode=String(body?.postal_code||"").trim()||null;
  const address=String(body?.address||"").trim();
  const addressReference=String(body?.address_reference||"").trim()||null;
  if(!productId||!fullName||!phone||!province||!city||!address) return NextResponse.json({error:"Please complete all required fields."},{status:400});
  const supabase=createClient(url,key,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await supabase.rpc("create_customer_checkout_session",{p_product_id:productId,p_full_name:fullName,p_phone:phone,p_province:province,p_city:city,p_postal_code:postalCode,p_address:address,p_address_reference:addressReference,p_quantity:quantity});
  if(error) {
    const msg=error.message||"";
    if(/AUTHENTICATION_REQUIRED|CUSTOMER_ACCOUNT_REQUIRED/i.test(msg)) return NextResponse.json({error:"Customer account required."},{status:403});
    if(/OUT_OF_STOCK/i.test(msg)) return NextResponse.json({error:"Not enough stock for this quantity."},{status:409});
    if(/PRODUCT_UNAVAILABLE/i.test(msg)) return NextResponse.json({error:"Product unavailable."},{status:409});
    return NextResponse.json({error:"Could not create checkout session."},{status:500});
  }
  const session=Array.isArray(data)?data[0]:data;
  if(!session?.session_id||!session?.checkout_url) return NextResponse.json({error:"Invalid checkout response."},{status:500});
  const checkoutUrl=new URL(session.checkout_url); checkoutUrl.searchParams.set("newvelion_session",session.session_id);
  return NextResponse.json({session_id:session.session_id,checkout_url:checkoutUrl.toString()});
}
