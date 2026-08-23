"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardNavigation from "@/components/navigation/DashboardNavigation";
import type { DashboardRole } from "@/components/navigation/menuConfig";

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  let role: DashboardRole = "seller";

  if (pathname.startsWith("/dashboard/admin")) {
    role = "admin";
  } else if (pathname.startsWith("/dashboard/producer")) {
    role = "producer";
  }

  return (
    <div className="min-h-screen bg-secondary">
      <DashboardNavigation role={role} />

      <main className="min-h-screen pt-16">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
