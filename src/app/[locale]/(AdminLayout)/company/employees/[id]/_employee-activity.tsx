"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmployeeActivity({ employeeId }: { employeeId: number }) {
  const t = useTranslations("users");

  // TODO: Sử dụng employeeId để fetch hoạt động của nhân viên
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t("featureUpdating")}</p>
      </CardContent>
    </Card>
  );
}
