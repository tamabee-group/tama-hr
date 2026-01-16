"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveBalance } from "@/types/attendance-records";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";

interface LeaveBalanceCardsProps {
  balances: LeaveBalance[];
}

export function LeaveBalanceCards({ balances }: LeaveBalanceCardsProps) {
  const t = useTranslations("leave");
  const tEnums = useTranslations("enums");

  // Không hiển thị gì nếu chưa có dữ liệu balance
  if (balances.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {balances.map((balance) => (
        <Card key={balance.leaveType}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {getEnumLabel("leaveType", balance.leaveType, tEnums)}
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    balance.remainingDays > 0
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {balance.remainingDays}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {balance.totalDays} {t("balance.total")}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  {t("balance.used")}: {balance.usedDays}
                </span>
                {balance.pendingDays > 0 && (
                  <span className="text-yellow-600">
                    {t("balance.pending")}: {balance.pendingDays}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
