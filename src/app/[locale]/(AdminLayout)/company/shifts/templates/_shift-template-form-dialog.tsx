"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { ShiftTemplate, ShiftTemplateInput } from "@/types/attendance-records";

interface ShiftTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ShiftTemplate | null;
  onSubmit: (data: ShiftTemplateInput) => void;
  isSubmitting: boolean;
}

// Giá trị mặc định cho form
const defaultFormData: ShiftTemplateInput = {
  name: "",
  startTime: "09:00",
  endTime: "18:00",
  breakMinutes: 60,
  multiplier: 1,
  description: "",
  isActive: true,
};

// Helper function để tạo form data từ template
function getFormDataFromTemplate(
  template: ShiftTemplate | null,
): ShiftTemplateInput {
  if (!template) return defaultFormData;
  return {
    name: template.name,
    startTime: template.startTime.substring(0, 5),
    endTime: template.endTime.substring(0, 5),
    breakMinutes: template.breakMinutes,
    multiplier: template.multiplier,
    description: template.description || "",
    isActive: template.isActive,
  };
}

/**
 * Dialog form tạo/sửa mẫu ca làm việc
 * Form với name, start time, end time, break minutes, multiplier
 */
export function ShiftTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isSubmitting,
}: ShiftTemplateFormDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");

  // Sử dụng key để reset form khi template thay đổi
  const formKey = template?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {template ? t("editTemplate") : t("createTemplate")}
          </DialogTitle>
        </DialogHeader>

        <ShiftTemplateForm
          key={formKey}
          template={template}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          t={t}
          tCommon={tCommon}
        />
      </DialogContent>
    </Dialog>
  );
}

// Form component riêng để reset state khi key thay đổi
interface ShiftTemplateFormProps {
  template: ShiftTemplate | null;
  onSubmit: (data: ShiftTemplateInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}

function ShiftTemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting,
  t,
  tCommon,
}: ShiftTemplateFormProps) {
  const [formData, setFormData] = useState<ShiftTemplateInput>(() =>
    getFormDataFromTemplate(template),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  };

  return (
    <>
      <div className="space-y-4 py-4">
        {/* Tên ca */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("templateName")}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t("templateNamePlaceholder")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Giờ bắt đầu và kết thúc */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">{t("startTime")}</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className={errors.startTime ? "border-destructive" : ""}
            />
            {errors.startTime && (
              <p className="text-sm text-destructive">{errors.startTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">{t("endTime")}</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className={errors.endTime ? "border-destructive" : ""}
            />
            {errors.endTime && (
              <p className="text-sm text-destructive">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Thời gian nghỉ */}
        <div className="space-y-2">
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
            <p className="text-sm text-destructive">{errors.breakMinutes}</p>
          )}
        </div>

        {/* Hệ số lương */}
        <div className="space-y-2">
          <Label htmlFor="multiplier">{t("multiplier")}</Label>
          <Input
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
          {errors.multiplier && (
            <p className="text-sm text-destructive">{errors.multiplier}</p>
          )}
        </div>

        {/* Mô tả */}
        <div className="space-y-2">
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
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {tCommon("cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? tCommon("loading") : tCommon("save")}
        </Button>
      </DialogFooter>
    </>
  );
}
