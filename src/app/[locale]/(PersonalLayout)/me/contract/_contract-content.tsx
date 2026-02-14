"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { CurrentContractCard } from "./_current-contract-card";
import { ContractTimeline } from "./_contract-timeline";
import { ContractDetailDialog } from "./_contract-detail-dialog";
import { PortalContractResponse } from "@/types/employee-portal";
import {
  getMyCurrentContract,
  getMyContractHistory,
} from "@/lib/apis/my-contract-api";
import { toast } from "sonner";

// ============================================
// Component
// ============================================

export function ContractContent() {
  const t = useTranslations("portal.contract");

  // State
  const [currentContract, setCurrentContract] =
    React.useState<PortalContractResponse | null>(null);
  const [contractHistory, setContractHistory] = React.useState<
    PortalContractResponse[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedContract, setSelectedContract] =
    React.useState<PortalContractResponse | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Fetch data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [current, history] = await Promise.all([
          getMyCurrentContract(),
          getMyContractHistory(),
        ]);
        setCurrentContract(current);
        setContractHistory(history);
      } catch {
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Handlers
  const handleViewCurrentDetail = () => {
    if (currentContract) {
      setSelectedContract(currentContract);
      setDialogOpen(true);
    }
  };

  const handleContractClick = (contract: PortalContractResponse) => {
    setSelectedContract(contract);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContract(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Lọc contract history để không bao gồm current contract
  const historyWithoutCurrent = contractHistory.filter(
    (c) => c.id !== currentContract?.id,
  );

  return (
    <div className="space-y-6">
      {/* Current Contract */}
      <CurrentContractCard
        contract={currentContract}
        onViewDetail={handleViewCurrentDetail}
      />

      {/* Contract History */}
      {historyWithoutCurrent.length > 0 && (
        <ContractTimeline
          contracts={historyWithoutCurrent}
          onContractClick={handleContractClick}
        />
      )}

      {/* Contract Detail Dialog */}
      <ContractDetailDialog
        contract={selectedContract}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
