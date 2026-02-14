"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LogoFull } from "@/app/[locale]/_components/_logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/app/[locale]/_components/_header/_notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Settings,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Clock,
  Bell,
  Coins,
  Users,
  Wallet,
  CreditCard,
  User,
  Building,
  Receipt,
  Package,
  Grid2X2,
  ChevronDown,
  Wrench,
  MessageSquare,
  LifeBuoy,
} from "lucide-react";
import { getFileUrl } from "@/lib/utils/file-url";
import { useAuth } from "@/hooks/use-auth";
import { SidebarSettingsDialog } from "@/app/[locale]/_components/_base/_sidebar-settings-dialog";

/**
 * Interface cho cấu hình header
 * mainPages: Map pathname -> translation key
 * subPageTitles: Map pathname prefix -> translation key (cho trang con có title riêng)
 * namespace: Translation namespace cho titles
 */
export interface HeaderConfig {
  mainPages: Record<string, string>;
  subPageTitles?: Record<string, string>;
  namespace: string;
}

export interface LayoutHeaderProps {
  config: HeaderConfig;
}

/**
 * Interface cho thông tin header
 */
interface HeaderInfo {
  title: string;
  showBackButton: boolean;
}

/**
 * Hook lấy thông tin header từ pathname và config
 * Trả về title
 */
function useHeaderInfo(config: HeaderConfig): HeaderInfo {
  const pathname = usePathname();
  const t = useTranslations(config.namespace);

  // Loại bỏ locale prefix
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, "/");

  // Kiểm tra có phải trang chính không
  const titleKey = config.mainPages[pathWithoutLocale];

  if (titleKey) {
    return {
      title: t(titleKey),
      showBackButton: false,
    };
  }

  // Kiểm tra có phải trang con có title riêng không
  if (config.subPageTitles) {
    for (const [prefix, key] of Object.entries(config.subPageTitles)) {
      if (pathWithoutLocale.startsWith(prefix)) {
        return {
          title: t(key),
          showBackButton: false,
        };
      }
    }
  }

  // Các trang con khác - không hiển thị title
  return {
    title: "",
    showBackButton: false,
  };
}

/**
 * DesktopHeader - Header cho desktop (md và lớn hơn)
 * - Trang chính: hiển thị title với text-lg font-semibold
 * - Trang con có title trong subPageTitles: hiển thị title
 * - Trang con khác: không hiển thị gì (BackButton ở content page)
 * - NotificationBell ở bên phải
 */
export function DesktopHeader({ config }: LayoutHeaderProps) {
  const { title } = useHeaderInfo(config);

  return (
    <div className="sticky top-0 z-10 hidden md:flex items-center w-full bg-primary-foreground border-b border-primary/20 h-[50px] px-4">
      <SidebarTrigger size="icon-lg" className="relative right-2" />
      <Separator
        orientation="vertical"
        className="mr-3 data-[orientation=vertical]:h-4"
      />
      {title && <h1 className="text-lg font-semibold">{title}</h1>}

      {/* Đẩy NotificationBell sang bên phải */}
      <div className="ml-auto">
        <NotificationBell />
      </div>
    </div>
  );
}

/**
 * MobileHeader - Header cho mobile (dưới md breakpoint)
 * - Logo Tamabee bên trái
 * - Avatar Dropdown bên phải với: user info, dashboard link (admin/manager), settings, logout
 * - Hiển thị các menu items từ sidebar (không có trong bottom nav)
 */
