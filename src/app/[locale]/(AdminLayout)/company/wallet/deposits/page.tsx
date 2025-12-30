"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { DepositTable } from "../_deposit-table";
import { DepositForm } from "../_deposit-form";
import { ImageModal } from "../_image-modal";

/**
 * Trang danh sách yêu cầu nạp tiền của Company
 * - Hiển thị Deposit_Table với filter và pagination
 * - Nút tạo yêu cầu nạp tiền mới
 */
export default function CompanyDepositsPage() {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const [depositFormOpen, setDepositFormOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Labels theo locale
  const labels = {
    vi: {
      title: "Yêu cầu nạp tiền",
      description: "Quản lý các yêu cầu nạp tiền của công ty",
      createDeposit: "Tạo yêu cầu nạp tiền",
    },
    en: {
      title: "Deposit Requests",
      description: "Manage company deposit requests",
      createDeposit: "Create Deposit Request",
    },
    ja: {
      title: "入金リクエスト",
      description: "会社の入金リクエストを管理",
      createDeposit: "入金リクエストを作成",
    },
  };

  const t = labels[locale];

  const handleViewImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageModalOpen(true);
  };

  const handleDepositSuccess = () => {
    // Trigger refresh của DepositTable
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
        </div>
        <Button
          size="sm"
          onClick={() => setDepositFormOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.createDeposit}
        </Button>
      </div>

      {/* Deposit Table */}
      <DepositTable
        locale={locale}
        onViewImage={handleViewImage}
        refreshTrigger={refreshTrigger}
      />

      {/* Deposit Form Dialog */}
      <DepositForm
        open={depositFormOpen}
        onOpenChange={setDepositFormOpen}
        onSuccess={handleDepositSuccess}
        locale={locale}
      />

      {/* Image Modal */}
      <ImageModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        imageUrl={selectedImageUrl}
        locale={locale}
      />
    </div>
  );
}
