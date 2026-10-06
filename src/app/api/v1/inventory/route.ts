import { apiError, apiOk, authenticateIntegrationRequest, logIntegrationRequest } from "@/lib/integrations/server";

export async function GET(request: Request) {
  const started = Date.now();
  const auth = await authenticateIntegrationRequest(request);
  const url = new URL(request.url);
  if (!auth.ok) {
    await logIntegrationRequest({ requestId: auth.id, method: "GET", path: url.pathname, statusCode: auth.error.status, durationMs: Date.now()-started });
    return auth.error;
  }

  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "50")));
  const productId = url.searchParams.get("product_id")?.trim() || "";
  const search = url.searchParams.get("search")?.trim() || "";

  let q = auth.client.from("products")
    .select("id,nome,slug,estoque,reserved_estoque,ativo,supplier_status,updated_at",{count:"exact"})
    .eq("ativo",true).eq("supplier_status","approved")
    .order("updated_at",{ascending:false});

  if (productId) q=q.eq("id",productId);
  if (search) q=q.or(`nome.ilike.%${search}%,slug.ilike.%${search}%`);

  const from=(page-1)*limit;
  const {data,error,count}=await q.range(from,from+limit-1);
  if(error){
    await logIntegrationRequest({platformId:auth.platform.id,requestId:auth.id,method:"GET",path:url.pathname,statusCode:500,durationMs:Date.now()-started});
    return apiError("INTERNAL_ERROR","Could not load inventory.",500,auth.id);
  }

  const inventory=(data??[]).map(p=>({
    product_id:p.id,
    name:p.nome,
    slug:p.slug,
    stock:Number(p.estoque??0),
    reserved_stock:Number(p.reserved_estoque??0),
    available_stock:Math.max(0,Number(p.estoque??0)-Number(p.reserved_estoque??0)),
    active:Boolean(p.ativo),
    supplier_status:p.supplier_status,
    updated_at:p.updated_at,
  }));

  await logIntegrationRequest({platformId:auth.platform.id,requestId:auth.id,method:"GET",path:url.pathname,statusCode:200,durationMs:Date.now()-started});
  return apiOk({data:inventory,pagination:{page,limit,total:count??0,pages:Math.ceil((count??0)/limit)}},200,auth.id);
}
