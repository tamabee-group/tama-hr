"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  Clock,
  Coffee,
  DollarSign,
  PieChart,
  Calendar,
} from "lucide-react";

/**
 * Component hiển thị các loại báo cáo dưới dạng cards
 * Cho phép người dùng chọn loại báo cáo muốn xem
 */
export function ReportTypeCards() {
  const t = useTranslations("reports");
  const router = useRouter();

  const reportTypes = [
    {
      id: "attendance",
      icon: ClipboardList,
      title: t("types.attendance"),
      description: t("cards.attendanceDesc"),
      href: "/dashboard/reports/attendance",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      id: "overtime",
      icon: Clock,
      title: t("types.overtime"),
      description: t("cards.overtimeDesc"),
      href: "/dashboard/reports/overtime",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      id: "break-compliance",
      icon: Coffee,
      title: t("types.breakCompliance"),
      description: t("cards.breakComplianceDesc"),
      href: "/dashboard/reports/break-compliance",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      id: "payroll-summary",
      icon: DollarSign,
      title: t("types.payrollSummary"),
      description: t("cards.payrollSummaryDesc"),
      href: "/dashboard/reports/payroll-summary",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      id: "cost-analysis",
      icon: PieChart,
      title: t("types.costAnalysis"),
      description: t("cards.costAnalysisDesc"),
      href: "/dashboard/reports/cost-analysis",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      id: "shift-utilization",
      icon: Calendar,
      title: t("types.shiftUtilization"),
      description: t("cards.shiftUtilizationDesc"),
      href: "/dashboard/reports/shift-utilization",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportTypes.map((report) => {
        const Icon = report.icon;
        return (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(report.href)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${report.bgColor}`}>
                  <Icon className={`h-5 w-5 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
