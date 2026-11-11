"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
export default function CustomerNav({name}:{name?:string|null}) {
 const path=usePathname(), router=useRouter();
 const links=[["/account","Overview"],["/account/orders","Orders"],["/account/favorites","Favorites"],["/account/reviews","Reviews"],["/account/membership","Membership"],["/account/addresses","Addresses"],["/marketplace","Marketplace"]];
 return <header className="sticky top-0 z-40 border-b border-ink-200 bg-white"><div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-5 py-4 lg:px-8"><Link href="/marketplace"><NewvelionBrand size="sm"/></Link><nav className="hidden items-center gap-1 md:flex">{links.map(([href,label])=><Link key={href} href={href} className={"rounded-[7px] px-3 py-2 text-sm font-semibold transition "+(path===href?"bg-[#eef5ff] text-brand-600":"text-[#616e85] hover:bg-ink-100 hover:text-ink-900")}>{label}</Link>)}</nav><div className="flex items-center gap-2"><Link href="/cart" className="rounded-[7px] border border-ink-200 px-3 py-2 text-sm font-bold text-ink-900">Cart</Link><button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} className="hidden rounded-[7px] px-3 py-2 text-sm font-bold text-[#616e85] hover:text-red-600 sm:block transition duration-150">Sign out</button></div></div></header>
}