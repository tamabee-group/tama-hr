"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AllowanceConfig, AllowanceRule } from "@/types/attendance-config";
import { ALLOWANCE_TYPES, AllowanceType } from "@/types/attendance-enums";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { SortableItem } from "./_sortable-item";

interface AllowanceConfigFormProps {
  config: AllowanceConfig;
  onSaveSuccess: () => void;
  onChangesUpdate: (hasChanges: boolean) => void;
  setSaveHandler: (handler: () => Promise<void>) => void;
}

// Tạo allowance rule mặc định
const createDefaultAllowance = (order: number): AllowanceRule => ({
  id: `new-${Date.now()}-${order}`,
  name: "",
  type: "FIXED",
  amount: 0,
  taxable: true,
  order,
});

export function AllowanceConfigForm({
  config,
  onSaveSuccess,
  onChangesUpdate,
  setSaveHandler,
}: AllowanceConfigFormProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Đảm bảo mỗi allowance có id duy nhất
  const initializeAllowances = (
    allowances: AllowanceRule[],
  ): AllowanceRule[] => {
    return allowances.map((a, i) => ({
      ...a,
      id: a.id || `allowance-${Date.now()}-${i}`,
      order: a.order ?? i,
    }));
  };

  const [allowances, setAllowances] = useState<AllowanceRule[]>(() =>
    initializeAllowances(config.allowances || []),
  );

  // Sensors cho drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Kiểm tra có thay đổi không
  const hasChanges = useMemo(() => {
    return JSON.stringify({ allowances }) !== JSON.stringify(config);
  }, [allowances, config]);

  // Cập nhật hasChanges lên parent
  useEffect(() => {
    onChangesUpdate(hasChanges);
  }, [hasChanges, onChangesUpdate]);

  // Hàm save để parent gọi
  const handleSave = useCallback(async () => {
    // Validate: kiểm tra name không được trống
    const hasEmptyFields = allowances.some((item) => !item.name.trim());
    if (hasEmptyFields) {
      toast.error(t("allowance.validationError"));
      return;
    }

    try {
      await companySettingsApi.updateAllowanceConfig({ allowances });
      toast.success(tCommon("updateSuccess"));
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update allowance config:", error);
      toast.error(tCommon("updateError"));
    }
  }, [allowances, t, tCommon, onSaveSuccess]);

  // Đăng ký save handler với parent
  useEffect(() => {
    setSaveHandler(handleSave);
  }, [handleSave, setSaveHandler]);

  // Thêm allowance mới
  const addAllowance = () => {
    setAllowances((prev) => [...prev, createDefaultAllowance(prev.length)]);
  };

  // Xóa allowance theo index
  const removeAllowance = (index: number) => {
    setAllowances((prev) => prev.filter((_, i) => i !== index));
  };

  // Cập nhật field của allowance
  const updateAllowance = <K extends keyof AllowanceRule>(
    index: number,
    field: K,
    value: AllowanceRule[K],
  ) => {
    setAllowances((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // Xử lý drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAllowances((prev) => {
        const oldIndex = prev.findIndex((a) => a.id === active.id);
        const newIndex = prev.findIndex((a) => a.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const newAllowances = arrayMove(prev, oldIndex, newIndex);
        // Cập nhật order
        return newAllowances.map((a, i) => ({ ...a, order: i }));
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("allowance.title")}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAllowance}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("allowance.addRule")}
          </Button>
        </CardHeader>
        <CardContent>
          {allowances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("allowance.noRules")}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={allowances.map((a) => a.id || `idx-${a.order}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {allowances.map((allowance, index) => (
                    <SortableItem
                      key={allowance.id || `idx-${index}`}
                      id={allowance.id || `idx-${index}`}
                      onRemove={() => removeAllowance(index)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Name */}
                        <Input
                          value={allowance.name}
                          onChange={(e) =>
                            updateAllowance(index, "name", e.target.value)
                          }
                          placeholder={t("allowance.namePlaceholder")}
                          className="flex-1"
                        />

                        {/* Type */}
                        <Select
                          value={allowance.type}
                          onValueChange={(value) =>
                            updateAllowance(
                              index,
                              "type",
                              value as AllowanceType,
                            )
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALLOWANCE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {tEnums(`allowanceType.${type}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Amount */}
                        <InputGroup className="w-[140px]">
                          <InputGroupInput
                            type="number"
                            min={0}
                            value={allowance.amount}
                            onChange={(e) =>
                              updateAllowance(
                                index,
                                "amount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>¥</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {/* Taxable */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={allowance.taxable}
                            onCheckedChange={(checked) =>
                              updateAllowance(index, "taxable", checked)
                            }
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {t("allowance.taxable")}
                          </span>
                        </div>
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
  );
}
