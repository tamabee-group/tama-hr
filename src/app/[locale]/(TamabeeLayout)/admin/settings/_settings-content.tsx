"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingApi } from "@/lib/apis/setting-api";
import { planApi } from "@/lib/apis/plan-api";
import { SettingResponse } from "@/types/setting";
import { PlanResponse, getPlanName, LocaleKey } from "@/types/plan";
import { Loader2 } from "lucide-react";

// Nhóm settings theo category
const SETTING_GROUPS = {
  trial: ["FREE_TRIAL_MONTHS", "REFERRAL_BONUS_MONTHS", "DEFAULT_PLAN_ID"],
  referral: ["COMMISSION_AMOUNT"],
  banking: [
    "MIN_DEPOSIT_AMOUNT",
    "BANK_NAME",
    "BANK_ACCOUNT",
    "BANK_ACCOUNT_NAME",
  ],
};

export function SettingsContent() {
  const t = useTranslations("tamabeeSettings");
  const locale = useLocale() as LocaleKey;
  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Fetch settings và plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, plansData] = await Promise.all([
          settingApi.getAll(),
          planApi.getAll(0, 100),
        ]);
        setSettings(settingsData);
        setPlans(plansData.content);
        // Khởi tạo edit values
        const values: Record<string, string> = {};
        settingsData.forEach((s) => {
          values[s.settingKey] = s.settingValue;
        });
        setEditValues(values);
      } catch {
        toast.error(t("messages.updateError"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  // Xử lý thay đổi giá trị
  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  // Lưu setting
  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await settingApi.update(key, { settingValue: editValues[key] });
      toast.success(t("messages.updateSuccess"));
      // Cập nhật lại settings
      const updated = await settingApi.getAll();
      setSettings(updated);
    } catch {
      toast.error(t("messages.updateError"));
    } finally {
      setSaving(null);
    }
  };

  // Kiểm tra giá trị có thay đổi không
  const hasChanged = (key: string) => {
    const original = settings.find((s) => s.settingKey === key);
    return original?.settingValue !== editValues[key];
  };

  // Render input theo loại setting
  const renderInput = (setting: SettingResponse) => {
    const { settingKey, valueType } = setting;

    // Special case: DEFAULT_PLAN_ID - hiển thị dropdown plans
    if (settingKey === "DEFAULT_PLAN_ID") {
      return (
        <Select
          value={editValues[settingKey] || ""}
          onValueChange={(value) => handleChange(settingKey, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={String(plan.id)}>
                {getPlanName(plan, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Input type theo valueType
    const inputType =
      valueType === "INTEGER" || valueType === "DECIMAL" ? "number" : "text";

    return (
      <Input
        type={inputType}
        value={editValues[settingKey] || ""}
        onChange={(e) => handleChange(settingKey, e.target.value)}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(SETTING_GROUPS).map(([group, keys]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{t(`groups.${group}`)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keys.map((key) => {
              const setting = settings.find((s) => s.settingKey === key);
              if (!setting) return null;

              return (
                <div key={key} className="space-y-2">
                  <Label>{t(`keys.${key}`)}</Label>
                  <div className="flex gap-2">
                    {renderInput(setting)}
                    <Button
                      size="sm"
                      onClick={() => handleSave(key)}
                      disabled={!hasChanged(key) || saving === key}
                    >
                      {saving === key && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Lưu
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`descriptions.${key}`)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
