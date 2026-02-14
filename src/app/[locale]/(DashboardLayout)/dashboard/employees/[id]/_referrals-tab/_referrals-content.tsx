"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Badge } from "@/components/ui/badge";
import { ReferredCompany } from "@/types/employee-detail";
import { getEmployeeReferrals } from "@/lib/apis/employee-referrals";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { CommissionStatus } from "@/types/enums";
import { CompanyDetailDialog } from "./_company-detail-dialog";
import { ReferralHeader } from "./_referral-header";

interface ReferralsContentProps {
  employeeId: number;
  referralCode: string;
}

// Lấy className cho commission status badge
function getCommissionStatusClassName(status: CommissionStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "ELIGIBLE":
      return "bg-blue-100 text-blue-800";
    case "PAID":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
}

export function ReferralsContent({
  employeeId,
  referralCode,
}: ReferralsContentProps) {
  const t = useTranslations("referrals");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");

  const [data, setData] = useState<ReferredCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog state
  const [selectedCompany, setSelectedCompany] =
    useState<ReferredCompany | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEmployeeReferrals(employeeId, page);
      setData(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (company: ReferredCompany) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const columns: ColumnDef<ReferredCompany>[] = [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => page * 20 + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "companyName",
      header: t("table.companyName"),
    },
    {
      accessorKey: "planName",
      header: t("table.plan"),
      cell: ({ row }) => row.original.planName || "-",
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : ""
          }
        >
          {getEnumLabel("userStatus", row.original.status, tEnums)}
        </Badge>
      ),
    },
    {
      accessorKey: "currentBalance",
      header: t("table.balance"),
      cell: ({ row }) => formatCurrency(row.original.currentBalance),
    },
    {
      accessorKey: "totalBilling",
      header: t("table.totalBilling"),
      cell: ({ row }) => formatCurrency(row.original.totalBilling),
    },
    {
      accessorKey: "commissionStatus",
      header: t("table.commissionStatus"),
      cell: ({ row }) => {
        const status = row.original.commissionStatus;
        if (!status) return "-";
        return (
          <Badge
            variant="secondary"
            className={getCommissionStatusClassName(status)}
          >
            {getEnumLabel("commissionStatus", status, tEnums)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "companyCreatedAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => formatDate(row.original.companyCreatedAt),
    },
  ];

  if (loading) {
    return <div className="text-center py-8">{tCommon("loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header với mã giới thiệu và thống kê */}
      <ReferralHeader employeeId={employeeId} referralCode={referralCode} />

      {/* Bảng danh sách công ty đã giới thiệu */}
      <BaseTable
        columns={columns}
        data={data}
        noResultsText={t("noCompanies")}
        previousText={tCommon("previous")}
        nextText={tCommon("next")}
        onRowClick={handleRowClick}
        serverPagination={{
          page,
          totalPages,
          totalElements,
          onPageChange: setPage,
        }}
      />

      <CompanyDetailDialog
        company={selectedCompany}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
