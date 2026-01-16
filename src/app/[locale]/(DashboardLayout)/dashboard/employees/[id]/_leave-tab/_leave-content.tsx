"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveRequest, LeaveBalance } from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";
import {
  getEmployeeLeaveRequests,
  getEmployeeLeaveBalance,
} from "@/lib/apis/employee-detail-api";
import { LeaveBalanceCards } from "./_leave-balance-cards";
import { LeaveRequestTable } from "./_leave-request-table";

interface LeaveContentProps {
  employeeId: number;
}

export function LeaveContent({ employeeId }: LeaveContentProps) {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");

  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] =
    useState<PaginatedResponse<LeaveRequest> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [balanceData, requestsData] = await Promise.all([
        getEmployeeLeaveBalance(employeeId),
        getEmployeeLeaveRequests(employeeId, page, pageSize),
      ]);
      setLeaveBalance(balanceData || []);
      setLeaveRequests(requestsData);
    } catch (error) {
      console.error("Error fetching leave data:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, page, tCommon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch chỉ requests khi đổi trang
  const fetchRequests = useCallback(async () => {
    try {
      const requestsData = await getEmployeeLeaveRequests(
        employeeId,
        page,
        pageSize,
      );
      setLeaveRequests(requestsData);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  }, [employeeId, page]);

  useEffect(() => {
    if (!isLoading) {
      fetchRequests();
    }
  }, [page, fetchRequests, isLoading]);

  if (isLoading) {
    return <LeaveSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Leave Balance Cards */}
      <LeaveBalanceCards balances={leaveBalance} />

      {/* Leave Request History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("leaveHistory")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <LeaveRequestTable
            requests={leaveRequests}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LeaveSkeleton() {
  return (
    <div className="space-y-6">
      {/* Balance cards skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
