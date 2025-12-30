"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { settingApi } from "@/lib/apis/setting-api";
import {
  SettingResponse,
  SettingValueType,
  validateSettingValue,
} from "@/types/setting";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface SettingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: SettingResponse | null;
  onSuccess: () => void;
  locale?: SupportedLocale;
}

/**
 * Component form chỉnh sửa setting
 * - Dialog với input theo valueType
 * - Validation theo valueType (INTEGER, DECIMAL, STRING, BOOLEAN)
 */
export function SettingForm({
  open,
  onOpenChange,
  setting,
  onSuccess,
  locale = "vi",
}: SettingFormProps) {
  const [value, setValue] = useState("");
  const [boolValue, setBoolValue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Labels theo locale
  const labels = {
    vi: {
      title: "Chỉnh sửa cài đặt",
      description: "Cập nhật giá trị cho cài đặt hệ thống",
      settingKey: "Khóa cài đặt",
      settingValue: "Giá trị",
      valueType: "Loại giá trị",
      cancel: "Hủy",
      save: "Lưu",
      saving: "Đang lưu...",
      success: "Cập nhật cài đặt thành công",
      error: "Không thể cập nhật cài đặt",
      invalidInteger: "Giá trị phải là số nguyên",
      invalidDecimal: "Giá trị phải là số thập phân",
      invalidBoolean: "Giá trị phải là true hoặc false",
      required: "Giá trị không được để trống",
    },
    en: {
      title: "Edit Setting",
      description: "Update the value for system setting",
      settingKey: "Setting Key",
      settingValue: "Value",
      valueType: "Value Type",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      success: "Setting updated successfully",
      error: "Failed to update setting",
      invalidInteger: "Value must be an integer",
      invalidDecimal: "Value must be a decimal number",
      invalidBoolean: "Value must be true or false",
      required: "Value is required",
    },
    ja: {
      title: "設定を編集",
      description: "システム設定の値を更新します",
      settingKey: "設定キー",
      settingValue: "値",
      valueType: "値の型",
      cancel: "キャンセル",
      save: "保存",
      saving: "保存中...",
      success: "設定が正常に更新されました",
      error: "設定の更新に失敗しました",
      invalidInteger: "値は整数である必要があります",
      invalidDecimal: "値は小数である必要があります",
      invalidBoolean: "値はtrueまたはfalseである必要があります",
      required: "値は必須です",
    },
  };

  const t = labels[locale];

  // Load setting value khi mở dialog
  useEffect(() => {
    if (setting && open) {
      if (setting.valueType === "BOOLEAN") {
        setBoolValue(setting.settingValue.toLowerCase() === "true");
      } else {
        setValue(setting.settingValue);
      }
      setError(null);
    }
  }, [setting, open]);

  const getValidationError = (
    val: string,
    valueType: SettingValueType,
  ): string | null => {
    if (!val.trim()) return t.required;

    if (!validateSettingValue(val, valueType)) {
      switch (valueType) {
        case "INTEGER":
          return t.invalidInteger;
        case "DECIMAL":
          return t.invalidDecimal;
        case "BOOLEAN":
          return t.invalidBoolean;
        default:
          return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setting) return;

    const submitValue =
      setting.valueType === "BOOLEAN" ? String(boolValue) : value;

    // Validate
    const validationError = getValidationError(submitValue, setting.valueType);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Update theo settingKey thay vì id
      await settingApi.update(setting.settingKey, {
        settingValue: submitValue,
      });
      toast.success(t.success);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to update setting:", err);
      toast.error(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setValue("");
      setBoolValue(false);
      setError(null);
      onOpenChange(false);
    }
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (error && setting) {
      const validationError = getValidationError(newValue, setting.valueType);
      setError(validationError);
    }
  };

  // Render input theo valueType
  const renderInput = () => {
    if (!setting) return null;

    switch (setting.valueType) {
      case "BOOLEAN":
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor="settingValue">{t.settingValue}</Label>
            <Switch
              id="settingValue"
              checked={boolValue}
              onCheckedChange={setBoolValue}
              disabled={isSubmitting}
            />
          </div>
        );
      case "INTEGER":
        return (
          <div className="space-y-2">
            <Label htmlFor="settingValue">{t.settingValue}</Label>
            <Input
              id="settingValue"
              type="number"
              step="1"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={isSubmitting}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      case "DECIMAL":
        return (
          <div className="space-y-2">
            <Label htmlFor="settingValue">{t.settingValue}</Label>
            <Input
              id="settingValue"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={isSubmitting}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      case "STRING":
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="settingValue">{t.settingValue}</Label>
            <Input
              id="settingValue"
              type="text"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={isSubmitting}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Setting Key (read-only) */}
          <div className="space-y-2">
            <Label>{t.settingKey}</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-sm">
              {setting?.settingKey}
            </div>
          </div>

          {/* Value Type (read-only) */}
          <div className="space-y-2">
            <Label>{t.valueType}</Label>
            <div className="p-2 bg-muted rounded-md text-sm">
              {setting?.valueType}
            </div>
          </div>

          {/* Description */}
          {setting?.description && (
            <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
              {setting.description}
            </div>
          )}

          {/* Value Input */}
          {renderInput()}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
