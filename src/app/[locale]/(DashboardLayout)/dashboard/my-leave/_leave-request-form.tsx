"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, addDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { leaveApi, CreateLeaveRequest } from "@/lib/apis/leave-api";
import { LeaveBalance } from "@/types/attendance-records";
import { LEAVE_TYPES, LeaveType } from "@/types/attendance-enums";
import { getErrorMessage } from "@/lib/utils/get-error-message";

/**
 * Component form tạo yêu cầu nghỉ phép
 * Responsive design: vertical stacking trên mobile, full-width inputs
 */
export function LeaveRequestForm() {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");

  // Form state
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Balance state
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Fetch leave balance
  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const data = await leaveApi.getMyLeaveBalance();
      setBalances(data);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Calculate total days
  const totalDays =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from) + 1
      : 0;

  // Get current balance for selected type
  const currentBalance = leaveType
    ? balances.find((b) => b.leaveType === leaveType)
    : null;

  // Check if balance is sufficient
  const isBalanceSufficient =
    !currentBalance || currentBalance.remainingDays >= totalDays;

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!leaveType) {
      newErrors.leaveType = tCommon("checkInfo");
    }

    if (!dateRange?.from || !dateRange?.to) {
      newErrors.dateRange = tCommon("checkInfo");
    }

    if (!reason.trim()) {
      newErrors.reason = tCommon("checkInfo");
    }

    if (dateRange?.from && dateRange?.to && dateRange.from > dateRange.to) {
      newErrors.dateRange = t("messages.invalidDateRange");
    }

    if (!isBalanceSufficient) {
      newErrors.balance = t("messages.insufficientBalance");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    const data: CreateLeaveRequest = {
      leaveType: leaveType as LeaveType,
      startDate: format(dateRange!.from!, "yyyy-MM-dd"),
      endDate: format(dateRange!.to!, "yyyy-MM-dd"),
      reason: reason.trim(),
    };

    try {
      setIsProcessing(true);
      await leaveApi.createLeaveRequest(data);
      toast.success(t("messages.requestSuccess"));

      // Reset form
      setLeaveType("");
      setDateRange(undefined);
      setReason("");
      setErrors({});

      // Refresh balance
      fetchBalance();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(
        getErrorMessage(errorCode, tErrors, t("messages.requestError")),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">
          {t("requestLeave")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        {/* Leave Type - Full width */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">{t("form.type")}</Label>
          <Select
            value={leaveType}
            onValueChange={(value) => {
              setLeaveType(value as LeaveType);
              if (errors.leaveType)
                setErrors((prev) => ({ ...prev, leaveType: "" }));
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full h-10 sm:h-9",
                errors.leaveType && "border-destructive",
              )}
            >
              <SelectValue placeholder={t("form.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {tEnums(`leaveType.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.leaveType && (
            <span className="text-xs sm:text-sm text-destructive">
              {errors.leaveType}
            </span>
          )}

          {/* Show balance for selected type */}
          {currentBalance && !loadingBalance && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("balance.remaining")}: {currentBalance.remainingDays} /{" "}
              {currentBalance.totalDays}
            </p>
          )}
        </div>

        {/* Date Range - Full width */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">
            {t("form.startDate")} - {t("form.endDate")}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-10 sm:h-9 justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground",
                  errors.dateRange && "border-destructive",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "PPP")} -{" "}
                        {format(dateRange.to, "PPP")}
                      </>
                    ) : (
                      format(dateRange.from, "PPP")
                    )
                  ) : (
                    t("form.startDate")
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (errors.dateRange)
                    setErrors((prev) => ({ ...prev, dateRange: "" }));
                }}
                numberOfMonths={1}
                disabled={(date) => date < addDays(new Date(), -1)}
                className="sm:hidden"
              />
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (errors.dateRange)
                    setErrors((prev) => ({ ...prev, dateRange: "" }));
                }}
                numberOfMonths={2}
                disabled={(date) => date < addDays(new Date(), -1)}
                className="hidden sm:block"
              />
            </PopoverContent>
          </Popover>
          {errors.dateRange && (
            <span className="text-xs sm:text-sm text-destructive">
              {errors.dateRange}
            </span>
          )}

          {/* Show total days */}
          {totalDays > 0 && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("table.days")}: {totalDays}
            </p>
          )}

          {/* Balance warning */}
          {errors.balance && (
            <span className="text-xs sm:text-sm text-destructive">
              {errors.balance}
            </span>
          )}
        </div>

        {/* Reason - Full width */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm">{t("form.reason")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors((prev) => ({ ...prev, reason: "" }));
            }}
            placeholder={t("form.reasonPlaceholder")}
            rows={3}
            className={cn(
              "w-full resize-none",
              errors.reason && "border-destructive",
            )}
          />
          {errors.reason && (
            <span className="text-xs sm:text-sm text-destructive">
              {errors.reason}
            </span>
          )}
        </div>

        {/* Submit - Full width, larger touch target on mobile */}
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full min-h-[44px] sm:min-h-[36px] text-sm sm:text-base"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("form.submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
