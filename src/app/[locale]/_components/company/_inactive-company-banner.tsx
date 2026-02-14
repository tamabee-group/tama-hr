"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { reactivateSubscription } from "@/lib/apis/subscription";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

/**
 * Banner cảnh báo khi công ty bị INACTIVE do thanh toán thất bại
 */
export function InactiveCompanyBanner() {
  const t = useTranslations("common");
  const tErrors = useTranslations("errors");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { refreshUser } = useAuth();
  const [isReactivating, setIsReactivating] = useState(false);

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await reactivateSubscription();
      toast.success(t("inactiveCompany.reactivateSuccess"));
      // Refresh user để cập nhật companyStatus
      await refreshUser();
      router.refresh();
    } catch (error: unknown) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      if (errorCode === "INSUFFICIENT_BALANCE") {
        toast.error(t("inactiveCompany.insufficientBalance"));
      } else if (errorCode === "COMPANY_ALREADY_ACTIVE") {
        toast.info(t("inactiveCompany.alreadyActive"));
        await refreshUser();
        router.refresh();
      } else {
        toast.error(tErrors("common.serverError"));
      }
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t("inactiveCompany.title")}</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span>{t("inactiveCompany.description")}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/${locale}/dashboard/wallet`}>
              {t("inactiveCompany.depositNow")}
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleReactivate}
            disabled={isReactivating}
            className="w-fit"
          >
            {isReactivating && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("inactiveCompany.reactivate")}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
