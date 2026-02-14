"use client";

import { schedulerApi } from "@/lib/apis/scheduler-api";
import { SchedulerAction } from "../_scheduler-action";

export function BillingPageContent() {
  return (
    <SchedulerAction
      actionKey="billing"
      onExecute={() => schedulerApi.runBilling()}
    />
  );
}
