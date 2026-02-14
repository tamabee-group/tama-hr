"use client";

import { schedulerApi } from "@/lib/apis/scheduler-api";
import { SchedulerAction } from "../_scheduler-action";

export function CleanupPageContent() {
  return (
    <SchedulerAction
      actionKey="companyCleanup"
      onExecute={() => schedulerApi.runCompanyCleanup()}
    />
  );
}
