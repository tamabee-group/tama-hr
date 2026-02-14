"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, CalendarIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { ReasonTemplateSelect } from "@/app/[locale]/_components/_shared/_reason-template-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { departmentApi } from "@/lib/apis/department-api";
import { getApprovers, ApproverInfo } from "@/lib/apis/company-employees";
import { LeaveBalance } from "@/types/attendance-records";
import { DefaultApprover } from "@/types/department";
import { LEAVE_TYPES, LeaveType } from "@/types/attendance-enums";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatDateForApi } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface LeaveRequestFormProps {
  balances: LeaveBalance[];
  onSuccess: () => void;
}

// ============================================
// Component
// ============================================

export function LeaveRequestForm({
  balances,
  onSuccess,
}: LeaveRequestFormProps) {
  const t = useTranslations("portal.leave");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const { user } = useAuth();
  const locale = useLocale() as SupportedLocale;

  // Form state
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [approverId, setApproverId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Approver state
  const [approvers, setApprovers] = useState<ApproverInfo[]>([]);
  const [defaultApprover, setDefaultApprover] =
    useState<DefaultApprover | null>(null);
  const [loadingApprovers, setLoadingApprovers] = useState(true);

  // Fetch approvers và default approver
  const fetchApprovers = useCallback(async () => {
    if (!user?.id) return;

    setLoadingApprovers(true);
    try {
      const [approverList, defaultApproverData] = await Promise.all([
        getApprovers(),
        departmentApi.getDefaultApprover(user.id),
      ]);
      setApprovers(approverList);
      setDefaultApprover(defaultApproverData);

      // Auto-select default approver nếu có
      if (defaultApproverData) {
        setApproverId(defaultApproverData.id);
      }
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
    } finally {
      setLoadingApprovers(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchApprovers();
  }, [fetchApprovers]);

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

    if (!approverId) {
      newErrors.approver = tCommon("checkInfo");
    }

    if (dateRange?.from && dateRange?.to && dateRange.from > dateRange.to) {
      newErrors.dateRange = t("invalidDateRange");
    }

    if (!isBalanceSufficient) {
      newErrors.balance = t("insufficientBalance");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    const data: CreateLeaveRequest = {
      leaveType: leaveType as LeaveType,
      startDate: formatDateForApi(dateRange!.from!)!,
      endDate: formatDateForApi(dateRange!.to!)!,
      reason: reason.trim(),
      approverId: approverId || undefined,
    };

    try {
      setIsProcessing(true);
      await leaveApi.createLeaveRequest(data);
      toast.success(t("requestSuccess"));

      // Reset form
      setLeaveType("");
      setDateRange(undefined);
      setReason("");
      // Giữ lại approverId mặc định
      if (defaultApprover) {
        setApproverId(defaultApprover.id);
      }
      setErrors({});

      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors, t("requestError")));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Send className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{t("requestLeave")}</h3>
      </div>

      <div className="space-y-5">
        {/* Leave Type */}
        <div className="space-y-2">
          <Label className="text-sm">{t("type")}</Label>
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
                "w-full h-11 rounded-xl bg-white/50 dark:bg-white/5 border-0",
                errors.leaveType && "ring-2 ring-destructive",
              )}
            >
              <SelectValue placeholder={t("selectType")} />
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
            <span className="text-xs text-destructive">{errors.leaveType}</span>
          )}
          {currentBalance && (
            <p className="text-xs text-muted-foreground">
              {t("remaining")}: {currentBalance.remainingDays} /{" "}
              {currentBalance.totalDays}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm">{t("dateRange")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-start text-left font-normal rounded-xl bg-white/50 dark:bg-white/5 border-0",
                  !dateRange && "text-muted-foreground",
                  errors.dateRange && "ring-2 ring-destructive",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from, locale)} -{" "}
                        {formatDate(dateRange.to, locale)}
                      </>
                    ) : (
                      formatDate(dateRange.from, locale)
                    )
                  ) : (
                    t("selectDateRange")
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
            <span className="text-xs text-destructive">{errors.dateRange}</span>
          )}
          {totalDays > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("totalDays")}: {totalDays}
            </p>
          )}
          {errors.balance && (
            <span className="text-xs text-destructive">{errors.balance}</span>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label className="text-sm">{t("reason")}</Label>
          <ReasonTemplateSelect
            category="leave"
            value={reason}
            onChange={(value) => {
              setReason(value);
              if (errors.reason) setErrors((prev) => ({ ...prev, reason: "" }));
            }}
            error={errors.reason}
          />
        </div>

        {/* Approver */}
        <div className="space-y-2">
          <Label className="text-sm">{t("approver")}</Label>
          <Select
            value={approverId?.toString() || ""}
            onValueChange={(value) => {
              setApproverId(Number(value));
              if (errors.approver)
                setErrors((prev) => ({ ...prev, approver: "" }));
            }}
            disabled={loadingApprovers}
          >
            <SelectTrigger
              className={cn(
                "w-full h-11 rounded-xl bg-white/50 dark:bg-white/5 border-0",
                errors.approver && "ring-2 ring-destructive",
              )}
            >
              <SelectValue placeholder={t("selectApprover")} />
            </SelectTrigger>
            <SelectContent>
              {approvers.map((approver) => (
                <SelectItem key={approver.id} value={approver.id.toString()}>
                  {approver.name}
                  {defaultApprover?.id === approver.id && (
                    <span className="text-muted-foreground ml-1">
                      ({t("departmentManager")})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.approver && (
            <span className="text-xs text-destructive">{errors.approver}</span>
          )}
          {defaultApprover && (
            <p className="text-xs text-muted-foreground">
              {t("defaultApproverHint", { name: defaultApprover.name })}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full h-12 rounded-xl text-base"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("submit")}
        </Button>
      </div>
    </GlassCard>
  );
}
