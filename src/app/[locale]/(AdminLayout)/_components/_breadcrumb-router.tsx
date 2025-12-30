"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  labelKey: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbConfig[] {
  // Remove locale from pathname (e.g., /vi/admin/tamabee/dashboard -> /admin/tamabee/dashboard)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, "/");

  // Check for dynamic routes - Tamabee
  if (pathWithoutLocale.match(/^\/tamabee\/users\/\d+$/)) {
    return [
      { labelKey: "admin", href: "/tamabee/dashboard" },
      { labelKey: "users", href: "/tamabee/users" },
      { labelKey: "detail" },
    ];
  }

  // Check for dynamic routes - Company employees
  if (pathWithoutLocale.match(/^\/company\/employees\/\d+$/)) {
    return [
      { labelKey: "companyAdmin", href: "/company/dashboard" },
      { labelKey: "employees", href: "/company/employees" },
      { labelKey: "detail" },
    ];
  }

  switch (pathWithoutLocale) {
    case "/tamabee/users":
      return [
        { labelKey: "admin", href: "/tamabee/dashboard" },
        { labelKey: "users" },
      ];

    case "/tamabee/users/register":
      return [
        { labelKey: "admin", href: "/tamabee/dashboard" },
        { labelKey: "users", href: "/tamabee/users" },
        { labelKey: "registerNew" },
      ];

    case "/tamabee/companies":
      return [
        { labelKey: "admin", href: "/tamabee/dashboard" },
        { labelKey: "companyManagement" },
      ];

    case "/tamabee/deposits":
      return [
        { labelKey: "admin", href: "/tamabee/dashboard" },
        { labelKey: "depositRequests" },
      ];

    case "/tamabee/plans":
      return [
        { labelKey: "admin", href: "/tamabee/dashboard" },
        { labelKey: "plans" },
      ];

    // Company Admin routes
    case "/company/dashboard":
      return [
        { labelKey: "companyAdmin", href: "/company/dashboard" },
        { labelKey: "dashboard" },
      ];

    case "/company/employees":
      return [
        { labelKey: "companyAdmin", href: "/company/dashboard" },
        { labelKey: "employees" },
      ];

    case "/company/employees/create":
      return [
        { labelKey: "companyAdmin", href: "/company/dashboard" },
        { labelKey: "employees", href: "/company/employees" },
        { labelKey: "addNew" },
      ];

    case "/company/wallet":
      return [
        { labelKey: "companyAdmin", href: "/company/dashboard" },
        { labelKey: "wallet" },
      ];

    case "/company/profile":
      return [
        { labelKey: "companyAdmin", href: "/company/dashboard" },
        { labelKey: "companyInfo" },
      ];

    case "/company/settings":
      return [
        { labelKey: "companyAdmin", href: "/company/dashboard" },
        { labelKey: "settings" },
      ];

    default:
      return [{ labelKey: "admin" }];
  }
}

export function BreadcrumbRouter() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumb");
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={`${breadcrumb.labelKey}-${index}`}>
            <BreadcrumbItem>
              {breadcrumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href}>{t(breadcrumb.labelKey)}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{t(breadcrumb.labelKey)}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