export function MobileHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("header");
  const tPortal = useTranslations("portal");
  const tSidebar = useTranslations("sidebar");
  const tEnums = useTranslations("enums");
  const tAuth = useTranslations("auth");
  const tSupport = useTranslations("support");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);

  // Kiểm tra có quyền truy cập dashboard không (Admin hoặc Manager)
  const canAccessDashboard =
    user?.role?.includes("ADMIN") || user?.role?.includes("MANAGER");

  // Kiểm tra có phải Tamabee employee không
  const isTamabeeEmployee = user?.role?.includes("TAMABEE") ?? false;

  // Kiểm tra có phải Tamabee Admin/Manager không
  const isTamabeeManager =
    user?.role === "ADMIN_TAMABEE" || user?.role === "MANAGER_TAMABEE";

  // Kiểm tra có phải Admin không
  const isAdmin = user?.role?.includes("ADMIN") ?? false;

  // Kiểm tra đang ở layout nào
  const isInPersonalLayout = pathname.includes("/me");
  const isInDashboardLayout = pathname.includes("/dashboard");
  const isInTamabeeLayout = pathname.includes("/admin");
  const isInSupportLayout = pathname.includes("/support");

  const handleLogout = async () => {
    await logout();
    toast.success(tAuth("logoutSuccess"));
    setTimeout(() => {
      router.push("/");
    }, 100);
  };

  // Build cross-layout management items (links đến các layout khác)
  const managementLinks: {
    key: string;
    href: string;
    icon: typeof LayoutDashboard;
    label: string;
  }[] = [];

  if (canAccessDashboard && !isInDashboardLayout) {
    managementLinks.push({
      key: "mgmt-dashboard",
      href: `/${locale}/dashboard`,
      icon: Users,
      label: t("menu.hrManagement"),
    });
  }

  if (isTamabeeManager && !isInTamabeeLayout) {
    managementLinks.push({
      key: "mgmt-admin",
      href: `/${locale}/admin/companies`,
      icon: Building,
      label: t("menu.platformManagement"),
    });
  }

  if (isTamabeeEmployee && !isInSupportLayout) {
    managementLinks.push({
      key: "mgmt-support",
      href: `/${locale}/support`,
      icon: LifeBuoy,
      label: t("menu.support"),
    });
  }

  if (!isInPersonalLayout) {
    managementLinks.push({
      key: "mgmt-personal",
      href: `/${locale}/me`,
      icon: User,
      label: tSidebar("items.myPortal"),
    });
  }

  // Có hiển thị nhóm Quản lý collapsible không
  const showManagementGroup = managementLinks.length > 1;

  // Menu items cho PersonalLayout - các mục không có trong bottom nav
  // Bottom nav có: home, schedule, leave, payroll, profile
  const personalMenuItems = [
    {
      key: "attendance",
      href: `/${locale}/me/attendance`,
      icon: ClipboardCheck,
      label: tPortal("navigation.attendance"),
    },
    {
      key: "contract",
      href: `/${locale}/me/contract`,
      icon: FileText,
      label: tPortal("navigation.contract"),
    },
    {
      key: "documents",
      href: `/${locale}/me/documents`,
      icon: FolderOpen,
      label: tPortal("navigation.documents"),
    },
    {
      key: "adjustments",
      href: `/${locale}/me/adjustments`,
      icon: Clock,
      label: tPortal("navigation.adjustments"),
    },
    {
      key: "notifications",
      href: `/${locale}/me/notifications`,
      icon: Bell,
      label: tPortal("navigation.notifications"),
    },
    ...(isTamabeeEmployee
      ? [
          {
            key: "commissions",
            href: `/${locale}/me/commissions`,
            icon: Coins,
            label: tPortal("navigation.commissions"),
          },
        ]
      : []),
  ];

  // Menu items cho DashboardLayout - các mục chính từ sidebar (không bao gồm my-portal cho Tamabee)
  const dashboardMenuItems = [
    {
      key: "dashboard-home",
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      label: tSidebar("items.dashboard"),
    },
    ...(canAccessDashboard
      ? [
          {
            key: "employees",
            href: `/${locale}/dashboard/employees`,
            icon: Users,
            label: tSidebar("items.employees"),
          },
          {
            key: "attendance",
            href: `/${locale}/dashboard/attendance`,
            icon: ClipboardCheck,
            label: tSidebar("items.attendanceRecords"),
          },
          {
            key: "leaves",
            href: `/${locale}/dashboard/leaves`,
            icon: FileText,
            label: tSidebar("items.leaveRequests"),
          },
          {
            key: "adjustments",
            href: `/${locale}/dashboard/adjustments`,
            icon: Clock,
            label: tSidebar("items.adjustments"),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            key: "payroll",
            href: `/${locale}/dashboard/payroll`,
            icon: Wallet,
            label: tSidebar("items.payrollRecords"),
          },
          {
            key: "wallet",
            href: `/${locale}/dashboard/wallet`,
            icon: CreditCard,
            label: tSidebar("items.wallet"),
          },
          {
            key: "settings",
            href: `/${locale}/dashboard/settings`,
            icon: Wrench,
            label: tSidebar("items.companySettings"),
          },
        ]
      : []),
    // my-portal chỉ hiển thị cho Company Admin/Manager (không phải Tamabee)
    ...(!isTamabeeEmployee
      ? [
          {
            key: "my-portal",
            href: `/${locale}/me`,
            icon: User,
            label: tSidebar("items.myPortal"),
          },
        ]
      : []),
  ];

  // Menu items cho TamabeeLayout - các mục từ admin sidebar (không bao gồm my-portal và settings)
  const tamabeeMenuItems = [
    {
      key: "companies",
      href: `/${locale}/admin/companies`,
      icon: Building,
      label: tSidebar("items.customers"),
    },
    {
      key: "deposits",
      href: `/${locale}/admin/deposits`,
      icon: Receipt,
      label: tSidebar("items.deposits"),
    },
    ...(isAdmin
      ? [
          {
            key: "billing",
            href: `/${locale}/admin/billing`,
            icon: CreditCard,
            label: tSidebar("items.billing"),
          },
          {
            key: "plans",
            href: `/${locale}/admin/plans`,
            icon: Package,
            label: tSidebar("items.plans"),
          },
        ]
      : []),
  ];

  // Menu items cho SupportLayout - các mục từ support sidebar
  const supportMenuItems = [
    {
      key: "support-home",
      href: `/${locale}/support`,
      icon: LayoutDashboard,
      label: tSupport("navigation.home"),
    },
    {
      key: "support-referrals",
      href: `/${locale}/support/referrals`,
      icon: Building,
      label: tSupport("navigation.referrals"),
    },
    {
      key: "support-commissions",
      href: `/${locale}/support/commissions`,
      icon: Receipt,
      label: tSupport("navigation.commissions"),
    },
    {
      key: "support-feedbacks",
      href: `/${locale}/support/feedbacks`,
      icon: MessageSquare,
      label: tSupport("navigation.feedbacks"),
    },
  ];

  // Chọn menu items phù hợp với layout hiện tại
  const additionalMenuItems = isInPersonalLayout
    ? personalMenuItems
    : isInDashboardLayout
      ? dashboardMenuItems
      : isInTamabeeLayout
        ? tamabeeMenuItems
        : isInSupportLayout
          ? supportMenuItems
          : [];

  return (
    <>
      <div className="sticky top-0 z-10 flex md:hidden items-center justify-between w-full bg-white/80 dark:bg-[#222]/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 h-[50px] px-4">
        {/* Logo */}
        <Link href={`/${locale}/me`} className="flex items-center">
          <LogoFull isShowText={true} />
        </Link>

        {/* NotificationBell và Avatar Dropdown */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center cursor-pointer outline-none">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage
                    src={getFileUrl(user?.profile?.avatar)}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-sm bg-primary/10">
                    {user?.profile?.name?.[0] ||
                      user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-[70vh] overflow-y-auto"
            >
              {/* User info */}
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.profile?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role ? tEnums(`userRole.${user.role}`) : ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Nhóm Quản lý collapsible - thống nhất cho tất cả layouts */}
              {showManagementGroup && (
                <>
                  <Collapsible
                    open={managementOpen}
                    onOpenChange={setManagementOpen}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer">
                      <span className="flex items-center">
                        <Grid2X2 className="mr-2 h-4 w-4" />
                        {t("menu.management")}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${managementOpen ? "rotate-180" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4">
                      {managementLinks.map((link) => (
                        <Link key={link.key} href={link.href}>
                          <DropdownMenuItem>
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.label}
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Single management link - khi chỉ có 1 link (ví dụ Company Admin/Manager ở PersonalLayout) */}
              {!showManagementGroup &&
                managementLinks.length === 1 &&
                (() => {
                  const SingleIcon = managementLinks[0].icon;
                  return (
                    <>
                      <Link href={managementLinks[0].href}>
                        <DropdownMenuItem>
                          <SingleIcon className="mr-2 h-4 w-4" />
                          {managementLinks[0].label}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                    </>
                  );
                })()}

              {/* Additional menu items từ sidebar */}
              {additionalMenuItems.length > 0 && (
                <>
                  {additionalMenuItems.map((item) => (
                    <Link key={item.key} href={item.href}>
                      <DropdownMenuItem>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Settings */}
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                {t("settings")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Settings Dialog */}
      <SidebarSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />
    </>
  );
}
