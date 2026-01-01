"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { CompanySettings, BreakConfig } from "@/types/attendance-config";
import { toast } from "sonner";
import { AttendanceConfigForm } from "./_attendance-config-form";
import { PayrollConfigForm } from "./_payroll-config-form";
import { OvertimeConfigForm } from "./_overtime-config-form";
import { AllowanceConfigForm } from "./_allowance-config-form";
import { DeductionConfigForm } from "./_deduction-config-form";
import {
  Clock,
  Wallet,
  Timer,
  Gift,
  MinusCircle,
  LucideIcon,
  Loader2,
  Save,
} from "lucide-react";

type TabKey = "attendance" | "payroll" | "overtime" | "allowance" | "deduction";

interface TabItem {
  key: TabKey;
  icon: LucideIcon;
}

const TAB_ITEMS: TabItem[] = [
  { key: "attendance", icon: Clock },
  { key: "payroll", icon: Wallet },
  { key: "overtime", icon: Timer },
  { key: "allowance", icon: Gift },
  { key: "deduction", icon: MinusCircle },
];

/**
 * Tạo default break config khi API chưa trả về
 */
function getDefaultBreakConfig(): BreakConfig {
  return {
    breakEnabled: true,
    breakType: "UNPAID",
    defaultBreakMinutes: 60,
    minimumBreakMinutes: 45,
    maximumBreakMinutes: 90,
    useLegalMinimum: true,
    breakTrackingEnabled: true,
    locale: "ja",
    fixedBreakMode: false,
    breakPeriodsPerAttendance: 1,
    fixedBreakPeriods: [],
    maxBreaksPerDay: 3,
    nightShiftStartTime: "22:00",
    nightShiftEndTime: "05:00",
    nightShiftMinimumBreakMinutes: 60,
    nightShiftDefaultBreakMinutes: 60,
  };
}

// Interface cho form ref
export interface SettingsFormRef {
  hasChanges: () => boolean;
  save: () => Promise<void>;
}

/**
 * Component tabs cho cấu hình công ty
 * - Mobile: Horizontal scroll tabs
 * - Tablet: 2 columns grid navigation
 * - Desktop: Content trái + Sidebar phải
 */
export function SettingsTabs() {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("attendance");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Ref để gọi save từ form con
  const formSaveRef = useRef<(() => Promise<void>) | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await companySettingsApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSuccess = () => {
    setHasChanges(false);
    loadSettings();
  };

  const handleSaveClick = () => {
    if (!hasChanges) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    if (formSaveRef.current) {
      setIsSaving(true);
      try {
        await formSaveRef.current();
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return <SettingsTabsSkeleton />;
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {tCommon("errorLoading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: Title + Save button - sticky ngay dưới header chính */}
      <div className="sticky top-[50px] z-10 -mx-4 px-4 py-3 bg-background border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={handleSaveClick} disabled={isSaving || !hasChanges}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save />
          )}
          {tCommon("save")}
        </Button>
      </div>

      {/* Mobile & Tablet: Horizontal scroll tabs */}
      <div className="md:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-3">
            {TAB_ITEMS.map((item) => (
              <Button
                key={item.key}
                variant={activeTab === item.key ? "default" : "outline"}
                size="sm"
                className={cn(
                  "shrink-0 gap-2",
                  activeTab === item.key && "shadow-sm",
                )}
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t(`tabs.${item.key}`)}
                </span>
                <span className="sm:hidden">{t(`tabs.${item.key}`)}</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: Content + Sidebar layout */}
      <div className="flex gap-6">
        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeTab === "attendance" && (
            <AttendanceConfigForm
              config={settings.attendanceConfig}
              breakConfig={settings.breakConfig || getDefaultBreakConfig()}
              onSaveSuccess={handleSaveSuccess}
              onChangesUpdate={setHasChanges}
              setSaveHandler={(handler) => {
                formSaveRef.current = handler;
              }}
            />
          )}
          {activeTab === "payroll" && (
            <PayrollConfigForm
              config={settings.payrollConfig}
              onSaveSuccess={handleSaveSuccess}
              onChangesUpdate={setHasChanges}
              setSaveHandler={(handler) => {
                formSaveRef.current = handler;
              }}
            />
          )}
          {activeTab === "overtime" && (
            <OvertimeConfigForm
              config={settings.overtimeConfig}
              onSaveSuccess={handleSaveSuccess}
              onChangesUpdate={setHasChanges}
              setSaveHandler={(handler) => {
                formSaveRef.current = handler;
              }}
            />
          )}
          {activeTab === "allowance" && (
            <AllowanceConfigForm
              config={settings.allowanceConfig}
              onSaveSuccess={handleSaveSuccess}
              onChangesUpdate={setHasChanges}
              setSaveHandler={(handler) => {
                formSaveRef.current = handler;
              }}
            />
          )}
          {activeTab === "deduction" && (
            <DeductionConfigForm
              config={settings.deductionConfig}
              onSaveSuccess={handleSaveSuccess}
              onChangesUpdate={setHasChanges}
              setSaveHandler={(handler) => {
                formSaveRef.current = handler;
              }}
            />
          )}
        </div>

        {/* Desktop: Sidebar navigation - bên phải, sticky dưới title */}
        <Card className="hidden md:block w-56 shrink-0 h-fit sticky top-[120px]">
          <CardContent className="p-3">
            <nav className="flex flex-col gap-1">
              {TAB_ITEMS.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start gap-3 h-10",
                    activeTab === item.key &&
                      "bg-primary/10 text-primary font-medium",
                  )}
                  onClick={() => setActiveTab(item.key)}
                >
                  <item.icon className="h-4 w-4" />
                  {t(`tabs.${item.key}`)}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Dialog xác nhận */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmSave.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmSave.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SettingsTabsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Mobile tabs skeleton */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0" />
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Content skeleton */}
        <div className="flex-1 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>

        {/* Desktop sidebar skeleton */}
        <div className="hidden md:block w-56 shrink-0">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
