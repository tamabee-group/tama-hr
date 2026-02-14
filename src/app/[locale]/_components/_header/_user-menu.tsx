"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Settings,
  Users,
  Building2,
  Wallet,
  Clock,
  FileText,
  CalendarDays,
} from "lucide-react";
import type { User, UserRole } from "@/types/user";
import { getFileUrl } from "@/lib/utils/file-url";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

interface MenuConfig {
  dashboard?: MenuItem;
  items: MenuItem[];
  profile?: MenuItem;
}

// Cấu hình menu cho từng role
const MENU_CONFIG: Record<UserRole, MenuConfig> = {
  // Tamabee Admin - Quản lý toàn hệ thống + HR features
  ADMIN_TAMABEE: {
    dashboard: {
      href: "/admin/companies",
      labelKey: "platformAdmin",
      icon: Building2,
    },
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/admin/deposits", labelKey: "deposits", icon: Wallet },
      { href: "/admin/settings", labelKey: "settings", icon: Settings },
    ],
  },
  // Tamabee Manager - Quản lý công ty và deposits + HR features
  MANAGER_TAMABEE: {
    dashboard: {
      href: "/admin/companies",
      labelKey: "platformAdmin",
      icon: Building2,
    },
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/admin/deposits", labelKey: "deposits", icon: Wallet },
    ],
  },
  // Tamabee Employee - HR features
  EMPLOYEE_TAMABEE: {
    dashboard: {
      href: "/support",
      labelKey: "support",
      icon: LayoutDashboard,
    },
    items: [
      {
        href: "/support/referrals",
        labelKey: "referrals",
        icon: Building2,
      },
      {
        href: "/support/commissions",
        labelKey: "commissions",
        icon: Wallet,
      },
    ],
  },
  // Company Admin - Quản lý công ty
  ADMIN_COMPANY: {
    dashboard: {
      href: "/dashboard",
      labelKey: "dashboard",
      icon: LayoutDashboard,
    },
    items: [
      { href: "/dashboard/employees", labelKey: "employees", icon: Users },
      { href: "/dashboard/attendance", labelKey: "attendance", icon: Clock },
      { href: "/company/wallet", labelKey: "wallet", icon: Wallet },
      { href: "/company/reports", labelKey: "reports", icon: FileText },
      {
        href: "/dashboard/settings",
        labelKey: "companySettings",
        icon: Settings,
      },
    ],
    profile: {
      href: "/dashboard/profile",
      labelKey: "profile",
      icon: UserIcon,
    },
  },
  // Company Manager - Quản lý nhân viên
  MANAGER_COMPANY: {
    dashboard: {
      href: "/dashboard",
      labelKey: "dashboard",
      icon: LayoutDashboard,
    },
    items: [
      { href: "/dashboard/employees", labelKey: "employees", icon: Users },
      { href: "/dashboard/attendance", labelKey: "attendance", icon: Clock },
      { href: "/company/reports", labelKey: "reports", icon: FileText },
    ],
    profile: {
      href: "/dashboard/profile",
      labelKey: "profile",
      icon: UserIcon,
    },
  },
  // Company Employee - Nhân viên
  EMPLOYEE_COMPANY: {
    dashboard: {
      href: "/dashboard/attendance/me",
      labelKey: "myAttendance",
      icon: Clock,
    },
    items: [
      { href: "/dashboard/leaves", labelKey: "myLeave", icon: CalendarDays },
    ],
  },
};

/**
 * Menu dropdown cho user đã đăng nhập
 * @client-only - Chỉ sử dụng được ở client side
 */
export function UserMenu({ user, onLogout }: UserMenuProps) {
  const t = useTranslations("header");
  const tEnums = useTranslations("enums");

  if (!user) return null;

  const menuConfig = MENU_CONFIG[user.role];
  const hasMenuItems = menuConfig.dashboard || menuConfig.items.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 overflow-hidden rounded-full"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={getFileUrl(user.profile?.avatar)} alt="Avatar" />
            <AvatarFallback>
              {user.profile?.name?.charAt(0) ||
                user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="absolute -bottom-1 right-1/2 translate-x-1/2 bg-secondary/80 rounded-full shadow-2xl" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-222">
        {/* User info */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.profile?.name || user.email}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {tEnums(`userRole.${user.role}`)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard & Role-specific items */}
        {hasMenuItems && (
          <>
            <DropdownMenuGroup>
              {menuConfig.dashboard && (
                <Link href={menuConfig.dashboard.href}>
                  <DropdownMenuItem>
                    <menuConfig.dashboard.icon className="mr-2 h-4 w-4" />
                    {t(`menu.${menuConfig.dashboard.labelKey}`)}
                  </DropdownMenuItem>
                </Link>
              )}
              {menuConfig.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem>
                    <item.icon className="mr-2 h-4 w-4" />
                    {t(`menu.${item.labelKey}`)}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Common items - Profile chỉ hiển thị nếu role có config */}
        {menuConfig.profile && (
          <>
            <DropdownMenuGroup>
              <Link href={menuConfig.profile.href}>
                <DropdownMenuItem>
                  <menuConfig.profile.icon className="mr-2 h-4 w-4" />
                  {t(`menu.${menuConfig.profile.labelKey}`)}
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Logout */}
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
