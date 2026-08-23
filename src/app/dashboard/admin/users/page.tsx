"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";

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
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white p-6 rounded-xl border border-light-border">
        <div className="space-y-3">
          {users.length === 0 ? <p className="text-sm text-light-muted">No users.</p> : users.map((u: any) => (
            <div key={u.id} className="flex justify-between py-3 border-b border-light-border">
              <div>
                <p className="text-sm font-medium text-light-text">{u.full_name}</p>
                <p className="text-xs text-light-muted">{u.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-light-muted">{u.role}</p>
                <button className="text-xs text-primary mt-1">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
