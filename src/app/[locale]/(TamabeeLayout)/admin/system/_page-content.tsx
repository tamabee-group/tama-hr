"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface ApiGroup {
  key: string;
  path: string;
  apis: { method: string; endpoint: string }[];
}

const API_GROUPS: ApiGroup[] = [
  {
    key: "payroll",
    path: "/admin/system/payroll",
    apis: [
      { method: "POST", endpoint: "/api/admin/schedulers/payroll-payment" },
      { method: "POST", endpoint: "/api/admin/schedulers/rollback-payroll" },
    ],
  },
  {
    key: "billing",
    path: "/admin/system/billing",
    apis: [{ method: "POST", endpoint: "/api/admin/schedulers/billing" }],
  },
  {
    key: "contracts",
    path: "/admin/system/contracts",
    apis: [
      { method: "POST", endpoint: "/api/admin/schedulers/contract-expiry" },
    ],
  },
  {
    key: "cleanup",
    path: "/admin/system/cleanup",
    apis: [
      { method: "POST", endpoint: "/api/admin/schedulers/company-cleanup" },
    ],
  },
  {
    key: "tenants",
    path: "/admin/system/tenants",
    apis: [
      { method: "POST", endpoint: "/api/admin/schedulers/tenant-cleanup" },
    ],
  },
];

export function SchedulersPageContent() {
  const t = useTranslations("schedulers");
  const router = useRouter();

  return (
    <div className="space-y-4">
      <GlassSection title={t("overview")}>
        <div className="space-y-2">
          {API_GROUPS.map((group) => (
            <div
              key={group.key}
              onClick={() => router.push(group.path)}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{t(`subPages.${group.key}`)}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`groups.${group.key}`)}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {group.apis.map((api) => (
                    <div key={api.endpoint} className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-blue-500/10 text-blue-500"
                      >
                        {api.method}
                      </Badge>
                      <code className="text-xs text-muted-foreground">
                        {api.endpoint}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
            </div>
          ))}
        </div>
      </GlassSection>
    </div>
  );
}
