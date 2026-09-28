"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  nome_completo: string | null;
  full_name: string | null;
  role: string | null;
  pais: string | null;
  country: string | null;
  telefone: string | null;
  phone_number: string | null;
  kyc_status: string | null;
  status: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select(
          "id, nome_completo, full_name, role, pais, country, telefone, phone_number, kyc_status, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setUsers((data ?? []) as UserProfile[]);
      setLoading(false);
    }

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = (
        user.nome_completo ||
        user.full_name ||
        ""
      ).toLowerCase();

      const phone = (
        user.telefone ||
        user.phone_number ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        phone.includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const normalizedStatus = user.status || "active";

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-indigo-600">Account</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage Newvelion user accounts.
          </p>
        </div>

        <Card>
          <div className="grid gap-4 p-6 md:grid-cols-[1fr_180px_180px]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone or ID..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Role
              </label>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All Roles</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                User Accounts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="font-semibold text-slate-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing the search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Country</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">KYC</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Registered</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const name =
                      user.nome_completo ||
                      user.full_name ||
                      "Unnamed User";

                    const phone =
                      user.telefone ||
                      user.phone_number ||
                      "—";

                    const country =
                      user.pais ||
                      user.country ||
                      "—";

                    const status = user.status || "active";
                    const kyc = user.kyc_status || "pending";

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {user.id.slice(0, 12)}...
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge>
                            {user.role === "admin"
                              ? "Admin"
                              : user.role === "seller"
                                ? "Seller"
                                : user.role || "Unknown"}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {country}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {phone}
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              kyc === "approved"
                                ? "success"
                                : "default"
                            }
                          >
                            {kyc}
                          </Badge>
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              status === "active"
                                ? "success"
                                : "default"
                            }
                          >
                            {status}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(
                            user.created_at,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
