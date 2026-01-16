"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankDetailsSection } from "@/types/employee-detail";
import { UpdateCompanyEmployeeRequest } from "@/lib/apis/company-employees";
import { useAuth } from "@/hooks/use-auth";

interface EditBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankDetails?: BankDetailsSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
}

interface BankFormProps {
  bankDetails?: BankDetailsSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
  onClose: () => void;
}

export function EditBankDialog({
  open,
  onOpenChange,
  bankDetails,
  onSave,
}: EditBankDialogProps) {
  const t = useTranslations("employeeDetail.personalInfo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("bankDetails")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("bankDetails")}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <BankForm
            key={String(open)}
            bankDetails={bankDetails}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BankForm({ bankDetails, onSave, onClose }: BankFormProps) {
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const isJapan = user?.locale === "Asia/Tokyo";
  const isVietnam = !isJapan;

  const [japanBankType, setJapanBankType] = useState(
    bankDetails?.japanBankType || "normal",
  );
  const [bankName, setBankName] = useState(bankDetails?.bankName || "");
  const [bankAccountName, setBankAccountName] = useState(
    bankDetails?.bankAccountName || "",
  );
  const [bankAccount, setBankAccount] = useState(
    bankDetails?.bankAccount || "",
  );
  const [bankCode, setBankCode] = useState(bankDetails?.bankCode || "");
  const [bankBranchCode, setBankBranchCode] = useState(
    bankDetails?.bankBranchCode || "",
  );
  const [bankBranchName, setBankBranchName] = useState(
    bankDetails?.bankBranchName || "",
  );
  const [bankSymbol, setBankSymbol] = useState(bankDetails?.bankSymbol || "");
  const [bankNumber, setBankNumber] = useState(bankDetails?.bankNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isYucho = isJapan && japanBankType === "yucho";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const data: UpdateCompanyEmployeeRequest = {
      bankAccountType: isJapan ? "japan" : "vietnam",
      bankName: bankName || undefined,
      bankAccountName: bankAccountName || undefined,
    };

    if (isVietnam) {
      data.bankAccount = bankAccount || undefined;
    } else if (isJapan) {
      data.japanBankType = japanBankType;
      if (isYucho) {
        data.bankSymbol = bankSymbol || undefined;
        data.bankNumber = bankNumber || undefined;
      } else {
        data.bankCode = bankCode || undefined;
        data.bankBranchCode = bankBranchCode || undefined;
        data.bankBranchName = bankBranchName || undefined;
        data.bankAccount = bankAccount || undefined;
      }
    }

    const success = await onSave(data);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <>
      <div className="space-y-4 py-4">
        {isJapan && (
          <div>
            <Label>{tCommon("bankType")}</Label>
            <Select value={japanBankType} onValueChange={setJapanBankType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">{tCommon("normalBank")}</SelectItem>
                <SelectItem value="yucho">{tCommon("yuchoBank")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="bankName">{tCommon("bankName")}</Label>
          <Input
            id="bankName"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="bankAccountName">{tCommon("bankAccountName")}</Label>
          <Input
            id="bankAccountName"
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value)}
          />
        </div>

        {isVietnam && (
          <div>
            <Label htmlFor="bankAccount">{tCommon("bankAccount")}</Label>
            <Input
              id="bankAccount"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </div>
        )}

        {isJapan && isYucho && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankSymbol">{tCommon("bankSymbol")}</Label>
              <Input
                id="bankSymbol"
                value={bankSymbol}
                onChange={(e) => setBankSymbol(e.target.value)}
                placeholder="12345"
              />
            </div>
            <div>
              <Label htmlFor="bankNumber">{tCommon("bankNumber")}</Label>
              <Input
                id="bankNumber"
                value={bankNumber}
                onChange={(e) => setBankNumber(e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>
        )}

        {isJapan && !isYucho && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankCode">{tCommon("bankCode")}</Label>
                <Input
                  id="bankCode"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  placeholder="0001"
                />
              </div>
              <div>
                <Label htmlFor="bankBranchCode">
                  {tCommon("bankBranchCode")}
                </Label>
                <Input
                  id="bankBranchCode"
                  value={bankBranchCode}
                  onChange={(e) => setBankBranchCode(e.target.value)}
                  placeholder="001"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bankBranchName">
                {tCommon("bankBranchName")}
              </Label>
              <Input
                id="bankBranchName"
                value={bankBranchName}
                onChange={(e) => setBankBranchName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bankAccount">{tCommon("bankAccount")}</Label>
              <Input
                id="bankAccount"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="1234567"
              />
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          {tCommon("cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? tCommon("saving") : tCommon("save")}
        </Button>
      </DialogFooter>
    </>
  );
}
