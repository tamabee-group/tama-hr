"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  CalendarDays,
  ArrowLeftRight,
  Calendar,
  LucideIcon,
} from "lucide-react";
import { ShiftTemplateList } from "./templates/_shift-template-list";
import { ShiftAssignmentList } from "./assignments/_shift-assignment-list";
import { SwapRequestList } from "./swaps/_swap-request-list";
import { ScheduleTable } from "../schedules/_schedule-table";
import { useWorkMode } from "@/hooks/use-work-mode";
import { getHiddenTabsForUrl } from "@/lib/utils/sidebar-work-mode-filter";

type TabKey = "schedules" | "templates" | "assignments" | "swaps";

interface TabItem {
  key: TabKey;
  icon: LucideIcon;
  titleKey: string;
}

const ALL_TAB_ITEMS: TabItem[] = [
  { key: "schedules", icon: Calendar, titleKey: "schedulesTitle" },
  { key: "templates", icon: LayoutTemplate, titleKey: "templatesTitle" },
  { key: "assignments", icon: CalendarDays, titleKey: "assignmentsTitle" },
  { key: "swaps", icon: ArrowLeftRight, titleKey: "swapsTitle" },
];

/**
 * Component tabs cho quản lý ca làm việc
 * - Mobile: Horizontal scroll tabs
 * - Desktop: Content trái + Sidebar phải
 * - Tự động ẩn tabs dựa trên work mode
 */
export function ShiftsTabs() {
  const t = useTranslations("shifts");
  const { workMode, loading } = useWorkMode();

  // Lấy danh sách tabs cần ẩn dựa trên work mode
  const hiddenTabs = workMode
    ? getHiddenTabsForUrl("/company/shifts", workMode)
    : [];

  // Filter tabs dựa trên work mode
  const visibleTabs = ALL_TAB_ITEMS.filter(
    (tab) => !hiddenTabs.includes(tab.key),
  );

  // Default tab là tab đầu tiên trong danh sách visible
  const defaultTab = visibleTabs[0]?.key || "assignments";
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // Nếu tab hiện tại bị ẩn, chuyển sang tab đầu tiên visible
  const currentTab = hiddenTabs.includes(activeTab) ? defaultTab : activeTab;

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-64" />
          <Skeleton className="hidden md:block w-48 h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* Mobile & Tablet: Horizontal scroll tabs */}
      <div className="md:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-3">
            {visibleTabs.map((item) => (
              <Button
                key={item.key}
                variant={currentTab === item.key ? "default" : "outline"}
                size="sm"
                className={cn(
                  "shrink-0 gap-2",
                  currentTab === item.key && "shadow-sm",
                )}
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon className="h-4 w-4" />
                {t(item.titleKey)}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: Content + Sidebar layout */}
      <div className="flex gap-4">
        {/* Content area */}
        <div className="flex-1 min-w-0">
          {currentTab === "schedules" && <ScheduleTable />}
          {currentTab === "templates" && <ShiftTemplateList />}
          {currentTab === "assignments" && <ShiftAssignmentList />}
          {currentTab === "swaps" && <SwapRequestList />}
        </div>

        {/* Desktop: Sidebar navigation - bên phải */}
        <Card className="hidden md:block w-48 shrink-0 h-fit sticky top-[66px]">
          <CardContent className="p-3">
            <nav className="flex flex-col gap-1">
              {visibleTabs.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start gap-3 h-10",
                    currentTab === item.key &&
                      "bg-primary/10 text-primary font-medium",
                  )}
                  onClick={() => setActiveTab(item.key)}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.titleKey)}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
