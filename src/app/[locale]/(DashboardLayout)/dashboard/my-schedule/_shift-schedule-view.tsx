"use client";

import { useTranslations, useLocale } from "next-intl";
import { Calendar, Clock, ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import type { ShiftAssignment } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ShiftScheduleViewProps {
  shifts: ShiftAssignment[];
}

/**
 * Component hiển thị danh sách ca làm việc được phân công cho nhân viên
 */
export function ShiftScheduleView({ shifts }: ShiftScheduleViewProps) {
  const t = useTranslations("shifts");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (shifts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("noAssignedShifts")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          locale={locale}
          tEnums={tEnums}
        />
      ))}
    </div>
  );
}

// ============================================
// Shift Card Component
// ============================================

interface ShiftCardProps {
  shift: ShiftAssignment;
  locale: SupportedLocale;
  tEnums: ReturnType<typeof useTranslations>;
}

function ShiftCard({ shift, locale, tEnums }: ShiftCardProps) {
  const isSwapped = shift.status === "SWAPPED";
  const isPast = new Date(shift.workDate) < new Date();

  // Lấy thông tin từ shiftTemplate
  const shiftName = shift.shiftTemplate?.name || "";
  const startTime = shift.shiftTemplate?.startTime?.substring(0, 5) || "";
  const endTime = shift.shiftTemplate?.endTime?.substring(0, 5) || "";

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Shift Name */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{shiftName}</span>
              <StatusBadge status={shift.status} tEnums={tEnums} />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateWithDayOfWeek(shift.workDate, locale)}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>

            {/* Swapped info */}
            {isSwapped && shift.swappedWithEmployeeName && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <ArrowRightLeft className="h-4 w-4" />
                <span>Đổi ca với: {shift.swappedWithEmployeeName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
  status: string;
  tEnums: ReturnType<typeof useTranslations>;
}

function StatusBadge({ status, tEnums }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "secondary";
      case "COMPLETED":
        return "default";
      case "SWAPPED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {getEnumLabel("shiftAssignmentStatus", status, tEnums)}
    </Badge>
  );
}
