"use client";
import { LoadingBlock } from "@/components/ui/Skeleton";
import SmartImage from "@/components/ui/SmartImage";
import {useEffect,useState} from "react"; import Link from "next/link"; import {useRouter} from "next/navigation"; import CustomerNav from "@/components/customer/CustomerNav"; import {supabase} from "@/lib/supabase";
export default function FavoritesPage(){
 const router=useRouter(); const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 async function load(){const {data:{user}}=await supabase.auth.getUser();if(!user)return router.replace("/login");const {data}=await supabase.from("customer_favorites").select("id,product_id,products(id,nome,slug,preco,preco_promocional,fotos,moeda,avaliacao_media,total_avaliacoes)").eq("user_id",user.id).order("created_at",{ascending:false});setItems(data||[]);setLoading(false)}
 useEffect(()=>{void load()},[]);
 async function remove(id:string){await supabase.from("customer_favorites").delete().eq("id",id);setItems(x=>x.filter(i=>i.id!==id))}
 return <main className="min-h-screen bg-slate-50"><CustomerNav/><div className="mx-auto max-w-7xl px-5 py-10"><h1 className="text-3xl font-extrabold text-ink-800">Favorites</h1>{loading?<LoadingBlock label="Loading..." className="mt-8" />:items.length===0?<p className="mt-8 text-slate-500">No saved products yet.</p>:<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map(i=><div key={i.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{i.products?.fotos?.[0]&&<SmartImage src={i.products.fotos[0]} alt="" className="aspect-square w-full object-cover"/>}<div className="p-4"><Link href={"/produto/"+i.products.slug} className="font-bold text-ink-800">{i.products.nome}</Link><p className="mt-2 font-extrabold">R {Number(i.products.preco_promocional||i.products.preco||0).toFixed(2)}</p><button onClick={()=>remove(i.id)} className="mt-3 text-sm font-bold text-red-500">Remove</button></div></div>)}</div>}</div></main>
}
