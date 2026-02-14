"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { formatTime } from "@/lib/utils/format-date-time";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { ShiftTemplate, ShiftTemplateInput } from "@/types/attendance-records";
import { X } from "lucide-react";

// Danh sách key tên ca mặc định
const SHIFT_NAME_PRESET_KEYS = [
  "morning",
  "noon",
  "afternoon",
  "evening",
  "night",
  "fullDay",
];

// Giá trị đặc biệt cho "Khác"
const OTHER_VALUE = "__OTHER__";

interface ShiftTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ShiftTemplate | null;
  onSubmit: (data: ShiftTemplateInput) => void;
  isSubmitting: boolean;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakMinutes: number;
}

// Helper function để tạo form data từ template hoặc settings
function getFormDataFromTemplate(
  template: ShiftTemplate | null,
  defaultStartTime: string,
  defaultEndTime: string,
  defaultBreakMinutes: number,
): ShiftTemplateInput {
  if (template) {
    return {
      name: template.name,
      startTime: formatTime(template.startTime, "--:--"),
      endTime: formatTime(template.endTime, "--:--"),
      breakMinutes: template.breakMinutes,
      multiplier: template.multiplier,
      description: template.description || "",
      isActive: template.isActive,
    };
  }

  // Giá trị mặc định từ settings (truyền từ page)
  return {
    name: "",
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    breakMinutes: defaultBreakMinutes,
    multiplier: 1,
    description: "",
    isActive: true,
  };
}

/**
 * Dialog form tạo/sửa mẫu ca làm việc
 * Lấy giá trị mặc định từ company settings (truyền từ page)
 */
export function ShiftTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isSubmitting,
  defaultStartTime,
  defaultEndTime,
  defaultBreakMinutes,
}: ShiftTemplateFormDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const quickSelectLabel = tCommon("quickSelect");

  // Tạo danh sách preset names từ translations
  const shiftNamePresets = SHIFT_NAME_PRESET_KEYS.map((key) => ({
    key,
    label: t(`shiftNames.${key}`),
  }));

  const [formData, setFormData] = useState<ShiftTemplateInput>(() =>
    getFormDataFromTemplate(
      template,
      defaultStartTime,
      defaultEndTime,
      defaultBreakMinutes,
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomName, setIsCustomName] = useState(false);
  const [showOvernightConfirm, setShowOvernightConfirm] = useState(false);

  // Kiểm tra ca qua đêm (endTime < startTime)
  const isOvernightShift = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    return end < start;
  };

  // Kiểm tra xem tên có trong danh sách preset không
  const isPresetName = (name: string) =>
    shiftNamePresets.some((preset) => preset.label === name);

  // Reset form khi template thay đổi
  useEffect(() => {
    const newFormData = getFormDataFromTemplate(
      template,
      defaultStartTime,
      defaultEndTime,
      defaultBreakMinutes,
    );
    setFormData(newFormData);
    // Kiểm tra xem tên có trong danh sách preset không
    setIsCustomName(newFormData.name !== "" && !isPresetName(newFormData.name));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, open, defaultStartTime, defaultEndTime, defaultBreakMinutes]);

  // Xử lý thay đổi field
  const handleChange = (
    field: keyof ShiftTemplateInput,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = tCommon("checkInfo");
    }
    if (!formData.startTime) {
      newErrors.startTime = tCommon("checkInfo");
    }
    if (!formData.endTime) {
      newErrors.endTime = tCommon("checkInfo");
    }
    if (formData.breakMinutes < 0) {
      newErrors.breakMinutes = tCommon("checkInfo");
    }
    if (formData.multiplier <= 0) {
      newErrors.multiplier = tCommon("checkInfo");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit
  const handleSubmit = () => {
    if (!validate()) return;

    // Kiểm tra ca qua đêm
    if (isOvernightShift(formData.startTime, formData.endTime)) {
      setShowOvernightConfirm(true);
      return;
    }

    performSubmit();
  };

  // Thực hiện submit
  const performSubmit = () => {
    // Format time to HH:mm:ss
    const data: ShiftTemplateInput = {
      ...formData,
      startTime:
        formData.startTime.length === 5
          ? `${formData.startTime}:00`
          : formData.startTime,
      endTime:
        formData.endTime.length === 5
          ? `${formData.endTime}:00`
          : formData.endTime,
    };

    onSubmit(data);
    setShowOvernightConfirm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-primary pb-2">
          <DialogTitle>
            {template ? t("editTemplate") : t("createTemplate")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {template ? t("editTemplate") : t("createTemplate")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Tên ca */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("templateName")}</Label>
            <Select
              value={isCustomName ? OTHER_VALUE : formData.name}
              onValueChange={(value) => {
                if (value === OTHER_VALUE) {
                  setIsCustomName(true);
                  handleChange("name", "");
                } else {
                  setIsCustomName(false);
                  handleChange("name", value);
                }
              }}
            >
              <SelectTrigger
                id="name"
                className={errors.name ? "border-destructive" : ""}
              >
                <SelectValue placeholder={t("templateNamePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {shiftNamePresets.map((preset) => (
                  <SelectItem key={preset.key} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value={OTHER_VALUE}>{tCommon("other")}</SelectItem>
              </SelectContent>
            </Select>
            {isCustomName && (
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("templateNamePlaceholder")}
                className={errors.name ? "border-destructive" : ""}
              />
            )}
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Giờ bắt đầu và kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">{t("startTime")}</Label>
              <TimePicker
                id="startTime"
                value={formData.startTime}
                onChange={(value) => handleChange("startTime", value)}
                quickSelectLabel={quickSelectLabel}
                className={errors.startTime ? "border-destructive" : ""}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endTime">{t("endTime")}</Label>
              <TimePicker
                id="endTime"
                value={formData.endTime}
                onChange={(value) => handleChange("endTime", value)}
                quickSelectLabel={quickSelectLabel}
                className={errors.endTime ? "border-destructive" : ""}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Thời gian nghỉ */}
            <div>
              <Label htmlFor="breakMinutes">{t("breakMinutes")}</Label>
              <InputGroup>
                <InputGroupInput
                  id="breakMinutes"
                  type="number"
                  min={0}
                  value={formData.breakMinutes}
                  onChange={(e) =>
                    handleChange("breakMinutes", parseInt(e.target.value) || 0)
                  }
                  className={errors.breakMinutes ? "border-destructive" : ""}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{tCommon("minutes")}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.breakMinutes && (
                <p className="text-sm text-destructive">
                  {errors.breakMinutes}
                </p>
              )}
            </div>

            {/* Hệ số lương */}
            <div>
              <Label htmlFor="multiplier">{t("multiplier")}</Label>
              <InputGroup>
                <InputGroupInput
                  id="multiplier"
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={formData.multiplier}
                  onChange={(e) =>
                    handleChange("multiplier", parseFloat(e.target.value) || 1)
                  }
                  className={errors.multiplier ? "border-destructive" : ""}
                />
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <X />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.multiplier && (
                <p className="text-sm text-destructive">{errors.multiplier}</p>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <Label htmlFor="description">{tCommon("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
            />
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {tCommon("active")}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? tCommon("loading") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Alert xác nhận ca qua đêm */}
      <AlertDialog
        open={showOvernightConfirm}
        onOpenChange={setShowOvernightConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("overnightShift.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("overnightShift.description", {
                startTime: formData.startTime,
                endTime: formData.endTime,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={performSubmit}>
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
