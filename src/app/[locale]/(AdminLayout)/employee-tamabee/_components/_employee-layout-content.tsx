"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayoutWrapper } from "../../_components/_admin-layout-wrapper";
import { useEmployeeTamabeeSidebarGroups } from "./_employee-sidebar-items";
import type { SidebarHeaderConfig } from "@/types/sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";
import { useAuth } from "@/hooks/use-auth";
import { isEmployeeTamabee, isTamabeeStaff } from "@/types/permissions";

/**
 * Tạo header config cho Employee Tamabee
 * Hiển thị tên nhân viên
 */
function getEmployeeHeaderConfig(userName?: string): SidebarHeaderConfig {
  const displayName = userName || "Employee";

  return {
    logo: <SidebarLogo size={32} />,
    name: displayName,
    fallback: displayName.substring(0, 2).toUpperCase(),
  };
}

interface EmployeeLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Client component xử lý auth và render layout cho Employee Tamabee
 * - Kiểm tra role và redirect nếu không có quyền
 * - Hiển thị sidebar với menu Referrals và Commissions
 * @client-only
 */
export function EmployeeLayoutContent({
  children,
}: EmployeeLayoutContentProps) {
  const router = useRouter();
  const { user, status } = useAuth();
  const sidebarGroups = useEmployeeTamabeeSidebarGroups();

  // Lấy thông tin để hiển thị header
  const userName = user?.profile?.name || user?.email?.split("@")[0];
  const headerConfig = getEmployeeHeaderConfig(userName);

  // Redirect nếu không có quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Admin và Manager Tamabee phải dùng layout tamabee
    if (isTamabeeStaff(user.role)) {
      router.replace("/tamabee/customers");
      return;
    }

    // Chỉ Employee Tamabee mới được truy cập
    if (!isEmployeeTamabee(user.role)) {
      router.replace("/");
      return;
    }
  }, [user, status, router]);

  // Hiển thị loading khi đang kiểm tra auth
  if (status === "loading" || !user) {
    return null;
  }

  // Không render nếu không có quyền
  if (!isEmployeeTamabee(user.role)) {
    return null;
  }

  return (
    <AdminLayoutWrapper
      sidebarGroups={sidebarGroups}
      headerConfig={headerConfig}
      userRole={user.role}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
