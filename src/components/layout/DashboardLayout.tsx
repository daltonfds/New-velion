"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardNavigation from "@/components/navigation/DashboardNavigation";
import type { DashboardRole } from "@/components/navigation/menuConfig";

function getRoleFromPath(pathname: string): DashboardRole {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/producer")) return "producer";
  return "seller";
}

export default function DashboardLayout({
  children,
  userType,
}: {
  children: ReactNode;
  userType?: "seller" | "producer" | "admin";
}) {
  const pathname = usePathname();
  const role = userType ?? getRoleFromPath(pathname);

  return (
    <div className="min-h-screen bg-light-bg">
      <DashboardNavigation role={role} />

      <main
        key={pathname}
        className="min-h-screen px-4 pb-8 pt-20 sm:px-5 lg:px-6"
      >
        <div className="mx-auto w-full max-w-[1600px] animate-[dashboard-enter_220ms_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
}
