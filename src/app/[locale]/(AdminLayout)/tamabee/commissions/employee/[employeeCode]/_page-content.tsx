"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { commissionApi } from "@/lib/apis/commission-api";
import { getCompanyById } from "@/lib/apis/admin-companies";
import { CommissionResponse } from "@/types/commission";
import { Company } from "@/types/company";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getCommissionStatusLabel, CommissionStatus } from "@/types/enums";
import { CompanyDetailDialog } from "./_company-detail-dialog";

interface Props {
  employeeCode: string;
}

/**
 * Nội dung trang chi tiết hoa hồng theo nhân viên
 * Hiển thị danh sách công ty mà nhân viên đó giới thiệu
 */
export function EmployeeCommissionDetailContent({ employeeCode }: Props) {
  const router = useRouter();
  const [commissions, setCommissions] = useState<CommissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState<string>("");

  // State cho dialog công ty
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Fetch commissions của nhân viên
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await commissionApi.getAll(
          { employeeCode },
          0,
          100, // Lấy tối đa 100 records
        );
        setCommissions(response.content);
        // Lấy tên nhân viên từ commission đầu tiên
        if (response.content.length > 0) {
          setEmployeeName(response.content[0].employeeName);
        }
      } catch (error) {
        console.error("Failed to fetch commissions:", error);
        toast.error("Không thể tải dữ liệu hoa hồng");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeCode]);

  // Xử lý click vào công ty
  const handleCompanyClick = async (companyId: number) => {
    setLoadingCompany(true);
    try {
      const company = await getCompanyById(companyId);
      setSelectedCompany(company);
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch company:", error);
      toast.error("Không thể tải thông tin công ty");
    } finally {
      setLoadingCompany(false);
    }
  };

  // Lấy màu badge theo status
  const getStatusVariant = (status: CommissionStatus) => {
    switch (status) {
      case "PAID":
        return "default";
      case "ELIGIBLE":
        return "secondary";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  // Tính tổng hoa hồng
  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);
  const eligibleAmount = commissions
    .filter((c) => c.status === "ELIGIBLE")
    .reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{employeeName || employeeCode}</h1>
          <p className="text-sm text-muted-foreground">
            Mã nhân viên: {employeeCode} • {commissions.length} công ty giới
            thiệu
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">Chờ đủ điều kiện</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(pendingAmount, "vi")}
            </p>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(eligibleAmount, "vi")}
            </p>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount, "vi")}
            </p>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">Tổng hoa hồng</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalAmount, "vi")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Danh sách công ty giới thiệu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">Công ty</th>
                <th className="text-right py-3 px-4 font-medium">Hoa hồng</th>
                <th className="text-center py-3 px-4 font-medium">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 font-medium">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Chưa có công ty nào được giới thiệu
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr
                    key={commission.id}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleCompanyClick(commission.companyId)}
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-primary hover:underline">
                        {commission.companyName}
                      </p>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {formatCurrency(commission.amount, "vi")}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={getStatusVariant(commission.status)}>
                        {getCommissionStatusLabel(commission.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDateTime(commission.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Detail Dialog */}
      <CompanyDetailDialog
        company={selectedCompany}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Loading overlay khi đang fetch company */}
      {loadingCompany && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
}
