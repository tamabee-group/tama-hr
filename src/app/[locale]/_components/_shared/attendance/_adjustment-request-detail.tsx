"use client";

import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Trash2, Circle, CheckCircle2, Plus } from "lucide-react";

import { TimeDisplay } from "@/app/[locale]/_components/_shared/display/_time-display";
import { Separator } from "@/components/ui/separator";

import {
  formatDateWithDayOfWeek,
  formatDateTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import type { AdjustmentRequest } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AdjustmentRequestDetailProps {
  request: AdjustmentRequest;
  showEmployeeName?: boolean;
}

// ============================================
// Utility Functions
// ============================================

// Chuyển datetime string thành số phút từ 00:00
function datetimeToMinutes(datetime: string | null | undefined): number {
  if (!datetime) return 0;
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return 0;
  return d.getHours() * 60 + d.getMinutes();
}

// Tính tổng phút break từ break items
function calculateTotalBreakMinutes(
  breakItems: AdjustmentRequest["breakItems"],
  allBreakRecords: AdjustmentRequest["allBreakRecords"],
  useRequested: boolean,
): number {
  if (!allBreakRecords || allBreakRecords.length === 0) {
    // Không có break records, chỉ tính từ break items CREATE
    if (!breakItems) return 0;
    return breakItems
      .filter((item) => item.actionType === "CREATE")
      .reduce((sum, item) => {
        const start = datetimeToMinutes(item.requestedBreakStart);
        const end = datetimeToMinutes(item.requestedBreakEnd);
        return sum + Math.max(0, end - start);
      }, 0);
  }

  let total = 0;

  for (const record of allBreakRecords) {
    // Kiểm tra xem record này có bị điều chỉnh không
    const adjustItem = breakItems?.find(
      (item) => item.breakRecordId === record.id,
    );

    if (adjustItem) {
      if (adjustItem.actionType === "DELETE") {
        // Bị xóa -> không tính
        continue;
      }
      if (adjustItem.actionType === "ADJUST" && useRequested) {
        // Được điều chỉnh -> dùng giá trị mới
        const start = datetimeToMinutes(
          adjustItem.requestedBreakStart || record.breakStart,
        );
        const end = datetimeToMinutes(
          adjustItem.requestedBreakEnd || record.breakEnd,
        );
        total += Math.max(0, end - start);
        continue;
      }
    }

    // Không bị điều chỉnh -> dùng giá trị gốc
    const start = datetimeToMinutes(record.breakStart);
    const end = datetimeToMinutes(record.breakEnd);
    total += Math.max(0, end - start);
  }

  // Thêm break mới (CREATE)
  if (breakItems) {
    for (const item of breakItems.filter((i) => i.actionType === "CREATE")) {
      const start = datetimeToMinutes(item.requestedBreakStart);
      const end = datetimeToMinutes(item.requestedBreakEnd);
      total += Math.max(0, end - start);
    }
  }

  return total;
}

// Tính thời gian làm việc
function calculateWorkingMinutes(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
  totalBreakMinutes: number,
): number {
  if (!checkIn || !checkOut) return 0;
  const start = datetimeToMinutes(checkIn);
  const end = datetimeToMinutes(checkOut);
  const gross = Math.max(0, end - start);
  return Math.max(0, gross - totalBreakMinutes);
}

/**
 * Component hiển thị chi tiết yêu cầu điều chỉnh
 * Hỗ trợ nhiều break items trong 1 request
 */
export function AdjustmentRequestDetail({
  request,
}: AdjustmentRequestDetailProps) {
  const t = useTranslations("attendance");
  const locale = useLocale() as SupportedLocale;

  // Xác định loại request
  const isDeleteRecord = request.requestType === "DELETE_RECORD";
  const isAdjust = !isDeleteRecord;

  // Kiểm tra có thay đổi check in/out không
  // Chỉ coi là thay đổi khi requestedCheckIn có giá trị VÀ khác với original
  const hasCheckInChange =
    isAdjust &&
    request.requestedCheckIn != null &&
    request.originalCheckIn !== request.requestedCheckIn;
  const hasCheckOutChange =
    isAdjust &&
    request.requestedCheckOut != null &&
    request.originalCheckOut !== request.requestedCheckOut;

  // Lấy break items
  const breakItems = request.breakItems || [];
  const hasBreakItems = breakItems.length > 0;

  return (
    <div className="mt-6">
      {/* Layout 2 cột trên desktop, mobile hiển thị Reason + History trước */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Cột phải trên desktop, hiển thị đầu tiên trên mobile */}
        <div className="space-y-6 lg:order-2 mb-6 lg:mb-0 border p-4 border-primary rounded-2xl">
          {/* Reason for Request */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("adjustment.reasonForRequest")}
            </h4>
            <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-muted-foreground/30">
              <p className="text-sm italic">&quot;{request.reason}&quot;</p>
            </div>
          </div>

          {/* Request History Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("adjustment.requestHistory")}
            </h4>
            <RequestTimeline request={request} locale={locale} t={t} />
          </div>

          {/* Rejection reason if rejected */}
          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                {t("adjustment.rejectionReason")}
              </h4>
              <p className="text-sm p-3 bg-red-50 dark:bg-red-950 rounded-md text-red-600 border border-red-200">
                {request.rejectionReason}
              </p>
            </div>
          )}

          {/* Approver comment if approved */}
          {request.status === "APPROVED" && request.approverComment && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                {t("adjustment.approverComment")}
              </h4>
              <p className="text-sm p-3 bg-green-50 dark:bg-green-950 rounded-md text-green-600 border border-green-200">
                {request.approverComment}
              </p>
            </div>
          )}
        </div>

        {/* Cột trái trên desktop, hiển thị sau trên mobile */}
        <div className="space-y-6 lg:order-1">
          {/* DELETE_RECORD: Hiển thị thông báo xóa */}
          {isDeleteRecord && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">
                    {t("adjustment.deleteRecordRequest")}
                  </p>
                  <p className="text-sm text-red-600/80">
                    {t("adjustment.deleteRecordInfo")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ADJUST: Correction Details */}
          {isAdjust && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("adjustment.correctionDetails")}
              </h4>
              <div className="space-y-4">
                {/* Original Entry */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("adjustment.originalEntry")}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {t("checkIn")}
                      </span>
                      <TimeDisplay date={request.originalCheckIn} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {t("checkOut")}
                      </span>
                      <TimeDisplay date={request.originalCheckOut} />
                    </div>
                  </div>

                  {/* Original Summary */}
                  <OriginalSummary request={request} locale={locale} t={t} />
                </div>

                {/* Requested Correction */}
                <div className="space-y-3 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <h5 className="text-xs font-semibold text-primary uppercase">
                      {t("adjustment.requestedCorrection")}
                    </h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {t("checkIn")}
                      </span>
                      {hasCheckInChange ? (
                        <TimeDisplay
                          date={request.requestedCheckIn}
                          className="text-primary font-semibold"
                        />
                      ) : (
                        <span className="text-muted-foreground italic">
                          {t("adjustment.noChange")}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {t("checkOut")}
                      </span>
                      {hasCheckOutChange ? (
                        <TimeDisplay
                          date={request.requestedCheckOut}
                          className="text-primary font-semibold"
                        />
                      ) : (
                        <span className="text-muted-foreground italic">
                          {t("adjustment.noChange")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Break Items trong Requested Correction */}
                  {hasBreakItems && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary uppercase">
                          {t("adjustment.breakAdjustments")}
                        </p>
                        <div className="space-y-2">
                          {breakItems.map((item) => (
                            <BreakItemInline key={item.id} item={item} t={t} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Requested Summary */}
                  <RequestedSummary request={request} locale={locale} t={t} />
                </div>
              </div>
            </div>
          )}

          {/* All Break Records */}
          {request.allBreakRecords && request.allBreakRecords.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("adjustment.allBreakRecords")}
                </h4>
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  {request.allBreakRecords.map((record) => {
                    const isBeingAdjusted = breakItems.some(
                      (item) => item.breakRecordId === record.id,
                    );
                    return (
                      <div
                        key={record.id}
                        className={`flex justify-between items-center text-sm ${
                          isBeingAdjusted ? "text-primary font-medium" : ""
                        }`}
                      >
                        <span>
                          {t("adjustment.breakNumber", {
                            number: record.breakNumber,
                          })}
                          {isBeingAdjusted && (
                            <span className="ml-2 text-xs text-primary">
                              ({t("adjustment.beingAdjusted")})
                            </span>
                          )}
                        </span>
                        <span>
                          <TimeDisplay date={record.breakStart} />
                          {" - "}
                          <TimeDisplay date={record.breakEnd} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: Dialog Header Info
export function getAdjustmentDialogDescription(
  request: AdjustmentRequest,
  locale: SupportedLocale,
  showEmployeeName = false,
): string {
  if (showEmployeeName) {
    return `${request.employeeName} - ${formatDateWithDayOfWeek(request.workDate, locale)}`;
  }
  return formatDateWithDayOfWeek(request.workDate, locale);
}

// ============================================
// BreakItemInline Component (hiển thị trong Requested Correction)
// ============================================

interface BreakItemInlineProps {
  item: NonNullable<AdjustmentRequest["breakItems"]>[number];
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function BreakItemInline({ item, t }: BreakItemInlineProps) {
  const isDelete = item.actionType === "DELETE";
  const isCreate = item.actionType === "CREATE";

  if (isDelete) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-600">
        <Trash2 className="h-3.5 w-3.5 shrink-0" />
        <span>
          {t("adjustment.deleteBreakLabel", { number: item.breakNumber || 1 })}:{" "}
          <TimeDisplay date={item.originalBreakStart} />
          {" - "}
          <TimeDisplay date={item.originalBreakEnd} />
        </span>
      </div>
    );
  }

  if (isCreate) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span>
          {t("adjustment.createBreakLabel", { number: item.breakNumber || 1 })}:{" "}
          <span className="font-semibold">
            <TimeDisplay date={item.requestedBreakStart} />
            {" - "}
            <TimeDisplay date={item.requestedBreakEnd} />
          </span>
        </span>
      </div>
    );
  }

  // ADJUST
  return (
    <div className="flex items-center gap-2 text-sm">
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span>
        {t("adjustment.breakNumber", { number: item.breakNumber || 1 })}:{" "}
        <span className="text-primary font-semibold">
          <TimeDisplay date={item.requestedBreakStart} />
          {" - "}
          <TimeDisplay date={item.requestedBreakEnd} />
        </span>
      </span>
    </div>
  );
}

// ============================================
// OriginalSummary Component
// ============================================

interface SummaryProps {
  request: AdjustmentRequest;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function OriginalSummary({ request, locale, t }: SummaryProps) {
  const totalBreakMinutes = calculateTotalBreakMinutes(
    undefined, // Không tính break items
    request.allBreakRecords,
    false,
  );

  const workingMinutes = calculateWorkingMinutes(
    request.originalCheckIn,
    request.originalCheckOut,
    totalBreakMinutes,
  );

  return (
    <div className="pt-2 border-t border-muted space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          {t("adjustment.totalBreakTime")}
        </span>
        <span>{formatMinutesToTime(totalBreakMinutes, { locale })}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          {t("adjustment.totalWorkingTime")}
        </span>
        <span>{formatMinutesToTime(workingMinutes, { locale })}</span>
      </div>
    </div>
  );
}

// ============================================
// RequestedSummary Component
// ============================================

function RequestedSummary({ request, locale, t }: SummaryProps) {
  // Tính checkIn/checkOut sau điều chỉnh
  const effectiveCheckIn = request.requestedCheckIn || request.originalCheckIn;
  const effectiveCheckOut =
    request.requestedCheckOut || request.originalCheckOut;

  const totalBreakMinutes = calculateTotalBreakMinutes(
    request.breakItems,
    request.allBreakRecords,
    true,
  );

  const workingMinutes = calculateWorkingMinutes(
    effectiveCheckIn,
    effectiveCheckOut,
    totalBreakMinutes,
  );

  return (
    <div className="pt-2 border-t border-primary/20 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-primary/70">
          {t("adjustment.totalBreakTime")}
        </span>
        <span className="text-primary font-medium">
          {formatMinutesToTime(totalBreakMinutes, { locale })}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-primary/70">
          {t("adjustment.totalWorkingTime")}
        </span>
        <span className="text-primary font-medium">
          {formatMinutesToTime(workingMinutes, { locale })}
        </span>
      </div>
    </div>
  );
}

// ============================================
// RequestTimeline Component
// ============================================

interface RequestTimelineProps {
  request: AdjustmentRequest;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function RequestTimeline({ request, locale, t }: RequestTimelineProps) {
  const isPending = request.status === "PENDING";
  const isApproved = request.status === "APPROVED";
  const isRejected = request.status === "REJECTED";

  return (
    <div className="space-y-0">
      {/* Request Submitted */}
      <TimelineItem
        icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
        title={t("adjustment.timelineSubmitted")}
        subtitle={`${request.employeeName} · ${formatDateTime(request.createdAt, locale)}`}
        isCompleted
        hasLine
      />

      {/* Under Review / Assigned */}
      <TimelineItem
        icon={
          isPending ? (
            <Circle className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          )
        }
        title={t("adjustment.timelineUnderReview")}
        subtitle={
          request.assignedToName
            ? `${t("adjustment.assignedToName")}: ${request.assignedToName}`
            : undefined
        }
        isCompleted={!isPending}
        hasLine
        isActive={isPending}
      />

      {/* Final Status */}
      {isApproved && (
        <TimelineItem
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          title={t("adjustment.timelineApproved")}
          subtitle={
            request.approverName && request.approvedAt
              ? `${request.approverName} · ${formatDateTime(request.approvedAt, locale)}`
              : undefined
          }
          isCompleted
          hasLine={false}
        />
      )}

      {isRejected && (
        <TimelineItem
          icon={<Circle className="h-4 w-4 text-red-500 fill-red-500" />}
          title={t("adjustment.timelineRejected")}
          subtitle={
            request.approverName && request.approvedAt
              ? `${request.approverName} · ${formatDateTime(request.approvedAt, locale)}`
              : undefined
          }
          isCompleted
          hasLine={false}
        />
      )}

      {isPending && (
        <TimelineItem
          icon={<Circle className="h-4 w-4 text-muted-foreground" />}
          title={t("adjustment.timelineAwaitingApproval")}
          subtitle={t("adjustment.timelinePendingDecision")}
          isCompleted={false}
          hasLine={false}
        />
      )}
    </div>
  );
}

// ============================================
// TimelineItem Component
// ============================================

interface TimelineItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
  hasLine: boolean;
  isActive?: boolean;
}

function TimelineItem({
  icon,
  title,
  subtitle,
  isCompleted,
  hasLine,
  isActive,
}: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-6 h-6">{icon}</div>
        {hasLine && (
          <div
            className={`w-0.5 flex-1 min-h-[24px] ${
              isCompleted ? "bg-primary/30" : "bg-muted"
            }`}
          />
        )}
      </div>
      <div className="pb-4">
        <p
          className={`text-sm font-medium ${
            isActive
              ? "text-yellow-600"
              : isCompleted
                ? ""
                : "text-muted-foreground"
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
