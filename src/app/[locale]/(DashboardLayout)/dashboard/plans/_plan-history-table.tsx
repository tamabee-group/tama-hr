"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanChangeHistory } from "@/types/subscription";
import { getPlanChangeHistory } from "@/lib/apis/subscription";
import { formatDate } from "@/lib/utils/format-date-time";
import { formatCurrency } from "@/lib/utils/format-currency";

interface PlanHistoryTableProps {
  refreshKey?: number;
}

export function PlanHistoryTable({ refreshKey }: PlanHistoryTableProps) {
  const t = useTranslations("plans");
  const tEnums = useTranslations("enums");
  const [history, setHistory] = useState<PlanChangeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getPlanChangeHistory();
        setHistory(data);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [refreshKey]);

  const columns: ColumnDef<PlanChangeHistory>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <div className="w-[60px]">{row.index + 1}</div>,
    },
    {
      accessorKey: "createdAt",
      header: t("history.date"),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "changeType",
      header: t("history.changeType"),
      cell: ({ row }) => {
        const type = row.original.changeType;
        const variant = getChangeTypeBadgeVariant(type);
        return (
          <Badge variant={variant}>{tEnums(`planChangeType.${type}`)}</Badge>
        );
      },
    },
    {
      accessorKey: "fromPlanName",
      header: t("history.fromPlan"),
      cell: ({ row }) => row.original.fromPlanName || "-",
    },
    {
      accessorKey: "toPlanName",
      header: t("history.toPlan"),
      cell: ({ row }) => row.original.toPlanName,
    },
    {
      accessorKey: "toPlanPrice",
      header: t("history.price"),
      cell: ({ row }) => {
        const from = row.original.fromPlanPrice;
        const to = row.original.toPlanPrice;
        if (from === null) {
          return formatCurrency(to);
        }
        return `${formatCurrency(from)} → ${formatCurrency(to)}`;
      },
    },
    {
      accessorKey: "effectiveDate",
      header: t("history.effectiveDate"),
      cell: ({ row }) => formatDate(row.original.effectiveDate),
    },
  ];

  if (loading) {
    return (
      <GlassSection>
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </GlassSection>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <GlassSection title={t("history.title")}>
      <BaseTable
        columns={columns}
        data={history}
        noResultsText={t("history.noHistory")}
      />
    </GlassSection>
  );
}

function getChangeTypeBadgeVariant(
  type: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "UPGRADE":
      return "default";
    case "DOWNGRADE":
      return "secondary";
    case "TRIAL_CHANGE":
      return "outline";
    case "SCHEDULED_APPLY":
      return "secondary";
    case "INITIAL":
      return "outline";
    default:
      return "outline";
  }
}
