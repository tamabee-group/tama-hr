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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
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
  CircleQuestionMark,
  ArrowRightLeft,
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
export interface HelpMapping {
  topic: string;
  article?: string;
}

export interface HeaderConfig {
  mainPages: Record<string, string>;
  subPageTitles?: Record<string, string>;
  namespace: string;
  helpMapping?: Record<string, HelpMapping>;
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
  help?: HelpMapping;
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

  // Resolve help mapping cho route hiện tại
  const resolveHelp = (): HelpMapping | undefined => {
    if (!config.helpMapping) return undefined;
    // Exact match trước
    if (config.helpMapping[pathWithoutLocale]) {
      return config.helpMapping[pathWithoutLocale];
    }
    // Prefix match cho sub-pages
    for (const [prefix, mapping] of Object.entries(config.helpMapping)) {
      if (prefix.endsWith("/") && pathWithoutLocale.startsWith(prefix)) {
        return mapping;
      }
    }
    return undefined;
  };

  // Kiểm tra có phải trang chính không
  const titleKey = config.mainPages[pathWithoutLocale];

  if (titleKey) {
    return {
      title: t(titleKey),
      showBackButton: false,
      help: resolveHelp(),
    };
  }

  // Kiểm tra có phải trang con có title riêng không
  if (config.subPageTitles) {
    for (const [prefix, key] of Object.entries(config.subPageTitles)) {
      if (pathWithoutLocale.startsWith(prefix)) {
        return {
          title: t(key),
          showBackButton: false,
          help: resolveHelp(),
        };
      }
    }
  }

  // Các trang con khác - không hiển thị title
  return {
    title: "",
    showBackButton: false,
    help: resolveHelp(),
  };
}

/**
 * Xác định layout hiện tại từ pathname
 */
type LayoutKey = "personal" | "dashboard" | "admin" | "support";

function useCurrentLayout(): LayoutKey {
  const pathname = usePathname();
  if (pathname.includes("/admin")) return "admin";
  if (pathname.includes("/dashboard")) return "dashboard";
  if (pathname.includes("/support")) return "support";
  return "personal";
}

/**
 * Lấy danh sách layouts mà user có quyền truy cập
 */
interface LayoutOption {
  key: LayoutKey;
  href: string;
  labelKey: string;
}

function useAvailableLayouts(): LayoutOption[] {
  const locale = useLocale();
  const { user } = useAuth();
  const role = user?.role;

  const layouts: LayoutOption[] = [
    { key: "personal", href: `/${locale}/me`, labelKey: "myPortal" },
  ];

  const canAccessDashboard =
    role?.includes("ADMIN") || role?.includes("MANAGER");
  const isTamabeeEmployee = role?.includes("TAMABEE") ?? false;
  const isTamabeeAdmin = role === "ADMIN_TAMABEE";

  if (canAccessDashboard) {
    layouts.push({
      key: "dashboard",
      href: `/${locale}/dashboard`,
      labelKey: "hrManagement",
    });
  }

  if (isTamabeeAdmin) {
    layouts.push({
      key: "admin",
      href: `/${locale}/admin/companies`,
      labelKey: "platformManagement",
    });
  }

  if (isTamabeeEmployee) {
    layouts.push({
      key: "support",
      href: `/${locale}/support`,
      labelKey: "support",
    });
  }

  return layouts;
}

/**
 * LayoutSwitcher - Nút chuyển layout trên desktop header
 * - 1 layout: không hiển thị
 * - 2 layouts: nút toggle đơn giản
 * - 3+ layouts: select dropdown
 */
function LayoutSwitcher() {
  const router = useRouter();
  const t = useTranslations("header.menu");
  const tSidebar = useTranslations("sidebar.items");
  const currentLayout = useCurrentLayout();
  const layouts = useAvailableLayouts();

  // Chỉ có 1 layout → không cần switcher
  if (layouts.length <= 1) return null;

  // 2 layouts → nút toggle chuyển sang layout còn lại
  if (layouts.length === 2) {
    const otherLayout = layouts.find((l) => l.key !== currentLayout);
    if (!otherLayout) return null;

    const label =
      otherLayout.key === "personal"
        ? tSidebar("myPortal")
        : t(otherLayout.labelKey);

    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.push(otherLayout.href)}
      >
        <ArrowRightLeft className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </Button>
    );
  }

  // 3+ layouts → select dropdown
  return (
    <Select
      value={currentLayout}
      onValueChange={(value) => {
        const target = layouts.find((l) => l.key === value);
        if (target) router.push(target.href);
      }}
    >
      <SelectTrigger className="h-8 w-auto min-w-[170px] gap-1.5 border-none bg-transparent shadow-none text-muted-foreground hover:text-foreground text-xs focus:ring-0 [&>svg]:h-3 [&>svg]:w-3">
        <ArrowRightLeft className="h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {layouts.map((layout) => (
          <SelectItem key={layout.key} value={layout.key} className="text-xs">
            {layout.key === "personal"
              ? tSidebar("myPortal")
              : t(layout.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * DesktopHeader - Header cho desktop (md và lớn hơn)
 * Bố cục: [SidebarTrigger | Title] ... [LayoutSwitcher] [HelpLink] [NotificationBell]
 */
export function DesktopHeader({ config }: LayoutHeaderProps) {
  const { title, help } = useHeaderInfo(config);
  const t = useTranslations("header");

  return (
    <div className="sticky top-0 z-10 hidden md:flex items-center w-full bg-primary-foreground border-b border-primary/20 h-[50px] px-4">
      <SidebarTrigger size="icon-lg" className="relative right-2" />
      <Separator
        orientation="vertical"
        className="mr-3 data-[orientation=vertical]:h-4"
      />
      {title && <h1 className="text-lg font-semibold">{title}</h1>}

      {/* Right side: LayoutSwitcher → Help → NotificationBell */}
      <div className="ml-auto flex items-center gap-2">
        {help && (
          <Link
            href={`/me/help?topic=${help.topic}${help.article ? `&article=${help.article}` : ""}`}
            target="_blank"
            className="bg-none inline-flex items-center gap-1.5 px-2 py-1 mr-2 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <CircleQuestionMark className="h-4 w-4" />
            {t("help")}
          </Link>
        )}
        <NotificationBell />
        <LayoutSwitcher />
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

              {/* Trung tâm trợ giúp */}
              <Link href={`/${locale}/me/help`}>
                <DropdownMenuItem>
                  <CircleQuestionMark className="mr-2 h-4 w-4" />
                  {t("helpCenter")}
                </DropdownMenuItem>
              </Link>

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
