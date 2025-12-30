"use client";

import {
  ChevronUp,
  LogOut,
  UserRoundPen,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ChevronRight } from "lucide-react";
import type {
  SidebarGroup as SidebarGroupType,
  SidebarHeaderConfig,
  SidebarItem,
} from "@/types/sidebar";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils/file-url";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLE_LABELS } from "@/types/user";
import { toast } from "sonner";
import { isAdminTamabee } from "@/types/permissions";

/**
 * Kiểm tra item có yêu cầu Admin-only permission không
 * Các permission chỉ Admin mới có: DIRECT_WALLET_MANIPULATION, SYSTEM_SETTINGS, MANAGE_USERS
 */
function isAdminOnlyItem(item: SidebarItem): boolean {
  if (!item.requiredPermission) return false;
  const adminOnlyPermissions = [
    "DIRECT_WALLET_MANIPULATION",
    "SYSTEM_SETTINGS",
    "MANAGE_USERS",
  ];
  return adminOnlyPermissions.includes(item.requiredPermission);
}

/**
 * Component hiển thị Admin badge cho các features chỉ Admin mới có
 */
function AdminBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-auto">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Chỉ Admin</p>
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
  badgeCounts?: Record<string, number>;
  /** Role của user hiện tại, dùng để hiển thị visual indicators */
  userRole?: string;
}

export function BaseSidebar({
  groups,
  headerConfig,
  className,
  headerHeight,
  badgeCounts = {},
  userRole,
}: BaseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Chỉ hiển thị Admin badge khi user không phải Admin
  const showAdminBadge = userRole ? !isAdminTamabee(userRole) : false;

  const handleLogout = async () => {
    await logout();
    router.push("/");
    toast.success("Đăng xuất thành công");
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header với logo và tên */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="flex items-center cursor-default hover:bg-transparent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-xs overflow-hidden">
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
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-xl truncate max-w-[170px] font-kanit">
                    {headerConfig.name}
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu
                className={className}
                style={{ top: headerHeight || 0 }}
              >
                {group.items.map((item) =>
                  item.items ? (
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
                              <AdminBadge />
                            )}
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
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
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          {item.icon}
                          <span>{item.title}</span>
                          {showAdminBadge && isAdminOnlyItem(item) && (
                            <AdminBadge />
                          )}
                        </Link>
                      </SidebarMenuButton>
                      {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                          {badgeCounts[item.badgeKey]}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="mb-20">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="cursor-pointer border rounded-full"
                  tooltip={user?.email || ""}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getFileUrl(user?.profile?.avatar)}
                      alt="Profile"
                    />
                    <AvatarFallback />
                  </Avatar>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {user?.role ? USER_ROLE_LABELS[user.role] : ""}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <UserRoundPen />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Wallet />
                  <span>Wallet</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
