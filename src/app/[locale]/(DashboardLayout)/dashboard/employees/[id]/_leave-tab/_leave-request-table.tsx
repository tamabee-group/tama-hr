"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LeaveRequest } from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";

interface LeaveRequestTableProps {
  requests: PaginatedResponse<LeaveRequest> | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function LeaveRequestTable({
  requests,
  page,
  pageSize,
  onPageChange,
}: LeaveRequestTableProps) {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  if (!requests || requests.content.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground px-6">
        {t("messages.noRequests")}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "border-green-500 text-green-600";
      case "PENDING":
        return "border-yellow-500 text-yellow-600";
      case "REJECTED":
        return "border-red-500 text-red-600";
      case "CANCELLED":
        return "border-gray-500 text-gray-600";
      default:
        return "";
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">STT</TableHead>
            <TableHead>{t("table.type")}</TableHead>
            <TableHead>{t("table.startDate")}</TableHead>
            <TableHead>{t("table.endDate")}</TableHead>
            <TableHead>{t("table.days")}</TableHead>
            <TableHead>{t("table.reason")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead>{t("table.approvedBy")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.content.map((request, index) => (
            <TableRow key={request.id}>
              <TableCell>{page * pageSize + index + 1}</TableCell>
              <TableCell>
                {getEnumLabel("leaveType", request.leaveType, tEnums)}
              </TableCell>
              <TableCell>{formatDate(request.startDate)}</TableCell>
              <TableCell>{formatDate(request.endDate)}</TableCell>
              <TableCell>{request.totalDays}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {request.reason || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(getStatusColor(request.status))}
                >
                  {getEnumLabel("leaveStatus", request.status, tEnums)}
                </Badge>
              </TableCell>
              <TableCell>{request.approverName || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {requests.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            {tCommon("pagination", {
              from: page * pageSize + 1,
              to: Math.min((page + 1) * pageSize, requests.totalElements),
              total: requests.totalElements,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {page + 1} / {requests.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= requests.totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
