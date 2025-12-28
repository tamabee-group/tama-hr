"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbConfig[] {
  // Remove locale from pathname (e.g., /vi/admin/tamabee/dashboard -> /admin/tamabee/dashboard)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, "/");

  // Check for dynamic routes - Tamabee
  if (pathWithoutLocale.match(/^\/tamabee\/users\/\d+$/)) {
    return [
      { label: "Admin", href: "/tamabee/dashboard" },
      { label: "Nhân sự", href: "/tamabee/users" },
      { label: "Chi tiết" },
    ];
  }

  // Check for dynamic routes - Company employees
  if (pathWithoutLocale.match(/^\/company\/employees\/\d+$/)) {
    return [
      { label: "Quản trị công ty", href: "/company/dashboard" },
      { label: "Nhân viên", href: "/company/employees" },
      { label: "Chi tiết" },
    ];
  }

  switch (pathWithoutLocale) {
    case "/tamabee/users":
      return [
        { label: "Admin", href: "/tamabee/dashboard" },
        { label: "Nhân sự" },
      ];

    case "/tamabee/users/register":
      return [
        { label: "Admin", href: "/tamabee/dashboard" },
        { label: "Nhân sự", href: "/tamabee/users" },
        { label: "Đăng ký mới" },
      ];

    case "/tamabee/companies":
      return [
        { label: "Admin", href: "/tamabee/dashboard" },
        { label: "Quản lý công ty" },
      ];

    case "/tamabee/deposits":
      return [
        { label: "Admin", href: "/tamabee/dashboard" },
        { label: "Yêu cầu nạp tiền" },
      ];

    case "/tamabee/plans":
      return [
        { label: "Admin", href: "/tamabee/dashboard" },
        { label: "Gói dịch vụ" },
      ];

    // Company Admin routes
    case "/company/dashboard":
      return [
        { label: "Quản trị công ty", href: "/company/dashboard" },
        { label: "Dashboard" },
      ];

    case "/company/employees":
      return [
        { label: "Quản trị công ty", href: "/company/dashboard" },
        { label: "Nhân viên" },
      ];

    case "/company/employees/create":
      return [
        { label: "Quản trị công ty", href: "/company/dashboard" },
        { label: "Nhân viên", href: "/company/employees" },
        { label: "Thêm mới" },
      ];

    case "/company/wallet":
      return [
        { label: "Quản trị công ty", href: "/company/dashboard" },
        { label: "Ví tiền" },
      ];

    case "/company/profile":
      return [
        { label: "Quản trị công ty", href: "/company/dashboard" },
        { label: "Thông tin công ty" },
      ];

    case "/company/settings":
      return [
        { label: "Quản trị công ty", href: "/company/dashboard" },
        { label: "Cài đặt" },
      ];

    default:
      return [{ label: "Admin" }];
  }
}

export function BreadcrumbRouter() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={`${breadcrumb.label}-${index}`}>
            <BreadcrumbItem>
              {breadcrumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
