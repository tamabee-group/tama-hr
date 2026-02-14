"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, Clock, User, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReasonTemplateSelect } from "@/app/[locale]/_components/_shared/_reason-template-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shiftApi } from "@/lib/apis/shift-api";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import type { ShiftAssignment } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface SwapRequestFormProps {
  shifts: ShiftAssignment[];
  onSuccess?: () => void;
}

/**
 * Form yêu cầu đổi ca
 * Nhận danh sách ca từ props, chỉ fetch ca có thể đổi khi cần
 */
export function SwapRequestForm({ shifts, onSuccess }: SwapRequestFormProps) {
  const t = useTranslations("shifts");
  const locale = useLocale() as SupportedLocale;

  // Lọc ca SCHEDULED từ props
  const myShifts = React.useMemo(
    () => shifts.filter((s) => s.status === "SCHEDULED"),
    [shifts],
  );

  // State
  const [availableShifts, setAvailableShifts] = React.useState<
    ShiftAssignment[]
  >([]);
  const [selectedMyShift, setSelectedMyShift] =
    React.useState<ShiftAssignment | null>(null);
  const [selectedTargetShift, setSelectedTargetShift] =
    React.useState<ShiftAssignment | null>(null);
  const [reason, setReason] = React.useState("");
  const [isLoadingAvailable, setIsLoadingAvailable] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // Fetch ca có thể đổi khi chọn ca của mình
  const fetchAvailableShifts = React.useCallback(async (myShiftId: number) => {
    try {
      setIsLoadingAvailable(true);
      const data = await shiftApi.getAvailableShiftsForSwap(myShiftId);
      setAvailableShifts(data);
    } catch (error) {
      console.error("Error fetching available shifts:", error);
      setAvailableShifts([]);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, []);

  // Khi chọn ca của mình, fetch ca có thể đổi
  const handleSelectMyShift = (shiftId: string) => {
    const shift = myShifts.find((s) => s.id.toString() === shiftId);
    setSelectedMyShift(shift || null);
    setSelectedTargetShift(null);
    setAvailableShifts([]);

    if (shift) {
      fetchAvailableShifts(shift.id);
    }
  };

  // Khi chọn ca muốn đổi
  const handleSelectTargetShift = (shiftId: string) => {
    const shift = availableShifts.find((s) => s.id.toString() === shiftId);
    setSelectedTargetShift(shift || null);
  };

  // Mở dialog xác nhận
  const handleOpenConfirm = () => {
    if (!selectedMyShift || !selectedTargetShift) return;
    setShowConfirmDialog(true);
  };

  // Submit yêu cầu đổi ca
  const handleSubmit = async () => {
    if (!selectedMyShift || !selectedTargetShift) return;

    try {
      setIsSubmitting(true);
      await shiftApi.createSwapRequest({
        requesterShiftId: selectedMyShift.id,
        targetShiftId: selectedTargetShift.id,
        reason: reason || undefined,
      });

      toast.success(t("swapCreateSuccess"));
      setShowConfirmDialog(false);

      // Reset form
      setSelectedMyShift(null);
      setSelectedTargetShift(null);
      setReason("");
      setAvailableShifts([]);

      onSuccess?.();
    } catch (error) {
      console.error("Error creating swap request:", error);
      toast.error(t("swapCreateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper để lấy thông tin shift
  const getShiftInfo = (shift: ShiftAssignment) => {
    const name = shift.shiftTemplate?.name || shift.shiftName || "";
    const startTime =
      shift.shiftTemplate?.startTime?.substring(0, 5) ||
      shift.shiftStartTime ||
      "";
    const endTime =
      shift.shiftTemplate?.endTime?.substring(0, 5) || shift.shiftEndTime || "";
    return { name, startTime, endTime };
  };

  return (
    <div className="space-y-6">
      {/* Chọn ca của mình */}
      <GlassSection title={t("selectMyShift")}>
        {myShifts.length === 0 ? (
          <p className="text-muted-foreground">{t("noAssignedShifts")}</p>
        ) : (
          <Select
            value={selectedMyShift?.id.toString() || ""}
            onValueChange={handleSelectMyShift}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectMyShift")} />
            </SelectTrigger>
            <SelectContent>
              {myShifts.map((shift) => {
                const info = getShiftInfo(shift);
                return (
                  <SelectItem key={shift.id} value={shift.id.toString()}>
                    {info.name} -{" "}
                    {formatDateWithDayOfWeek(shift.workDate, locale)} (
                    {info.startTime} - {info.endTime})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {/* Hiển thị chi tiết ca đã chọn */}
        {selectedMyShift && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <ShiftDetail shift={selectedMyShift} locale={locale} />
          </div>
        )}
      </GlassSection>

      {/* Chọn ca muốn đổi */}
      {selectedMyShift && (
        <GlassSection title={t("availableShifts")}>
          {isLoadingAvailable ? (
            <Skeleton className="h-10" />
          ) : availableShifts.length === 0 ? (
            <p className="text-muted-foreground">{t("noAssignedShifts")}</p>
          ) : (
            <Select
              value={selectedTargetShift?.id.toString() || ""}
              onValueChange={handleSelectTargetShift}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectTargetShift")} />
              </SelectTrigger>
              <SelectContent>
                {availableShifts.map((shift) => {
                  const info = getShiftInfo(shift);
                  return (
                    <SelectItem key={shift.id} value={shift.id.toString()}>
                      {shift.employeeName} - {info.name} -{" "}
                      {formatDateWithDayOfWeek(shift.workDate, locale)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          {/* Hiển thị chi tiết ca muốn đổi */}
          {selectedTargetShift && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <ShiftDetail
                shift={selectedTargetShift}
                locale={locale}
                showEmployee
              />
            </div>
          )}
        </GlassSection>
      )}

      {/* Lý do đổi ca */}
      {selectedMyShift && selectedTargetShift && (
        <GlassSection title={t("swapReason")}>
          <div className="space-y-4">
            <ReasonTemplateSelect
              category="swap"
              value={reason}
              onChange={setReason}
            />

            <Button onClick={handleOpenConfirm} className="w-full">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              {t("requestSwap")}
            </Button>
          </div>
        </GlassSection>
      )}

      {/* Confirmation Dialog */}
      <SwapConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        myShift={selectedMyShift}
        targetShift={selectedTargetShift}
        reason={reason}
        locale={locale}
        onConfirm={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

// ============================================
// Shift Detail Component
// ============================================

interface ShiftDetailProps {
  shift: ShiftAssignment;
  locale: SupportedLocale;
  showEmployee?: boolean;
}

function ShiftDetail({ shift, locale, showEmployee }: ShiftDetailProps) {
  const name = shift.shiftTemplate?.name || shift.shiftName || "";
  const startTime =
    shift.shiftTemplate?.startTime?.substring(0, 5) ||
    shift.shiftStartTime ||
    "";
  const endTime =
    shift.shiftTemplate?.endTime?.substring(0, 5) || shift.shiftEndTime || "";

  return (
    <div className="space-y-2 text-sm">
      <div className="font-medium">{name}</div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{formatDateWithDayOfWeek(shift.workDate, locale)}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>
          {startTime} - {endTime}
        </span>
      </div>
      {showEmployee && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{shift.employeeName}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Swap Confirm Dialog Component
// ============================================

interface SwapConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myShift: ShiftAssignment | null;
  targetShift: ShiftAssignment | null;
  reason: string;
  locale: SupportedLocale;
  onConfirm: () => void;
  isLoading: boolean;
}

function SwapConfirmDialog({
  open,
  onOpenChange,
  myShift,
  targetShift,
  reason,
  locale,
  onConfirm,
  isLoading,
}: SwapConfirmDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");

  if (!myShift || !targetShift) return null;

  const getShiftInfo = (shift: ShiftAssignment) => {
    const name = shift.shiftTemplate?.name || shift.shiftName || "";
    const startTime =
      shift.shiftTemplate?.startTime?.substring(0, 5) ||
      shift.shiftStartTime ||
      "";
    const endTime =
      shift.shiftTemplate?.endTime?.substring(0, 5) || shift.shiftEndTime || "";
    return { name, startTime, endTime };
  };

  const myInfo = getShiftInfo(myShift);
  const targetInfo = getShiftInfo(targetShift);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("confirmSwapTitle")}</DialogTitle>
          <DialogDescription>{t("confirmSwapDescription")}</DialogDescription>
        </DialogHeader>

        {/* 2 cột hiển thị ca đổi */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-4">
          {/* Ca của bạn */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              {t("yourShift")}
            </p>
            <p className="font-medium">{myInfo.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateWithDayOfWeek(myShift.workDate, locale)}
            </p>
            <p className="text-sm text-muted-foreground">
              {myInfo.startTime} - {myInfo.endTime}
            </p>
            <p className="text-sm text-primary mt-1">{tCommon("you")}</p>
          </div>

          {/* Mũi tên đổi ca */}
          <div className="flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Ca muốn đổi */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              {t("targetShift")}
            </p>
            <p className="font-medium">{targetInfo.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateWithDayOfWeek(targetShift.workDate, locale)}
            </p>
            <p className="text-sm text-muted-foreground">
              {targetInfo.startTime} - {targetInfo.endTime}
            </p>
            <p className="text-sm text-primary mt-1">
              {targetShift.employeeName}
            </p>
          </div>
        </div>

        {/* Lý do đổi ca */}
        {reason && (
          <div className="p-3 mb-8 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              {t("swapReason")}
            </p>
            <p className="text-sm">{reason}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? tCommon("loading") : tCommon("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
