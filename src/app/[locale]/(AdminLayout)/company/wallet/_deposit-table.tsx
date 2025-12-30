"use client";

import { SharedDepositTable } from "@/app/[locale]/(AdminLayout)/_components/_shared/_deposit-table";
import { depositApi } from "@/lib/apis/deposit-api";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface DepositTableProps {
  locale?: SupportedLocale;
  onViewImage?: (imageUrl: string) => void;
  refreshTrigger?: number;
}

/**
 * Component bảng hiển thị danh sách yêu cầu nạp tiền (Company version)
 * Sử dụng SharedDepositTable với API getMyRequests
 */
export function DepositTable({
  locale = "vi",
  onViewImage,
  refreshTrigger,
}: DepositTableProps) {
  return (
    <SharedDepositTable
      fetchDeposits={(filter, page, size) =>
        depositApi.getMyRequests(filter, page, size)
      }
      locale={locale}
      onViewImage={onViewImage}
      refreshTrigger={refreshTrigger}
    />
  );
}
