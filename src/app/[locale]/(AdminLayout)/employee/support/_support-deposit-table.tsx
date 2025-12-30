"use client";

import { useState } from "react";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { depositApi } from "@/lib/apis/deposit-api";
import { DepositFilterRequest } from "@/types/deposit";
import { SharedDepositTable } from "@/app/[locale]/(AdminLayout)/_components/_shared/_deposit-table";
import { ImageModal } from "@/app/[locale]/(AdminLayout)/company/wallet/_image-modal";

interface SupportDepositTableProps {
  companyId: number;
  locale?: SupportedLocale;
  refreshTrigger?: number;
}

/**
 * Deposit table cho Employee Support (read-only)
 * Sử dụng SharedDepositTable với filter theo companyId
 */
export function SupportDepositTable({
  companyId,
  locale = "vi",
  refreshTrigger,
}: SupportDepositTableProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  /** Fetch deposits với filter theo companyId */
  const fetchDeposits = async (
    filter: DepositFilterRequest,
    page: number,
    size: number,
  ) => {
    return depositApi.getAll({ ...filter, companyId }, page, size);
  };

  /** Xử lý xem ảnh chứng minh */
  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  return (
    <>
      <SharedDepositTable
        fetchDeposits={fetchDeposits}
        locale={locale}
        onViewImage={handleViewImage}
        refreshTrigger={refreshTrigger}
      />

      {/* Image Modal */}
      <ImageModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        imageUrl={selectedImage}
      />
    </>
  );
}
