"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import {
  useTamabeeSidebarGroups,
  getFilteredSidebarGroups,
} from "./_components/_tamabee-sidebar-items";
import { usePendingDepositsCount } from "@/hooks/use-pending-deposits-count";
import type { SidebarHeaderConfig } from "@/types/sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";
import { useAuth } from "@/hooks/use-auth";
import { isTamabeeStaff, isEmployeeTamabee } from "@/types/permissions";

// Header config cho Tamabee Admin
const tamabeeHeaderConfig: SidebarHeaderConfig = {
  logo: <SidebarLogo size={32} />,
  name: "TAMABEE",
  fallback: "TM",
};

/**
 * Layout cho Tamabee Admin/Manager
 * - Kiểm tra role và redirect nếu không có quyền
 * - Filter sidebar items dựa trên role
 * - Hiển thị badge count cho pending deposits
 */
export default function TamabeeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();
  const { count: pendingDepositsCount } = usePendingDepositsCount();
  const sidebarGroups = useTamabeeSidebarGroups();

  // Redirect nếu không có quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Employee Tamabee phải dùng layout riêng
    if (isEmployeeTamabee(user.role)) {
      router.replace("/employee-tamabee/referrals");
      return;
    }

    // Chỉ Admin và Manager Tamabee mới được truy cập
    if (!isTamabeeStaff(user.role)) {
      router.replace("/");
      return;
    }
  }, [user, status, router]);

  // Hiển thị loading khi đang kiểm tra auth
  if (status === "loading" || !user) {
    return null;
  }

  // Không render nếu không có quyền
  if (!isTamabeeStaff(user.role)) {
    return null;
  }

  const badgeCounts = {
    pendingDeposits: pendingDepositsCount,
  };

  // Filter sidebar items dựa trên role của user
  const filteredSidebarGroups = getFilteredSidebarGroups(
    sidebarGroups,
    user.role,
  );

  return (
    <AdminLayoutWrapper
      sidebarGroups={filteredSidebarGroups}
      headerConfig={tamabeeHeaderConfig}
      badgeCounts={badgeCounts}
      userRole={user.role}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
