"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { settingApi } from "@/lib/apis/setting-api";
import { planApi } from "@/lib/apis/plan-api";
import { SettingResponse } from "@/types/setting";
import { PlanResponse } from "@/types/plan";
import { SettingsTable } from "./_settings-table";
import { SettingDialog } from "./_setting-dialog";

export function SettingsContent() {
  const t = useTranslations("tamabeeSettings");
  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetting, setSelectedSetting] =
    useState<SettingResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch settings và plans
  const fetchData = useCallback(async () => {
    try {
      const [settingsData, plansData] = await Promise.all([
        settingApi.getAll(),
        planApi.getAll(0, 100),
      ]);
      setSettings(settingsData);
      setPlans(plansData.content);
    } catch {
      toast.error(t("messages.updateError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xử lý click row
  const handleRowClick = (setting: SettingResponse) => {
    setSelectedSetting(setting);
    setDialogOpen(true);
  };

  // Xử lý save thành công
  const handleSuccess = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SettingsTable
        settings={settings}
        plans={plans}
        onRowClick={handleRowClick}
      />
      <SettingDialog
        setting={selectedSetting}
        plans={plans}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
