"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  startTransition,
} from "react";
import { ShieldCheck } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type {
  SidebarGroup as SidebarGroupType,
  SidebarHeaderConfig,
  SidebarItem,
  SidebarSubItem,
} from "@/types/sidebar";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils/file-url";
import { useAuth } from "@/hooks/use-auth";
import { isAdminTamabee, hasPermission } from "@/types/permissions";
import { hasCompanyPermission } from "@/types/company-permissions";
import { cn } from "@/lib/utils";
import { SidebarSettingsDialog } from "./_sidebar-settings-dialog";

/**
 * Kiểm tra menu item có đang active không
 * So sánh pathname với URL, bỏ qua locale prefix
 */
function isMenuItemActive(pathname: string, itemUrl: string): boolean {
  // Loại bỏ locale prefix từ pathname (ví dụ: /vi/dashboard/employees -> /dashboard/employees)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, "/");

  // So sánh exact match
  if (pathWithoutLocale === itemUrl) {
    return true;
  }

  // Kiểm tra nếu đang ở sub-route của item
  // Ví dụ: /dashboard/employees/123 active cho /dashboard/employees
  // Nhưng /dashboard KHÔNG active cho /dashboard/employees
  if (itemUrl !== "/dashboard" && pathWithoutLocale.startsWith(itemUrl + "/")) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra item có yêu cầu Admin-only permission không
 */
function isAdminOnlyItem(item: SidebarItem): boolean {
  if (!item.requiredPermission && !item.requiredCompanyPermission) return false;

  const tamabeeAdminOnlyPermissions = [
    "DIRECT_WALLET_MANIPULATION",
    "SYSTEM_SETTINGS",
    "MANAGE_USERS",
  ];

  const companyAdminOnlyPermissions = [
    "MANAGE_SETTINGS",
    "MANAGE_DEPOSITS",
    "MANAGE_PAYROLL",
    "EDIT_COMPANY_PROFILE",
  ];

  if (item.requiredPermission) {
    return tamabeeAdminOnlyPermissions.includes(item.requiredPermission);
  }

  if (item.requiredCompanyPermission) {
    return companyAdminOnlyPermissions.includes(item.requiredCompanyPermission);
  }

  return false;
}

/**
 * Kiểm tra user có quyền truy cập item không
 */
function canAccessItem(
  item: SidebarItem | SidebarSubItem,
  userRole?: string,
): boolean {
  if (!userRole) return true;

  if (
    !item.requiredPermission &&
    !("requiredCompanyPermission" in item && item.requiredCompanyPermission)
  ) {
    return true;
  }

  if (item.requiredPermission) {
    return hasPermission(userRole, item.requiredPermission);
  }

  if ("requiredCompanyPermission" in item && item.requiredCompanyPermission) {
    return hasCompanyPermission(userRole, item.requiredCompanyPermission);
  }

  return true;
}

/**
 * Component hiển thị Admin badge
 */
function AdminBadge({ tooltip }: { tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-auto">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BaseSidebarProps {
  groups: SidebarGroupType[];
  headerConfig: SidebarHeaderConfig;
  className?: string;
  headerHeight?: number;
  userRole?: string;
  /** Extra content hiển thị dưới header (ví dụ: work mode indicator) */
  headerExtra?: React.ReactNode;
}

export function BaseSidebar({
  groups,
  headerConfig,
  className,
  headerHeight,
  userRole,
  headerExtra,
}: BaseSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const t = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Settings dialog state - mở từ query param nếu có
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Kiểm tra query param để mở dialog sau khi chuyển ngôn ngữ
  useEffect(() => {
    if (searchParams.get("settings") === "open") {
      startTransition(() => {
        setSettingsOpen(true);
      });
      // Xóa query param khỏi URL
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Scroll shadow state
  const contentRef = useRef<HTMLDivElement>(null);
  const [showHeaderShadow, setShowHeaderShadow] = useState(false);
  const [showFooterShadow, setShowFooterShadow] = useState(false);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowHeaderShadow(scrollTop > 0);
    setShowFooterShadow(scrollTop + clientHeight < scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    handleScroll();

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const showAdminBadge = userRole ? !isAdminTamabee(userRole) : false;

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Header với shadow khi scroll */}
        <SidebarHeader
          className={cn(
            "transition-shadow duration-200",
            showHeaderShadow && "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]",
          )}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="flex items-center cursor-default hover:bg-transparent"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-xs overflow-hidden shrink-0">
                  {headerConfig.logo ? (
                    typeof headerConfig.logo === "string" ? (
                      <Image
                        src={getFileUrl(headerConfig.logo) || headerConfig.logo}
                        alt={headerConfig.name}
                        width={32}
                        height={32}
                        className="size-8 object-cover"
                      />
                    ) : (
                      headerConfig.logo
                    )
                  ) : (
                    <div className="size-8 bg-muted flex items-center justify-center">
                      <span className="text-[8px] font-medium text-muted-foreground">
                        LOGO
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-0.5 leading-none overflow-hidden transition-all duration-200",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                  )}
                >
                  <span className="text-xl truncate max-w-[170px] font-kanit whitespace-nowrap">
                    {headerConfig.name}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* Extra content dưới header (work mode indicator, etc.) */}
          {headerExtra && !isCollapsed && (
            <div className="px-2 pb-2">{headerExtra}</div>
          )}
        </SidebarHeader>

        <SidebarContent ref={contentRef}>
          {groups.map((group) => {
            const filteredItems = group.items.filter((item) =>
              canAccessItem(item, userRole),
            );

            if (filteredItems.length === 0) return null;

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu
                    className={className}
                    style={{ top: headerHeight || 0 }}
                  >
                    {filteredItems.map((item) => {
                      const filteredSubItems = item.items?.filter((subItem) =>
                        canAccessItem(subItem, userRole),
                      );

                      if (
                        item.items &&
                        (!filteredSubItems || filteredSubItems.length === 0)
                      ) {
                        return null;
                      }

                      return filteredSubItems && filteredSubItems.length > 0 ? (
                        <Collapsible
                          key={item.title}
                          defaultOpen
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton>
                                {item.icon}
                                <span>{item.title}</span>
                                {showAdminBadge && isAdminOnlyItem(item) && (
                                  <AdminBadge tooltip={t("adminOnly")} />
                                )}
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {filteredSubItems.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isMenuItemActive(
                                        pathname,
                                        subItem.url,
                                      )}
                                    >
                                      <Link href={subItem.url}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      ) : (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isMenuItemActive(pathname, item.url)}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                              {showAdminBadge && isAdminOnlyItem(item) && (
                                <AdminBadge tooltip={t("adminOnly")} />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        {/* Footer với shadow khi scroll - ChatGPT style */}
        <SidebarFooter
          className={cn(
            "mb-20 transition-shadow duration-200",
            showFooterShadow && "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",
          )}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer"
                onClick={() => setSettingsOpen(true)}
                tooltip={user?.email || ""}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={getFileUrl(user?.profile?.avatar)}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-sm">
                    {user?.profile?.name?.[0] ||
                      user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">
                    {user?.profile?.name || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {user?.role ? tEnums(`userRole.${user.role}`) : ""}
                  </span>
                </div>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Settings Dialog */}
      <SidebarSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />
    </>
  );
}
