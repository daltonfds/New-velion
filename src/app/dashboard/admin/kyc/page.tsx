"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  nome_completo: string | null;
  full_name: string | null;
  role: string;
  pais: string | null;
  country: string | null;
  telefone: string | null;
  phone_number: string | null;
  kyc_status: string | null;
  status: string | null;
  created_at: string;
}

export default function AdminKycPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("seller");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, nome_completo, full_name, role, pais, country, telefone, phone_number, kyc_status, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (profilesError) {
        setError(profilesError.message);
        setLoading(false);
        return;
      }

      setProfiles((data ?? []) as Profile[]);
      setLoading(false);
    }

    load();
  }, []);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const name =
        profile.nome_completo ||
        profile.full_name ||
        "";

      const phone =
        profile.telefone ||
        profile.phone_number ||
        "";

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        profile.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (profile.kyc_status || "not_started").toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesRole =
        roleFilter === "all" ||
        profile.role.toLowerCase() === roleFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [profiles, search, statusFilter, roleFilter]);

  const summary = useMemo(() => {
    return profiles.reduce(
      (result, profile) => {
        const status =
          (profile.kyc_status || "not_started").toLowerCase();

        if (status === "approved") {
          result.approved += 1;
        } else if (status === "pending") {
          result.pending += 1;
        } else if (status === "rejected") {
          result.rejected += 1;
        } else {
          result.notStarted += 1;
        }

        return result;
      },
      {
        approved: 0,
        pending: 0,
        rejected: 0,
        notStarted: 0,
      },
    );
  }, [profiles]);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            KYC Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review seller verification status and account
            information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">
              Approved
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.approved}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.pending}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Rejected
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.rejected}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Not Started
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.notStarted}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search by name, phone, or ID..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">
                All KYC statuses
              </option>
              <option value="not_started">
                Not Started
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="rejected">
                Rejected
              </option>
            </select>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All Users</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </Card>

        {error && (
          <Card>
            <p className="text-sm text-red-600">
              {error}
            </p>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading KYC records...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No KYC records found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                No users match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Country
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Account Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Registered
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.map((profile) => {
                    const name =
                      profile.nome_completo ||
                      profile.full_name ||
                      "Unnamed user";

                    const phone =
                      profile.telefone ||
                      profile.phone_number ||
                      "—";

                    const kyc =
                      profile.kyc_status ||
                      "not_started";

                    return (
                      <tr
                        key={profile.id}
                        className="hover:bg-[#F7F8FA]"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {name}
                          </div>
                          <div className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                            {profile.id}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge>
                            {profile.role}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {profile.pais ||
                            profile.country ||
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {phone}
                        </td>

                        <td className="px-6 py-4">
                          <Badge>{kyc}</Badge>
                        </td>

                        <td className="px-6 py-4">
                          <Badge>
                            {profile.status ||
                              "active"}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(
                            profile.created_at,
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
