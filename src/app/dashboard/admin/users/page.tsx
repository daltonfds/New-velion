"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getAdminUsers, AdminUser } from "@/lib/newvelion-api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const matchesSearch =
        !query ||
        String(user.full_name || "").toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query) ||
        String(user.country || "").toLowerCase().includes(query) ||
        String(user.id || "").toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, search, role]);

  const stats = {
    total: users.length,
    sellers: users.filter((u) => u.role === "seller").length,
    suppliers: users.filter((u) => u.role === "supplier").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <DashboardShell
      area="admin"
      activeKey="users"
      title="Users"
      subtitle="Manage all platform accounts"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-950">Users</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live accounts from the NewVelion database.
            </p>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Users", stats.total, Users],
            ["Sellers", stats.sellers, UserRound],
            ["Suppliers", stats.suppliers, Shield],
            ["Admins", stats.admins, CheckCircle2],
          ].map(([label, value, Icon]) => {
            const IconComponent = Icon as typeof Users;
            return (
              <div
                key={String(label)}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{String(label)}</span>
                  <IconComponent size={19} className="text-blue-600" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-950">
                  {String(value)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, country or user ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
            >
              <option value="all">All roles</option>
              <option value="seller">Seller</option>
              <option value="supplier">Supplier</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <Users size={32} className="text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {["User", "Country", "Role", "Status", "Joined"].map((head) => (
                      <th
                        key={head}
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <UserRound size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.full_name || "Unnamed user"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email || user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.country || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                          {user.role || "user"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {user.status || "active"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{filteredUsers.length} users displayed</span>
          <span>Connected to live platform data</span>
        </div>
      </div>
    </DashboardShell>
  );
}
