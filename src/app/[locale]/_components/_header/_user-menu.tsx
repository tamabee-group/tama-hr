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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  LogOut,
  ShieldUser,
  User as UserIcon,
} from "lucide-react";
import type { User, UserRole } from "@/types/user";
import { ADMIN_ROLES } from "@/types/user";
import { getFileUrl } from "@/lib/utils/file-url";
import { useTranslations } from "next-intl";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

// Mapping role -> admin dashboard URL
const ADMIN_DASHBOARD_URLS: Partial<Record<UserRole, string>> = {
  ADMIN_TAMABEE: "/tamabee/users",
  MANAGER_TAMABEE: "/tamabee/users",
  EMPLOYEE_TAMABEE: "/employee/support",
  ADMIN_COMPANY: "/company/employees",
  MANAGER_COMPANY: "/company/employees",
};

/**
 * Menu dropdown cho user đã đăng nhập
 * @client-only - Chỉ sử dụng được ở client side
 */
export function UserMenu({ user, onLogout }: UserMenuProps) {
  const t = useTranslations("header");
  const tEnums = useTranslations("enums");

  if (!user) return null;

  const isAdmin = ADMIN_ROLES.includes(user.role);
  const adminDashboardUrl = ADMIN_DASHBOARD_URLS[user.role] || "/tamabee/users";

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
      <DropdownMenuContent align="end" className="z-222">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
            {user.profile?.name && (
              <p className="text-xs text-muted-foreground">
                {user.profile?.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {tEnums(`userRole.${user.role}`)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isAdmin && (
          <>
            <Link href={adminDashboardUrl}>
              <DropdownMenuItem>
                <ShieldUser className="mr-2 h-4 w-4" />
                {t("adminDashboard")}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}

        <Link href="/profile">
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            {t("userProfile")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
