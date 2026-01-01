"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DeductionConfig, DeductionRule } from "@/types/attendance-config";
import { DEDUCTION_TYPES, DeductionType } from "@/types/attendance-enums";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { SortableItem } from "./_sortable-item";

interface DeductionConfigFormProps {
  config: DeductionConfig;
  onSaveSuccess: () => void;
  onChangesUpdate: (hasChanges: boolean) => void;
  setSaveHandler: (handler: () => Promise<void>) => void;
}

// Tạo deduction rule mặc định
const createDefaultDeduction = (order: number): DeductionRule => ({
  id: `new-${Date.now()}-${order}`,
  name: "",
  type: "FIXED",
  amount: 0,
  order,
});

export function DeductionConfigForm({
  config,
  onSaveSuccess,
  onChangesUpdate,
  setSaveHandler,
}: DeductionConfigFormProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Đảm bảo mỗi deduction có id duy nhất
  const initializeDeductions = (
    deductions: DeductionRule[],
  ): DeductionRule[] => {
    return deductions.map((d, i) => ({
      ...d,
      id: d.id || `deduction-${Date.now()}-${i}`,
      order: d.order ?? i,
    }));
  };

  const [formData, setFormData] = useState<DeductionConfig>(() => ({
    ...config,
    deductions: initializeDeductions(config.deductions || []),
  }));

  // Sensors cho drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Kiểm tra có thay đổi không
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(config);
  }, [formData, config]);

  // Cập nhật hasChanges lên parent
  useEffect(() => {
    onChangesUpdate(hasChanges);
  }, [hasChanges, onChangesUpdate]);

  // Hàm save để parent gọi
  const handleSave = useCallback(async () => {
    // Validate: kiểm tra name không được trống
    const hasEmptyFields = formData.deductions.some(
      (item) => !item.name.trim(),
    );
    if (hasEmptyFields) {
      toast.error(t("deduction.validationError"));
      return;
    }

    try {
      await companySettingsApi.updateDeductionConfig(formData);
      toast.success(tCommon("updateSuccess"));
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update deduction config:", error);
      toast.error(tCommon("updateError"));
    }
  }, [formData, t, tCommon, onSaveSuccess]);

  // Đăng ký save handler với parent
  useEffect(() => {
    setSaveHandler(handleSave);
  }, [handleSave, setSaveHandler]);

  // Cập nhật field chính của form
  const updateField = <K extends keyof DeductionConfig>(
    field: K,
    value: DeductionConfig[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Thêm deduction mới
  const addDeduction = () => {
    setFormData((prev) => ({
      ...prev,
      deductions: [
        ...prev.deductions,
        createDefaultDeduction(prev.deductions.length),
      ],
    }));
  };

  // Xóa deduction theo index
  const removeDeduction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index),
    }));
  };

  // Cập nhật field của deduction
  const updateDeduction = <K extends keyof DeductionRule>(
    index: number,
    field: K,
    value: DeductionRule[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  // Xử lý drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.deductions.findIndex((d) => d.id === active.id);
        const newIndex = prev.deductions.findIndex((d) => d.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const newDeductions = arrayMove(prev.deductions, oldIndex, newIndex);
        // Cập nhật order
        return {
          ...prev,
          deductions: newDeductions.map((d, i) => ({ ...d, order: i })),
        };
      });
    }
  };

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
      {/* Cột 1: Cấu hình phạt */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("deduction.penalties")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Phạt đi muộn */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-3 min-w-[180px]">
                <Switch
                  id="enableLatePenalty"
                  checked={formData.enableLatePenalty}
                  onCheckedChange={(checked) =>
                    updateField("enableLatePenalty", checked)
                  }
                />
                <Label htmlFor="enableLatePenalty" className="cursor-pointer">
                  {t("deduction.latePenalty")}
                </Label>
              </div>

              {formData.enableLatePenalty && (
                <InputGroup className="w-[160px]">
                  <InputGroupInput
                    type="number"
                    min={0}
                    value={formData.latePenaltyPerMinute}
                    onChange={(e) =>
                      updateField(
                        "latePenaltyPerMinute",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>¥/{tCommon("minutes")}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              )}
            </div>

            {/* Phạt về sớm */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-3 min-w-[180px]">
                <Switch
                  id="enableEarlyLeavePenalty"
                  checked={formData.enableEarlyLeavePenalty}
                  onCheckedChange={(checked) =>
                    updateField("enableEarlyLeavePenalty", checked)
                  }
                />
                <Label
                  htmlFor="enableEarlyLeavePenalty"
                  className="cursor-pointer"
                >
                  {t("deduction.earlyLeavePenalty")}
                </Label>
              </div>

              {formData.enableEarlyLeavePenalty && (
                <InputGroup className="w-[160px]">
                  <InputGroupInput
                    type="number"
                    min={0}
                    value={formData.earlyLeavePenaltyPerMinute}
                    onChange={(e) =>
                      updateField(
                        "earlyLeavePenaltyPerMinute",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>¥/{tCommon("minutes")}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              )}
            </div>

            {/* Trừ lương vắng mặt */}
            <div className="flex items-center gap-3">
              <Switch
                id="enableAbsenceDeduction"
                checked={formData.enableAbsenceDeduction}
                onCheckedChange={(checked) =>
                  updateField("enableAbsenceDeduction", checked)
                }
              />
              <Label
                htmlFor="enableAbsenceDeduction"
                className="cursor-pointer"
              >
                {t("deduction.absenceDeduction")}
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cột 2: Danh sách khấu trừ */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("deduction.rules")}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDeduction}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("deduction.addRule")}
            </Button>
          </CardHeader>
          <CardContent>
            {formData.deductions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("deduction.noRules")}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={formData.deductions.map(
                    (d) => d.id || `idx-${d.order}`,
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {formData.deductions.map((deduction, index) => (
                      <SortableItem
                        key={deduction.id || `idx-${index}`}
                        id={deduction.id || `idx-${index}`}
                        onRemove={() => removeDeduction(index)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Name */}
                          <Input
                            value={deduction.name}
                            onChange={(e) =>
                              updateDeduction(index, "name", e.target.value)
                            }
                            placeholder={t("deduction.namePlaceholder")}
                            className="flex-1"
                          />

                          {/* Type */}
                          <Select
                            value={deduction.type}
                            onValueChange={(value) =>
                              updateDeduction(
                                index,
                                "type",
                                value as DeductionType,
                              )
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DEDUCTION_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {tEnums(`deductionType.${type}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Amount or Percentage */}
                          <InputGroup className="w-[140px]">
                            <InputGroupInput
                              type="number"
                              min={0}
                              max={
                                deduction.type === "PERCENTAGE"
                                  ? 100
                                  : undefined
                              }
                              step={deduction.type === "PERCENTAGE" ? 0.01 : 1}
                              value={
                                deduction.type === "FIXED"
                                  ? deduction.amount || 0
                                  : deduction.percentage || 0
                              }
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (deduction.type === "FIXED") {
                                  updateDeduction(index, "amount", val);
                                } else {
                                  updateDeduction(index, "percentage", val);
                                }
                              }}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>
                                {deduction.type === "FIXED" ? "¥" : "%"}
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
