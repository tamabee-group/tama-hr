"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

// Định nghĩa kiểu dữ liệu cho thay đổi
export interface FieldChange {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
  group?: "basic" | "emergency" | "bank"; // Nhóm thông tin
}

// Định nghĩa nhóm thông tin
interface ChangeGroup {
  key: string;
  title: string;
  changes: FieldChange[];
}

interface ConfirmChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: FieldChange[];
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function ConfirmChangesDialog({
  open,
  onOpenChange,
  changes,
  onConfirm,
  isLoading = false,
  title,
  description,
}: ConfirmChangesDialogProps) {
  const t = useTranslations("dialogs");

  // Nhóm các thay đổi theo mục
  const groupChanges = (changes: FieldChange[]): ChangeGroup[] => {
    const groups: ChangeGroup[] = [
      { key: "basic", title: t("confirmChanges.groupBasic"), changes: [] },
      {
        key: "emergency",
        title: t("confirmChanges.groupEmergency"),
        changes: [],
      },
      { key: "bank", title: t("confirmChanges.groupBank"), changes: [] },
    ];

    changes.forEach((change) => {
      const group = groups.find((g) => g.key === (change.group || "basic"));
      if (group) {
        group.changes.push(change);
      }
    });

    // Chỉ trả về các nhóm có thay đổi
    return groups.filter((g) => g.changes.length > 0);
  };

  const groupedChanges = groupChanges(changes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl p-0 gap-0 flex flex-col max-h-[80vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{title || t("confirmChanges.title")}</DialogTitle>
          <DialogDescription>
            {description || t("confirmChanges.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {groupedChanges.map((group) => (
            <div key={group.key}>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                {group.title}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]"></TableHead>
                    <TableHead>{t("confirmChanges.oldValue")}</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>{t("confirmChanges.newValue")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.changes.map((change) => (
                    <TableRow key={change.field}>
                      <TableCell className="font-medium">
                        {change.label}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {change.oldValue}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        {change.newValue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        <DialogFooter className="p-6 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("confirmChanges.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {t("confirmChanges.saving")}
              </>
            ) : (
              t("confirmChanges.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
