"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  CalendarDays,
  ArrowLeftRight,
  LucideIcon,
} from "lucide-react";
import { ShiftTemplateList } from "./templates/_shift-template-list";
import { ShiftAssignmentList } from "./assignments/_shift-assignment-list";
import { SwapRequestList } from "./swaps/_swap-request-list";

type TabKey = "templates" | "assignments" | "swaps";

interface TabItem {
  key: TabKey;
  icon: LucideIcon;
  titleKey: string;
}

interface ShiftsTabsProps {
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakMinutes: number;
}

const ALL_TAB_ITEMS: TabItem[] = [
  { key: "templates", icon: LayoutTemplate, titleKey: "templatesTitle" },
  { key: "assignments", icon: CalendarDays, titleKey: "assignmentsTitle" },
  { key: "swaps", icon: ArrowLeftRight, titleKey: "swapsTitle" },
];

const STORAGE_KEY = "shifts-active-tab";

/**
 * Component tabs cho quản lý ca làm việc
 * - Mobile: Horizontal scroll tabs
 * - Desktop: Content trái + Sidebar phải
 */
export function ShiftsTabs({
  defaultStartTime,
  defaultEndTime,
  defaultBreakMinutes,
}: ShiftsTabsProps) {
  const t = useTranslations("shifts");

  // Hiển thị tất cả tabs
  const visibleTabs = ALL_TAB_ITEMS;

  // Load active tab từ localStorage
  const getInitialTab = (): TabKey => {
    if (typeof window === "undefined") return "templates";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "templates" || saved === "assignments" || saved === "swaps") {
      return saved;
    }
    return "templates";
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);

  // Lưu vào localStorage khi thay đổi tab
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY, tab);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* Mobile & Tablet: Horizontal scroll tabs */}
      <div className="lg:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-3">
            {visibleTabs.map((item) => (
              <Button
                key={item.key}
                variant={activeTab === item.key ? "default" : "outline"}
                size="sm"
                className={cn(
                  "shrink-0 gap-2",
                  activeTab === item.key && "shadow-sm",
                )}
                onClick={() => handleTabChange(item.key)}
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
          {activeTab === "templates" && (
            <ShiftTemplateList
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              defaultBreakMinutes={defaultBreakMinutes}
            />
          )}
          {activeTab === "assignments" && <ShiftAssignmentList />}
          {activeTab === "swaps" && <SwapRequestList />}
        </div>

        {/* Desktop: Sidebar navigation - bên phải */}
        <Card className="py-2 hidden lg:block min-w-48 max-w-58 shrink-0 h-fit sticky top-[66px]">
          <CardContent className="p-3">
            <nav className="flex flex-col gap-1">
              {visibleTabs.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start gap-3 h-10",
                    activeTab === item.key &&
                      "bg-primary/10 text-primary font-medium",
                  )}
                  onClick={() => handleTabChange(item.key)}
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
