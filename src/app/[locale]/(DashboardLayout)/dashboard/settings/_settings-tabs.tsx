"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  GlassNav,
  GlassNavItem,
  GlassTabs,
  GlassTabItem,
} from "@/app/[locale]/_components/_glass-style";
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
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import {
  CompanySettings,
  BreakConfig,
  AttendanceLocation,
} from "@/types/attendance-config";
import {
  attendanceLocationApi,
  CreateAttendanceLocationRequest,
  UpdateAttendanceLocationRequest,
} from "@/lib/apis/attendance-location-api";
import { toast } from "sonner";
import { AttendanceConfigForm } from "./_attendance-config-form";
import { PayrollConfigForm } from "./_payroll-config-form";
import { OvertimeConfigForm } from "./_overtime-config-form";
import { SalaryItemTemplateConfig } from "./_salary-item-template-config";
import { ConfigurationSummaryCard } from "./_configuration-summary-card";
import { LocationManagementSection } from "./_location-management-section";
import { LocationDialog } from "./_location-dialog";
import { Clock, Wallet, Timer, Gift, LucideIcon, Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ExplanationPanel } from "../../../_components/_explanation-panel";

type TabKey = "attendance" | "payroll" | "overtime" | "allowanceDeduction";

const STORAGE_KEY = "company-settings-tab";
const VALID_TABS: TabKey[] = [
  "attendance",
  "payroll",
  "overtime",
  "allowanceDeduction",
];

interface TabItem {
  key: TabKey;
  icon: LucideIcon;
}

const TAB_ITEMS: TabItem[] = [
  { key: "attendance", icon: Clock },
  { key: "payroll", icon: Wallet },
  { key: "overtime", icon: Timer },
  { key: "allowanceDeduction", icon: Gift },
];

/**
 * Tạo nav items cho GlassNav từ TAB_ITEMS
 */
function createNavItems(t: ReturnType<typeof useTranslations>): GlassNavItem[] {
  return TAB_ITEMS.map((item) => ({
    key: item.key,
    label: t(`tabs.${item.key}`),
    icon: item.icon,
  }));
}

/**
 * Tạo tab items cho GlassTabs (mobile)
 */
function createTabItems(t: ReturnType<typeof useTranslations>): GlassTabItem[] {
  return TAB_ITEMS.map((item) => ({
    value: item.key,
    label: t(`tabs.${item.key}`),
    icon: <item.icon className="h-4 w-4" />,
  }));
}

/**
 * Cấu hình explanation panel cho mỗi tab
 */
interface TabExplanation {
  titleKey: string;
  descKey: string;
  tipsKeys?: string[];
}

const TAB_EXPLANATIONS: Record<TabKey, TabExplanation> = {
  attendance: {
    titleKey: "explanations.attendanceTitle",
    descKey: "explanations.attendanceDesc",
    tipsKeys: ["explanations.attendanceTip1", "explanations.attendanceTip2"],
  },
  payroll: {
    titleKey: "explanations.payrollTitle",
    descKey: "explanations.payrollDesc",
    tipsKeys: ["explanations.payrollTip1", "explanations.payrollTip2"],
  },
  overtime: {
    titleKey: "explanations.overtimeTitle",
    descKey: "explanations.overtimeDesc",
    tipsKeys: ["explanations.overtimeTip1", "explanations.overtimeTip2"],
  },
  allowanceDeduction: {
    titleKey: "explanations.allowanceDeductionTitle",
    descKey: "explanations.allowanceDeductionDesc",
  },
};

/**
 * Tạo default break config khi API chưa trả về
 */
function getDefaultBreakConfig(): BreakConfig {
  return {
    breakEnabled: true,
    defaultBreakMinutes: 60,
    maxBreaksPerDay: 3,
  };
}

// Interface cho form ref
export interface SettingsFormRef {
  hasChanges: () => boolean;
  save: () => Promise<void>;
}

/**
 * Component tabs cho cấu hình công ty
 * Layout: Sidebar trái (240px) + Content phải
 * Mobile: GlassTabs horizontal
 */
