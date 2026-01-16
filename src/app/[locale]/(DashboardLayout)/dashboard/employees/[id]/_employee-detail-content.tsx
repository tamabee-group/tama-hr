"use client";

import { useState, useCallback, Suspense, lazy } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types/user";
import { EmployeeDetailTab } from "@/types/employee-detail";
import { EmployeeHeader } from "./_employee-header";

// Lazy load tab contents
const PersonalInfoContent = lazy(() =>
  import("./_personal-info-tab/_personal-info-content").then((mod) => ({
    default: mod.PersonalInfoContent,
  })),
);
const AttendanceContent = lazy(() =>
  import("./_attendance-tab/_attendance-content").then((mod) => ({
    default: mod.AttendanceContent,
  })),
);
const SalaryContent = lazy(() =>
  import("./_salary-tab/_salary-content").then((mod) => ({
    default: mod.SalaryContent,
  })),
);
const ContractsContent = lazy(() =>
  import("./_contracts-tab/_contracts-content").then((mod) => ({
    default: mod.ContractsContent,
  })),
);
const LeaveContent = lazy(() =>
  import("./_leave-tab/_leave-content").then((mod) => ({
    default: mod.LeaveContent,
  })),
);
const DocumentsContent = lazy(() =>
  import("./_documents-tab/_documents-content").then((mod) => ({
    default: mod.DocumentsContent,
  })),
);
const ReferralsContent = lazy(() =>
  import("./_referrals-tab/_referrals-content").then((mod) => ({
    default: mod.ReferralsContent,
  })),
);

interface EmployeeDetailContentProps {
  employee: User;
  initialTab?: string;
}

// Loading skeleton cho tab content
function TabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

// Kiểm tra employee đang xem có phải Tamabee không
// Tab referrals chỉ hiển thị cho nhân viên Tamabee
function isTamabeeEmployee(employee: User): boolean {
  return employee.companyId === 0 || employee.role.includes("TAMABEE");
}

export function EmployeeDetailContent({
  employee,
  initialTab,
}: EmployeeDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("employeeDetail");

  // Lấy tab từ URL hoặc dùng default
  const currentTab =
    (searchParams.get("tab") as EmployeeDetailTab) ||
    initialTab ||
    EmployeeDetailTab.PERSONAL_INFO;

  // Track loaded tabs để tránh re-fetch
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    new Set([currentTab]),
  );

  // Xử lý chuyển tab và sync URL
  const handleTabChange = useCallback(
    (tab: string) => {
      // Update URL với tab parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`?${params.toString()}`, { scroll: false });

      // Mark tab as loaded
      setLoadedTabs((prev) => new Set([...prev, tab]));
    },
    [router, searchParams],
  );

  const showReferralsTab = isTamabeeEmployee(employee);

  return (
    <div className="space-y-6">
      {/* Header */}
      <EmployeeHeader employee={employee} />

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full max-w-[1200px] mx-auto"
      >
        <TabsList className="w-full overflow-x-auto flex justify-start gap-1 h-auto p-1">
          <TabsTrigger
            value={EmployeeDetailTab.PERSONAL_INFO}
            className="shrink-0"
          >
            {t("tabs.personalInfo")}
          </TabsTrigger>
          <TabsTrigger
            value={EmployeeDetailTab.ATTENDANCE}
            className="shrink-0"
          >
            {t("tabs.attendance")}
          </TabsTrigger>
          <TabsTrigger value={EmployeeDetailTab.SALARY} className="shrink-0">
            {t("tabs.salary")}
          </TabsTrigger>
          <TabsTrigger value={EmployeeDetailTab.CONTRACTS} className="shrink-0">
            {t("tabs.contracts")}
          </TabsTrigger>
          <TabsTrigger value={EmployeeDetailTab.LEAVE} className="shrink-0">
            {t("tabs.leave")}
          </TabsTrigger>
          <TabsTrigger value={EmployeeDetailTab.DOCUMENTS} className="shrink-0">
            {t("tabs.documents")}
          </TabsTrigger>
          {showReferralsTab && (
            <TabsTrigger
              value={EmployeeDetailTab.REFERRALS}
              className="shrink-0"
            >
              {t("tabs.referrals")}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value={EmployeeDetailTab.PERSONAL_INFO} className="mt-6">
          {loadedTabs.has(EmployeeDetailTab.PERSONAL_INFO) && (
            <Suspense fallback={<TabSkeleton />}>
              <PersonalInfoContent employee={employee} />
            </Suspense>
          )}
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value={EmployeeDetailTab.ATTENDANCE} className="mt-6">
          {loadedTabs.has(EmployeeDetailTab.ATTENDANCE) && (
            <Suspense fallback={<TabSkeleton />}>
              <AttendanceContent employeeId={employee.id} />
            </Suspense>
          )}
        </TabsContent>

        {/* Salary Tab */}
        <TabsContent value={EmployeeDetailTab.SALARY} className="mt-6">
          {loadedTabs.has(EmployeeDetailTab.SALARY) && (
            <Suspense fallback={<TabSkeleton />}>
              <SalaryContent employeeId={employee.id} />
            </Suspense>
          )}
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value={EmployeeDetailTab.CONTRACTS} className="mt-6">
          {loadedTabs.has(EmployeeDetailTab.CONTRACTS) && (
            <Suspense fallback={<TabSkeleton />}>
              <ContractsContent employeeId={employee.id} />
            </Suspense>
          )}
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value={EmployeeDetailTab.LEAVE} className="mt-6">
          {loadedTabs.has(EmployeeDetailTab.LEAVE) && (
            <Suspense fallback={<TabSkeleton />}>
              <LeaveContent employeeId={employee.id} />
            </Suspense>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value={EmployeeDetailTab.DOCUMENTS} className="mt-6">
          {loadedTabs.has(EmployeeDetailTab.DOCUMENTS) && (
            <Suspense fallback={<TabSkeleton />}>
              <DocumentsContent employeeId={employee.id} />
            </Suspense>
          )}
        </TabsContent>

        {/* Referrals Tab - chỉ hiển thị cho nhân viên Tamabee */}
        {showReferralsTab && (
          <TabsContent value={EmployeeDetailTab.REFERRALS} className="mt-6">
            {loadedTabs.has(EmployeeDetailTab.REFERRALS) && (
              <Suspense fallback={<TabSkeleton />}>
                <ReferralsContent
                  employeeId={employee.id}
                  referralCode={employee.profile?.referralCode || ""}
                />
              </Suspense>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
