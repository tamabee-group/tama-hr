"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Phone, MoreHorizontal, Trash2 } from "lucide-react";

import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { User } from "@/types/user";
import { deleteEmployee } from "@/lib/apis/company-employees";
import { toast } from "sonner";

interface EmployeeHeaderProps {
  employee: User;
}

export function EmployeeHeader({ employee }: EmployeeHeaderProps) {
  const router = useRouter();
  const t = useTranslations("employeeDetail");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Xử lý gửi email
  const handleSendEmail = () => {
    window.location.href = `mailto:${employee.email}`;
  };

  // Xử lý gọi điện
  const handleVoiceCall = () => {
    if (employee.profile?.phone) {
      window.location.href = `tel:${employee.profile.phone}`;
    }
  };

  // Xử lý xóa nhân viên
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(employee.id);
      toast.success(tUsers("deleteSuccess"));
      router.push("/dashboard/employees");
    } catch {
      toast.error(tUsers("deleteError"));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Back button */}
        <BackButton />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-md font-bold truncate">
              {employee.profile?.name || employee.email}
            </h1>
            <Badge variant="outline" className="text-xs border-primary">
              {employee.employeeCode}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                {t("actions.sendEmail")}
              </DropdownMenuItem>
              {employee.profile?.phone && (
                <DropdownMenuItem onClick={handleVoiceCall}>
                  <Phone className="h-4 w-4 mr-2" />
                  {t("actions.voiceCall")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tUsers("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tUsers("deleteWarning", {
                name: employee.profile?.name || employee.email,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? tCommon("deleting") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
