"use client";

import { schedulerApi } from "@/lib/apis/scheduler-api";
import { SchedulerAction } from "../_scheduler-action";

export function TenantsPageContent() {
  return (
    <SchedulerAction
      actionKey="tenantCleanup"
      onExecute={() => schedulerApi.runTenantCleanup()}
    />
  );
}
