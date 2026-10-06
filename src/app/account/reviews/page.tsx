"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import CustomerNav from "@/components/customer/CustomerNav";
import {supabase} from "@/lib/supabase";

export default function ReviewsPage(){
 const router=useRouter();
 const [sales,setSales]=useState<any[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [forms,setForms]=useState<Record<string,{rating:number,text:string,anonymous:boolean}>>({});
 async function load(){
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return router.replace("/login");
  const {data,error}=await supabase.from("sales").select("id,product_id,vendido_em,status").eq("customer_id",user.id).order("vendido_em",{ascending:false});
  if(error){setError(error.message);setLoading(false);return}
  const ids=(data||[]).map((x:any)=>x.product_id).filter(Boolean);
  const {data:products}=ids.length?await supabase.from("products").select("id,nome,slug,fotos").in("id",ids):{data:[]};
  const {data:reviews}=await supabase.from("product_reviews").select("product_id").eq("reviewer_id",user.id);
  const reviewed=new Set((reviews||[]).map((r:any)=>r.product_id));
  setSales((data||[]).filter((s:any)=>!reviewed.has(s.product_id)).map((s:any)=>({...s,product:(products||[]).find((p:any)=>p.id===s.product_id)})));
  setLoading(false);
 }
 useEffect(()=>{void load()},[]);
 async function submit(productId:string){
  const f=forms[productId]||{rating:5,text:"",anonymous:false};
  setError("");
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){router.replace("/login");return}
  const response=await fetch("/api/customer/reviews",{method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({product_id:productId,rating:f.rating,review_text:f.text,is_anonymous:f.anonymous})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){setError(body.error||"Could not submit review.");return}
  await load();
 }
 return <main className="min-h-screen bg-slate-50"><CustomerNav/><div className="mx-auto max-w-5xl px-5 py-10"><h1 className="text-3xl font-extrabold text-[#16294F]">My reviews</h1><p className="mt-2 text-slate-500">Review products you have received. New reviews are checked before publication.</p>{error&&<div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading?<p className="mt-8">Loading...</p>:sales.length===0?<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8"><p className="font-bold text-[#16294F]">Nothing to review right now.</p></div>:<div className="mt-8 space-y-5">{sales.map(s=>{const f=forms[s.product_id]||{rating:5,text:"",anonymous:false};return <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex gap-4">{s.product?.fotos?.[0]&&<img src={s.product.fotos[0]} alt="" className="h-20 w-20 rounded-xl object-cover"/>}<div><h2 className="font-extrabold text-[#16294F]">{s.product?.nome||"Product"}</h2><p className="text-xs text-slate-400">Purchased {new Date(s.vendido_em).toLocaleDateString()}</p></div></div><div className="mt-5 flex gap-1">{[1,2,3,4,5].map(n=><button key={n} type="button" onClick={()=>setForms({...forms,[s.product_id]:{...f,rating:n}})} className={n<=f.rating?"text-2xl text-[#C99A2E]":"text-2xl text-slate-300"}>★</button>)}</div><textarea value={f.text} onChange={e=>setForms({...forms,[s.product_id]:{...f,text:e.target.value}})} placeholder="Tell other customers about your experience..." className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500"/><label className="mt-3 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={f.anonymous} onChange={e=>setForms({...forms,[s.product_id]:{...f,anonymous:e.target.checked}})}/> Post anonymously</label><button onClick={()=>submit(s.product_id)} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Submit review</button></div>})}</div>}</div></main>
}
