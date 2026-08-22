"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*");
      if (data) setUsers(data);
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Users</h1><div className="bg-white p-6 rounded-xl border border-light-border"><div className="space-y-3">{users.length === 0 ? <p className="text-light-muted">No users.</p> : users.map((u: any) => (
        <div key={u.id} className="flex justify-between py-3 border-b border-light-border">
          <p className="text-sm">{u.full_name} <span className="text-xs text-light-muted">({u.role})</span></p>
          <p className="text-xs text-light-muted">{u.email}</p>
        </div>
      ))}</div></div></div>
    </div>
  );
}
