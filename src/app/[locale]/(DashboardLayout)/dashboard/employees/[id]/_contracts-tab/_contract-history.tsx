"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Edit, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmploymentContract } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { terminateContract } from "@/lib/apis/employee-detail-api";
import { cn } from "@/lib/utils";
import { ContractDetailDialog } from "./_contract-detail-dialog";

interface ContractHistoryProps {
  employeeId: number;
  history: EmploymentContract[];
  onEdit: (contract: EmploymentContract) => void;
  onDeleted: () => void;
}

export function ContractHistory({
  history,
  onEdit,
  onDeleted,
}: ContractHistoryProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [terminatingContract, setTerminatingContract] =
    useState<EmploymentContract | null>(null);
  const [terminateReason, setTerminateReason] = useState("");
  const [isTerminating, setIsTerminating] = useState(false);
  const [viewingContract, setViewingContract] =
    useState<EmploymentContract | null>(null);

  // Xử lý chấm dứt hợp đồng
  const handleTerminate = async () => {
    if (!terminatingContract || !terminateReason.trim()) return;

    setIsTerminating(true);
    try {
      await terminateContract(terminatingContract.id, terminateReason);
      toast.success(t("terminateSuccess"));
      setTerminatingContract(null);
      setTerminateReason("");
      onDeleted();
    } catch (error) {
      console.error("Error terminating contract:", error);
      toast.error(t("terminateError"));
    } finally {
      setIsTerminating(false);
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noContracts")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">STT</TableHead>
            <TableHead>{t("table.contractNumber")}</TableHead>
            <TableHead>{t("table.type")}</TableHead>
            <TableHead>{t("table.period")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-[120px]">{tCommon("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((contract, index) => (
            <TableRow key={contract.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">
                {contract.contractNumber || "-"}
              </TableCell>
              <TableCell>
                {getEnumLabel("contractType", contract.contractType, tEnums)}
              </TableCell>
              <TableCell>
                {formatDate(contract.startDate)} -{" "}
                {contract.endDate ? formatDate(contract.endDate) : "∞"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    contract.status === "ACTIVE" &&
                      "border-green-500 text-green-600",
                    contract.status === "EXPIRED" &&
                      "border-gray-500 text-gray-600",
                    contract.status === "TERMINATED" &&
                      "border-red-500 text-red-600",
                  )}
                >
                  {getEnumLabel("contractStatus", contract.status, tEnums)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingContract(contract)}
                    title={tCommon("view")}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {contract.status === "ACTIVE" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(contract)}
                        title={tCommon("edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTerminatingContract(contract)}
                        title={t("terminateTitle")}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Terminate Dialog */}
      <AlertDialog
        open={!!terminatingContract}
        onOpenChange={(open) => {
          if (!open) {
            setTerminatingContract(null);
            setTerminateReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("terminateTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("terminateConfirm") ||
                "Bạn có chắc muốn chấm dứt hợp đồng này?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="terminateReason">{t("terminateReason")}</Label>
            <Input
              id="terminateReason"
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
              placeholder={t("terminateReasonPlaceholder")}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              disabled={!terminateReason.trim() || isTerminating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isTerminating ? tCommon("processing") : t("terminateTitle")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Dialog */}
      <ContractDetailDialog
        contract={viewingContract}
        open={!!viewingContract}
        onOpenChange={(open) => {
          if (!open) setViewingContract(null);
        }}
      />
    </>
  );
}
