"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { schedulerApi, type TenantInfo } from "@/lib/apis/scheduler-api";
import { SchedulerAction } from "../_scheduler-action";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";

export function PayrollPageContent() {
  const t = useTranslations("schedulers");
  const [tenants, setTenants] = useState<TenantInfo[]>([]);

  // Rollback form state
  const [rollbackCompanyId, setRollbackCompanyId] = useState("all");
  const [rollbackYear, setRollbackYear] = useState("");
  const [rollbackMonth, setRollbackMonth] = useState("");

  useEffect(() => {
    schedulerApi
      .getAllTenants()
      .then((data) => {
        if (data) setTenants(data);
      })
      .catch(() => toast.error("Failed to load tenants"));
  }, []);

  const handleRollbackPayroll = async () => {
    const params: { companyId?: number; year?: number; month?: number } = {};
    if (rollbackCompanyId !== "all")
      params.companyId = parseInt(rollbackCompanyId);
    if (rollbackYear) params.year = parseInt(rollbackYear);
    if (rollbackMonth) params.month = parseInt(rollbackMonth);
    return schedulerApi.rollbackPayroll(params);
  };

  return (
    <div className="space-y-8">
      <BackButton />

      {/* Payroll Payment */}
      <SchedulerAction
        actionKey="payrollPayment"
        onExecute={() => schedulerApi.runPayrollPayment()}
      />

      {/* Rollback Payroll */}
      <SchedulerAction
        actionKey="rollbackPayroll"
        onExecute={handleRollbackPayroll}
        variant="warning"
      >
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">
              {t("actions.rollbackPayroll.companyId")}
            </Label>
            <Select
              value={rollbackCompanyId}
              onValueChange={setRollbackCompanyId}
            >
              <SelectTrigger className="h-9 mt-1">
                <SelectValue
                  placeholder={t("actions.rollbackPayroll.allCompanies")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("actions.rollbackPayroll.allCompanies")}
                </SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id.toString()}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">
              {t("actions.rollbackPayroll.year")}
            </Label>
            <Input
              type="number"
              placeholder="2025"
              value={rollbackYear}
              onChange={(e) => setRollbackYear(e.target.value)}
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">
              {t("actions.rollbackPayroll.month")}
            </Label>
            <Input
              type="number"
              placeholder="1-12"
              min="1"
              max="12"
              value={rollbackMonth}
              onChange={(e) => setRollbackMonth(e.target.value)}
              className="h-9 mt-1"
            />
          </div>
        </div>
      </SchedulerAction>
    </div>
  );
}
