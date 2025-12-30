"use client";

import { useState, useEffect } from "react";
import { Company, INDUSTRY_LABELS, LOCALE_LABELS } from "@/types/company";
import { WalletResponse } from "@/types/wallet";
import { formatDateTime, formatDate } from "@/lib/utils/format-date";
import { formatCurrency } from "@/lib/utils/format-currency";
import { walletApi } from "@/lib/apis/wallet-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Props {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog hiển thị thông tin chi tiết công ty và billing
 */
export function CompanyDetailDialog({ company, open, onOpenChange }: Props) {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Fetch wallet khi dialog mở
  useEffect(() => {
    if (open && company) {
      const fetchWallet = async () => {
        setLoadingWallet(true);
        try {
          const data = await walletApi.getByCompanyId(company.id);
          setWallet(data);
        } catch (error) {
          console.error("Failed to fetch wallet:", error);
          setWallet(null);
        } finally {
          setLoadingWallet(false);
        }
      };
      fetchWallet();
    }
  }, [open, company]);

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Chủ sở hữu</p>
                <p className="font-medium">{company.ownerName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ngành nghề</p>
                <p className="font-medium">
                  {INDUSTRY_LABELS[company.industry] || company.industry || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{company.email || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Điện thoại</p>
                <p className="font-medium">{company.phone || "-"}</p>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Địa chỉ
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{company.address || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mã bưu điện</p>
                <p className="font-medium">{company.zipcode || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Khu vực</p>
                <p className="font-medium">
                  {LOCALE_LABELS[company.locale] || company.locale || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin billing */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Thông tin thanh toán
            </h4>
            {loadingWallet ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : wallet ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Số dư ví</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(wallet.balance, "vi")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gói dịch vụ</p>
                  <p className="font-medium">{wallet.planName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Billing gần nhất</p>
                  <p className="font-medium">
                    {wallet.lastBillingDate
                      ? formatDate(wallet.lastBillingDate)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Billing tiếp theo</p>
                  <p className="font-medium">
                    {wallet.nextBillingDate
                      ? formatDate(wallet.nextBillingDate)
                      : "-"}
                  </p>
                </div>
                {wallet.isFreeTrialActive && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Dùng thử</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Đang dùng thử</Badge>
                      <span className="text-sm">
                        đến {formatDate(wallet.freeTrialEndDate)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có thông tin ví
              </p>
            )}
          </div>

          {/* Thông tin giới thiệu */}
          {company.referredByEmployeeCode && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Người giới thiệu
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Mã nhân viên</p>
                  <p className="font-medium">
                    {company.referredByEmployeeCode}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tên nhân viên</p>
                  <p className="font-medium">
                    {company.referredByEmployeeName || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thời gian */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Thời gian
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">
                  {formatDateTime(company.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cập nhật lần cuối</p>
                <p className="font-medium">
                  {formatDateTime(company.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
