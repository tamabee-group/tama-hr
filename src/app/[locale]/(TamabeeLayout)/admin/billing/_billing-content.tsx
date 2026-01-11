"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  triggerBilling,
  setupBillingTest,
  checkFreeTrial,
} from "@/lib/apis/billing";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function BillingContent() {
  const t = useTranslations("billing");
  const tErrors = useTranslations("errors");

  const [loading, setLoading] = useState<string | null>(null);

  // Setup test form
  const [companyId, setCompanyId] = useState("1");
  const [daysAgo, setDaysAgo] = useState("1");
  const [balance, setBalance] = useState("10000");

  // Free trial check
  const [checkCompanyId, setCheckCompanyId] = useState("1");
  const [freeTrialResult, setFreeTrialResult] = useState<boolean | null>(null);

  // Trigger billing
  const handleTriggerBilling = async () => {
    setLoading("trigger");
    try {
      await triggerBilling();
      toast.success(t("triggerSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
    } finally {
      setLoading(null);
    }
  };

  // Setup test data
  const handleSetupTest = async () => {
    setLoading("setup");
    try {
      await setupBillingTest(
        parseInt(companyId),
        parseInt(daysAgo),
        parseInt(balance),
      );
      toast.success(t("setupSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
    } finally {
      setLoading(null);
    }
  };

  // Check free trial
  const handleCheckFreeTrial = async () => {
    setLoading("check");
    try {
      const isInFreeTrial = await checkFreeTrial(parseInt(checkCompanyId));
      setFreeTrialResult(isInFreeTrial);
      toast.success(isInFreeTrial ? t("inFreeTrial") : t("notInFreeTrial"));
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
      setFreeTrialResult(null);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Trigger Billing */}
      <Card>
        <CardHeader>
          <CardTitle>{t("triggerBilling")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("triggerDescription")}
          </p>
          <Button
            onClick={handleTriggerBilling}
            disabled={loading === "trigger"}
            className="w-full"
          >
            {loading === "trigger" ? t("processing") : t("triggerNow")}
          </Button>
        </CardContent>
      </Card>

      {/* Setup Test Data */}
      <Card>
        <CardHeader>
          <CardTitle>{t("setupTest")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("companyId")}</Label>
            <Input
              type="number"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("daysAgo")}</Label>
            <Input
              type="number"
              value={daysAgo}
              onChange={(e) => setDaysAgo(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("balance")}</Label>
            <Input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="10000"
            />
          </div>
          <Button
            onClick={handleSetupTest}
            disabled={loading === "setup"}
            variant="secondary"
            className="w-full"
          >
            {loading === "setup" ? t("processing") : t("setupNow")}
          </Button>
        </CardContent>
      </Card>

      {/* Check Free Trial */}
      <Card>
        <CardHeader>
          <CardTitle>{t("checkFreeTrial")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("companyId")}</Label>
            <Input
              type="number"
              value={checkCompanyId}
              onChange={(e) => setCheckCompanyId(e.target.value)}
              placeholder="1"
            />
          </div>
          <Button
            onClick={handleCheckFreeTrial}
            disabled={loading === "check"}
            variant="outline"
            className="w-full"
          >
            {loading === "check" ? t("processing") : t("checkNow")}
          </Button>
          {freeTrialResult !== null && (
            <div
              className={`p-3 rounded-md text-sm ${
                freeTrialResult
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {freeTrialResult ? t("inFreeTrial") : t("notInFreeTrial")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
