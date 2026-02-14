"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmploymentContract } from "@/types/attendance-records";
import { getExpiringContracts } from "@/lib/apis/contract-api";
import { formatDate } from "@/lib/utils/format-date-time";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface ExpiringContractsBadgeProps {
  onViewContract: (contract: EmploymentContract) => void;
}

/**
 * Component hiển thị notification badge cho hợp đồng sắp hết hạn
 * Hiển thị số lượng và danh sách contracts sắp hết hạn trong 30 ngày
 */
export function ExpiringContractsBadge({
  onViewContract,
}: ExpiringContractsBadgeProps) {
  const t = useTranslations("contracts");
  const locale = useLocale() as SupportedLocale;

  const [expiringContracts, setExpiringContracts] = useState<
    EmploymentContract[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch expiring contracts
  useEffect(() => {
    const fetchExpiringContracts = async () => {
      try {
        setLoading(true);
        const contracts = await getExpiringContracts(30);
        setExpiringContracts(Array.isArray(contracts) ? contracts : []);
      } catch (error) {
        console.error("Error fetching expiring contracts:", error);
        setExpiringContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringContracts();
  }, []);

  // Không hiển thị nếu không có contracts sắp hết hạn
  if (loading || expiringContracts.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-yellow-100 dark:hover:bg-yellow-950/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 dark:bg-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
              </div>
              <div className="text-left">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {t("expiringTitle")}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {t("expiringCount", { count: expiringContracts.length })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-700"
              >
                {expiringContracts.length}
              </Badge>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-yellow-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-yellow-600" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-yellow-200 dark:border-yellow-800">
            <div className="divide-y divide-yellow-200 dark:divide-yellow-800">
              {expiringContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 hover:bg-yellow-100 dark:hover:bg-yellow-950/40"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {contract.employeeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contract.contractNumber} •{" "}
                      {t("expiringIn", { days: contract.daysUntilExpiry ?? 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(contract.startDate, locale)} -{" "}
                      {formatDate(contract.endDate, locale)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewContract(contract)}
                    className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
