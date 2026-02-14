"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
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

type TemplateType = "allowance" | "deduction";

interface TemplateItem {
  type: TemplateType;
  code: string;
  name: string;
  originalIndex: number;
}

interface AllowanceDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TemplateItem | null;
  onSave: (item: TemplateItem) => Promise<void>;
  onDelete: (item: TemplateItem) => Promise<void>;
  isSaving: boolean;
}

export function AllowanceDeductionDialog({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
  isSaving,
}: AllowanceDeductionDialogProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Reset state khi dialog mở - dùng key pattern thay vì useEffect
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && item) {
      setName(item.name);
      setError("");
    }
    onOpenChange(newOpen);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("allowanceDeduction.nameRequired"));
      return;
    }

    if (item) {
      await onSave({
        ...item,
        name: name.trim(),
      });
    }
  };

  const handleDelete = async () => {
    if (item) {
      await onDelete(item);
    }
    setShowDeleteDialog(false);
  };

  if (!item) return null;

  const isNew = item.originalIndex === -1;
  const isAllowance = item.type === "allowance";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="">
              {isNew
                ? isAllowance
                  ? t("allowanceDeduction.addAllowance")
                  : t("allowanceDeduction.addDeduction")
                : isAllowance
                  ? t("allowanceDeduction.editAllowance")
                  : t("allowanceDeduction.editDeduction")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder={t("allowanceDeduction.namePlaceholder")}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tCommon("delete")}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
              >
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isNew ? tCommon("create") : tCommon("update")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAllowance
                ? t("allowanceDeduction.deleteAllowanceTitle")
                : t("allowanceDeduction.deleteDeductionTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAllowance
                ? t("allowanceDeduction.deleteAllowanceDesc")
                : t("allowanceDeduction.deleteDeductionDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
