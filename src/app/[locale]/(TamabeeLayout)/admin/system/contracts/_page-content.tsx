"use client";

import { schedulerApi } from "@/lib/apis/scheduler-api";
import { SchedulerAction } from "../_scheduler-action";

export function ContractsPageContent() {
  return (
    <SchedulerAction
      actionKey="contractExpiry"
      onExecute={() => schedulerApi.runContractExpiry()}
    />
  );
}
