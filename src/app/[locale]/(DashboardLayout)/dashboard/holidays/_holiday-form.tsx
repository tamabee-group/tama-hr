"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";

import { holidayApi } from "@/lib/apis/holiday-api";
import { Holiday, HolidayInput } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface HolidayFormDialogProps {
  holiday: Holiday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog form tạo/sửa ngày nghỉ lễ
 */
export function HolidayFormDialog({
  holiday,
  open,
  onOpenChange,
  onSuccess,
}: HolidayFormDialogProps) {
  const t = useTranslations("holidays");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const isEdit = !!holiday;

  // Form state
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isNational, setIsNational] = useState(false);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or holiday changes
  useEffect(() => {
    if (open) {
      if (holiday) {
        setName(holiday.name);
        setDate(new Date(holiday.date));
        setIsNational(holiday.isNational);
        setDescription(holiday.description || "");
      } else {
        setName("");
        setDate(undefined);
        setIsNational(false);
        setDescription("");
      }
      setErrors({});
    }
  }, [open, holiday]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = tCommon("checkInfo");
    }

    if (!date) {
      newErrors.date = tCommon("checkInfo");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    const data: HolidayInput = {
      name: name.trim(),
      date: format(date!, "yyyy-MM-dd"),
      isNational,
      description: description.trim() || undefined,
    };

    try {
      setIsProcessing(true);

      if (isEdit && holiday) {
        await holidayApi.updateHoliday(holiday.id, data);
        toast.success(t("messages.updateSuccess"));
      } else {
        await holidayApi.createHoliday(data);
        toast.success(t("messages.createSuccess"));
      }

      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(
        getErrorMessage(
          errorCode,
          tErrors,
          isEdit ? t("messages.updateError") : t("messages.createError"),
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editHoliday") : t("addHoliday")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 mt-2">
          {/* Name */}
          <div>
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder={t("form.namePlaceholder")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name}</span>
            )}
          </div>

          {/* Date */}
          <div>
            <Label>{t("form.date")}</Label>
            <DatePicker
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
                if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
              }}
              placeholder={t("form.datePlaceholder")}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <span className="text-sm text-destructive">{errors.date}</span>
            )}
          </div>

          {/* Is National */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNational"
              checked={isNational}
              onCheckedChange={(checked) => setIsNational(checked as boolean)}
            />
            <Label htmlFor="isNational" className="cursor-pointer">
              {t("form.isNational")}
            </Label>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t("form.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
