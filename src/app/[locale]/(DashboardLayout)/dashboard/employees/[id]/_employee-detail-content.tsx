"use client";

import { useState, useCallback, Suspense, lazy } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
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

  // Tạo danh sách tabs
  const tabs = [
    { value: EmployeeDetailTab.PERSONAL_INFO, label: t("tabs.personalInfo") },
    { value: EmployeeDetailTab.ATTENDANCE, label: t("tabs.attendance") },
    { value: EmployeeDetailTab.SALARY, label: t("tabs.salary") },
    { value: EmployeeDetailTab.CONTRACTS, label: t("tabs.contracts") },
    { value: EmployeeDetailTab.LEAVE, label: t("tabs.leave") },
    { value: EmployeeDetailTab.DOCUMENTS, label: t("tabs.documents") },
    ...(showReferralsTab
      ? [{ value: EmployeeDetailTab.REFERRALS, label: t("tabs.referrals") }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <EmployeeHeader employee={employee} />

      {/* Tabs */}
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <GlassTabs tabs={tabs} value={currentTab} onChange={handleTabChange} />

        {/* Personal Info Tab */}
        {currentTab === EmployeeDetailTab.PERSONAL_INFO &&
          loadedTabs.has(EmployeeDetailTab.PERSONAL_INFO) && (
            <Suspense fallback={<TabSkeleton />}>
              <PersonalInfoContent employee={employee} />
            </Suspense>
          )}

        {/* Attendance Tab */}
        {currentTab === EmployeeDetailTab.ATTENDANCE &&
          loadedTabs.has(EmployeeDetailTab.ATTENDANCE) && (
            <Suspense fallback={<TabSkeleton />}>
              <AttendanceContent employeeId={employee.id} />
            </Suspense>
          )}

        {/* Salary Tab */}
        {currentTab === EmployeeDetailTab.SALARY &&
          loadedTabs.has(EmployeeDetailTab.SALARY) && (
            <Suspense fallback={<TabSkeleton />}>
              <SalaryContent employeeId={employee.id} />
            </Suspense>
          )}

        {/* Contracts Tab */}
        {currentTab === EmployeeDetailTab.CONTRACTS &&
          loadedTabs.has(EmployeeDetailTab.CONTRACTS) && (
            <Suspense fallback={<TabSkeleton />}>
              <ContractsContent employeeId={employee.id} employee={employee} />
            </Suspense>
          )}

        {/* Leave Tab */}
        {currentTab === EmployeeDetailTab.LEAVE &&
          loadedTabs.has(EmployeeDetailTab.LEAVE) && (
            <Suspense fallback={<TabSkeleton />}>
              <LeaveContent employeeId={employee.id} />
            </Suspense>
          )}

        {/* Documents Tab */}
        {currentTab === EmployeeDetailTab.DOCUMENTS &&
          loadedTabs.has(EmployeeDetailTab.DOCUMENTS) && (
            <Suspense fallback={<TabSkeleton />}>
              <DocumentsContent employeeId={employee.id} />
            </Suspense>
          )}

        {/* Referrals Tab - chỉ hiển thị cho nhân viên Tamabee */}
        {showReferralsTab &&
          currentTab === EmployeeDetailTab.REFERRALS &&
          loadedTabs.has(EmployeeDetailTab.REFERRALS) && (
            <Suspense fallback={<TabSkeleton />}>
              <ReferralsContent
                employeeId={employee.id}
                referralCode={employee.profile?.referralCode || ""}
              />
            </Suspense>
          )}
      </div>
    </div>
  );
}
