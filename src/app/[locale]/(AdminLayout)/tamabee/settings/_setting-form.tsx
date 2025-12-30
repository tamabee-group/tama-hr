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
import { useTranslations } from "next-intl";

interface SettingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: SettingResponse | null;
  onSuccess: () => void;
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
}: SettingFormProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const [value, setValue] = useState("");
  const [boolValue, setBoolValue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!val.trim()) return t("validation.required");

    if (!validateSettingValue(val, valueType)) {
      switch (valueType) {
        case "INTEGER":
          return t("validation.invalidInteger");
        case "DECIMAL":
          return t("validation.invalidDecimal");
        case "BOOLEAN":
          return t("validation.invalidBoolean");
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
      toast.success(t("messages.updateSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to update setting:", err);
      toast.error(t("messages.updateError"));
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
            <Label htmlFor="settingValue">{t("form.settingValue")}</Label>
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
            <Label htmlFor="settingValue">{t("form.settingValue")}</Label>
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
            <Label htmlFor="settingValue">{t("form.settingValue")}</Label>
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
            <Label htmlFor="settingValue">{t("form.settingValue")}</Label>
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
          <DialogTitle>{t("form.title")}</DialogTitle>
          <DialogDescription>{t("form.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Setting Key (read-only) */}
          <div className="space-y-2">
            <Label>{t("form.settingKey")}</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-sm">
              {setting?.settingKey}
            </div>
          </div>

          {/* Value Type (read-only) */}
          <div className="space-y-2">
            <Label>{t("form.valueType")}</Label>
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? tCommon("loading") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
