"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmploymentContract,
  EmploymentContractInput,
} from "@/types/attendance-records";
import { ContractType } from "@/types/attendance-enums";
import {
  createEmployeeContract,
  updateContract,
} from "@/lib/apis/employee-detail-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface ContractFormDialogProps {
  employeeId: number;
  existingContract: EmploymentContract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ContractFormDialog({
  employeeId,
  existingContract,
  open,
  onOpenChange,
  onSuccess,
}: ContractFormDialogProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const isEditing = !!existingContract;

  // Form state
  const [contractType, setContractType] = useState<string>("");
  const [contractNumber, setContractNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form khi dialog mở/đóng hoặc existingContract thay đổi
  useEffect(() => {
    if (open) {
      if (existingContract) {
        setContractType(existingContract.contractType);
        setContractNumber(existingContract.contractNumber || "");
        setStartDate(existingContract.startDate);
        setEndDate(existingContract.endDate || "");
        setNotes(existingContract.notes || "");
      } else {
        setContractType("");
        setContractNumber("");
        setStartDate("");
        setEndDate("");
        setNotes("");
      }
      setErrors({});
    }
  }, [open, existingContract]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contractType) {
      newErrors.contractType = tCommon("required");
    }
    if (!startDate) {
      newErrors.startDate = tCommon("required");
    }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate =
        t("invalidDateRange") || "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: EmploymentContractInput = {
        contractType: contractType as ContractType,
        startDate,
        endDate: endDate || undefined,
        notes: notes || undefined,
      };

      if (isEditing && existingContract) {
        await updateContract(existingContract.id, data);
        toast.success(t("updateSuccess"));
      } else {
        await createEmployeeContract(employeeId, data);
        toast.success(t("createSuccess"));
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error(isEditing ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? t("edit") : t("create")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contract Type */}
          <div className="space-y-2">
            <Label htmlFor="contractType">{t("contractType")} *</Label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger id="contractType">
                <SelectValue placeholder={t("contractTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(contractType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getEnumLabel("contractType", type, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contractType && (
              <p className="text-sm text-red-500">{errors.contractType}</p>
            )}
          </div>

          {/* Contract Number */}
          <div className="space-y-2">
            <Label htmlFor="contractNumber">{t("contractNumber")}</Label>
            <Input
              id="contractNumber"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder={t("contractNumberPlaceholder")}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">{t("startDate")} *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">{t("endDate")}</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              rows={3}
            />
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
            {isSubmitting ? tCommon("processing") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
