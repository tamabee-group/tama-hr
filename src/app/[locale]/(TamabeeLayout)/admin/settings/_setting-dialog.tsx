"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingApi } from "@/lib/apis/setting-api";
import { SettingResponse } from "@/types/setting";
import { PlanResponse, getPlanName, LocaleKey } from "@/types/plan";

interface SettingDialogProps {
  setting: SettingResponse | null;
  plans: PlanResponse[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SettingDialog({
  setting,
  plans,
  open,
  onOpenChange,
  onSuccess,
}: SettingDialogProps) {
  const t = useTranslations("tamabeeSettings");
  const locale = useLocale() as LocaleKey;
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset value khi setting thay đổi
  useEffect(() => {
    if (setting) {
      setValue(setting.settingValue);
    }
  }, [setting]);

  const handleSave = async () => {
    if (!setting) return;

    setSaving(true);
    try {
      await settingApi.update(setting.settingKey, { settingValue: value });
      toast.success(t("messages.updateSuccess"));
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error(t("messages.updateError"));
    } finally {
      setSaving(false);
    }
  };

  // Kiểm tra giá trị có thay đổi không
  const hasChanged = setting?.settingValue !== value;

  // Render input theo loại setting
  const renderInput = () => {
    if (!setting) return null;

    // Special case: DEFAULT_PLAN_ID - hiển thị dropdown plans
    if (setting.settingKey === "DEFAULT_PLAN_ID") {
      return (
        <Select value={value} onValueChange={setValue}>
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
      setting.valueType === "INTEGER" || setting.valueType === "DECIMAL"
        ? "number"
        : "text";

    return (
      <Input
        type={inputType}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {setting ? t(`keys.${setting.settingKey}`) : ""}
          </DialogTitle>
        </DialogHeader>

        {setting && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("table.value")}</Label>
              {renderInput()}
            </div>
            <p className="text-sm text-muted-foreground">
              {t(`descriptions.${setting.settingKey}`)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanged || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("dialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
