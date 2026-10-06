"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function CustomerNav({name}:{name?:string|null}) {
 const path=usePathname(), router=useRouter();
 const links=[["/account","Overview"],["/account/orders","Orders"],["/account/favorites","Favorites"],["/account/addresses","Addresses"],["/marketplace","Marketplace"]];
 return <header className="border-b border-slate-100 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"><Link href="/marketplace" className="font-extrabold text-xl text-[#16294F]">Newvelion</Link><nav className="hidden gap-5 md:flex">{links.map(([href,label])=><Link key={href} href={href} className={path===href?"font-bold text-blue-600":"text-sm font-semibold text-slate-600 hover:text-[#16294F]"}>{label}</Link>)}</nav><button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} className="text-sm font-bold text-slate-600 hover:text-red-600">Sign out</button></div></header>
}
