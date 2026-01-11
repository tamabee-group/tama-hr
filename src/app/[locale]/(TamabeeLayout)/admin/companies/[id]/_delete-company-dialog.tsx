"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { deleteCompany } from "@/lib/apis/admin-companies";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface DeleteCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  companyName: string;
}

export function DeleteCompanyDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
}: DeleteCompanyDialogProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isNameMatch = confirmName === companyName;

  const handleDelete = async () => {
    if (!isNameMatch) return;

    setIsDeleting(true);
    try {
      await deleteCompany(companyId, confirmName);
      toast.success(t("messages.deleteSuccess"));
      onOpenChange(false);
      router.push(`/${locale}/admin/companies`);
    } catch (error) {
      const message = getErrorMessage(
        error,
        tErrors,
        t("messages.deleteError"),
      );
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      setConfirmName("");
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {t("deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">{t("deleteDialog.warning")}</span>
            <Label className="block font-medium text-foreground">
              {t("deleteDialog.confirmInstruction", { name: companyName })}
            </Label>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <Label htmlFor="confirmName">{t("deleteDialog.companyName")}</Label>
          <Input
            id="confirmName"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={companyName}
            disabled={isDeleting}
            className="mt-1.5"
          />
        </div>

        <AlertDialogFooter className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isNameMatch || isDeleting}
          >
            {isDeleting && <Spinner className="mr-2 h-4 w-4" />}
            {t("deleteDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