export function SettingsTabs() {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("attendance");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // State cho locations
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<AttendanceLocation | null>(null);

  // Ref để gọi save từ form con
  const formSaveRef = useRef<(() => Promise<void>) | null>(null);

  // Đọc tab từ URL hoặc localStorage khi mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabKey | null;
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      localStorage.setItem(STORAGE_KEY, tabFromUrl);
    } else {
      const savedTab = localStorage.getItem(STORAGE_KEY) as TabKey | null;
      if (savedTab && VALID_TABS.includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, [searchParams]);

  // Xử lý chuyển tab
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY, tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const settingsData = await companySettingsApi.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [tCommon]);

  // Tải danh sách vị trí chấm công
  const loadLocations = useCallback(async () => {
    try {
      const data = await attendanceLocationApi.getLocations(0, 100);
      setLocations(data.content);
    } catch (error) {
      console.error("Failed to load locations:", error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadLocations();
  }, [loadSettings, loadLocations]);

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

  // Xử lý tạo/cập nhật location
  const handleLocationSubmit = async (
    data: CreateAttendanceLocationRequest | UpdateAttendanceLocationRequest,
  ) => {
    if (editingLocation) {
      await attendanceLocationApi.updateLocation(editingLocation.id, data);
      toast.success(tCommon("updateSuccess"));
    } else {
      await attendanceLocationApi.createLocation(
        data as CreateAttendanceLocationRequest,
      );
      toast.success(tCommon("createSuccess"));
    }
    setLocationDialogOpen(false);
    setEditingLocation(null);
    loadLocations();
  };

  // Mở dialog thêm location mới
  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationDialogOpen(true);
  };

  // Mở dialog sửa location
  const handleEditLocation = (location: AttendanceLocation) => {
    setEditingLocation(location);
    setLocationDialogOpen(true);
  };

  const renderExplanationPanel = () => {
    const explanation = TAB_EXPLANATIONS[activeTab];
    if (!explanation) return null;

    const tips = explanation.tipsKeys?.map((key) => t(key));

    return (
      <ExplanationPanel
        title={t(explanation.titleKey)}
        description={t(explanation.descKey)}
        tips={tips}
        defaultCollapsed={true}
        className="mb-6"
      />
    );
  };

  if (isLoading && hasChanges) {
    return <SettingsTabsSkeleton />;
  }

  if (!settings) {
    return <Spinner type="triangle" />;
  }

  return (
    <div className="min-h-screen">
      {/* Header với glass effect */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <Button
            onClick={handleSaveClick}
            disabled={isSaving || !hasChanges}
            className="gap-2"
          >
            {isSaving ? <Spinner /> : <Save className="h-4 w-4" />}
            {tCommon("save")}
          </Button>
        </div>
      </div>

      {/* Mobile: GlassTabs */}
      <div className="lg:hidden py-4">
        <GlassTabs
          tabs={createTabItems(t)}
          value={activeTab}
          onChange={(value) => handleTabChange(value as TabKey)}
        />
      </div>

      {/* Main layout: Content + Sidebar */}
      <div className="flex gap-8 py-6">
        {/* Content area */}
        <main className="flex-1 min-w-0">
          {renderExplanationPanel()}

          {activeTab === "attendance" && (
            <>
              <AttendanceConfigForm
                config={settings.attendanceConfig}
                breakConfig={settings.breakConfig || getDefaultBreakConfig()}
                onSaveSuccess={handleSaveSuccess}
                onChangesUpdate={setHasChanges}
                setSaveHandler={(handler) => {
                  formSaveRef.current = handler;
                }}
              />
              <div className="mt-6 space-y-6">
                <LocationManagementSection
                  locations={locations}
                  onRefresh={loadLocations}
                  onEdit={handleEditLocation}
                  onAdd={handleAddLocation}
                />
              </div>
            </>
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
          {activeTab === "allowanceDeduction" && (
            <SalaryItemTemplateConfig
              onSaveSuccess={handleSaveSuccess}
              onChangesUpdate={setHasChanges}
              setSaveHandler={(handler) => {
                formSaveRef.current = handler;
              }}
            />
          )}
        </main>

        {/* Sidebar - Desktop only (bên phải) */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24 space-y-4">
            {/* Navigation */}
            <GlassNav
              items={createNavItems(t)}
              activeKey={activeTab}
              onSelect={(key: string) => handleTabChange(key as TabKey)}
            />

            {/* Summary Card */}
            <ConfigurationSummaryCard settings={settings} />
          </div>
        </aside>
      </div>

      {/* Dialog tạo/sửa vị trí chấm công */}
      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        location={editingLocation}
        onSubmit={handleLocationSubmit}
      />

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
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/80 border-b">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Mobile tabs skeleton */}
      <div className="lg:hidden py-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>

      <div className="flex gap-8 py-6">
        {/* Content skeleton */}
        <main className="flex-1 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </main>

        {/* Sidebar skeleton (bên phải) */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
