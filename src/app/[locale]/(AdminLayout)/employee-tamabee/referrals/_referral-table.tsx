"use client";

import { useState, useEffect, useCallback } from "react";
import { Pagination } from "@/app/[locale]/_components/_base/_pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { ReferredCompany, ReferralFilterRequest } from "@/types/referral";
import { referralApi } from "@/lib/apis/referral-api";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  CommissionStatus,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
} from "@/types/enums";

interface ReferralTableProps {
  onRowClick: (company: ReferredCompany) => void;
  refreshTrigger?: number;
}

// Định nghĩa headers cho table
const TABLE_HEADERS = [
  "Tên công ty",
  "Gói dịch vụ",
  "Trạng thái",
  "Số dư",
  "Tổng nạp",
  "Tổng billing",
  "Trạng thái hoa hồng",
];

/**
 * Component bảng hiển thị danh sách công ty đã giới thiệu
 * Columns: Company name, Plan, Status, Balance, Deposits, Billing, Commission Status
 * @client-only
 */
export function ReferralTable({
  onRowClick,
  refreshTrigger,
}: ReferralTableProps) {
  const [companies, setCompanies] = useState<ReferredCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch danh sách companies
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const filter: ReferralFilterRequest = {};
      if (searchTerm.trim()) {
        filter.search = searchTerm.trim();
      }

      const response = await referralApi.getReferredCompanies(
        filter,
        page,
        DEFAULT_PAGE_SIZE,
      );
      setCompanies(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch referred companies:", error);
      handleApiError(error, {
        defaultMessage: "Không thể tải danh sách công ty đã giới thiệu",
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies, refreshTrigger]);

  // Xử lý search
  const handleSearch = () => {
    setPage(0);
    loadCompanies();
  };

  // Xử lý khi nhấn Enter trong search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Lấy className cho commission status badge
  const getCommissionBadgeClassName = (status: CommissionStatus): string => {
    const color = COMMISSION_STATUS_COLORS[status] || "warning";
    if (color === "warning") {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
    }
    if (color === "info") {
      return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200";
    }
    if (color === "success") {
      return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200";
    }
    return "";
  };

  // Loading skeleton
  if (loading && companies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {companies.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Bạn chưa giới thiệu công ty nào
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {TABLE_HEADERS.map((header, index) => (
                  <th
                    key={index}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.companyId}
                  className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick(company)}
                >
                  <td className="p-4">
                    <div className="font-medium">{company.companyName}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{company.planName}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={
                        company.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                          : ""
                      }
                    >
                      {company.status === "ACTIVE"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {formatCurrency(company.currentBalance, "vi")}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(company.totalDeposits, "vi")}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(company.totalBilling, "vi")}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={getCommissionBadgeClassName(
                        company.commissionStatus,
                      )}
                    >
                      {COMMISSION_STATUS_LABELS[company.commissionStatus]?.vi ||
                        company.commissionStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
