"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { departmentApi } from "@/lib/apis/department-api";
import { DepartmentTreeNode, DepartmentEmployee } from "@/types/department";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface DepartmentEmployeesDialogProps {
  department: DepartmentTreeNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog hiển thị danh sách nhân viên trong phòng ban
 */
export function DepartmentEmployeesDialog({
  department,
  open,
  onOpenChange,
}: DepartmentEmployeesDialogProps) {
  const t = useTranslations("departments");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const tUsers = useTranslations("users");

  const [employees, setEmployees] = useState<DepartmentEmployee[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch employees khi dialog mở
  useEffect(() => {
    if (open && department) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const data = await departmentApi.getDepartmentEmployees(
            department.id,
          );
          setEmployees(data);
        } catch (error) {
          const errorCode = (error as { errorCode?: string })?.errorCode;
          toast.error(getErrorMessage(errorCode, tErrors));
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [open, department, tErrors]);

  // Reset khi đóng dialog
  useEffect(() => {
    if (!open) {
      setEmployees([]);
    }
  }, [open]);

  // Columns cho table
  const columns: ColumnDef<DepartmentEmployee>[] = useMemo(
    () => [
      {
        id: "stt",
        header: () => <div className="w-[60px]">STT</div>,
        cell: ({ row }) => <div className="w-[60px]">{row.index + 1}</div>,
      },
      {
        accessorKey: "name",
        header: tUsers("table.name"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.avatar} />
              <AvatarFallback>
                {row.original.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">
                {row.original.employeeCode}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: tUsers("table.email"),
      },
      {
        accessorKey: "role",
        header: tUsers("table.role"),
        cell: ({ row }) => getEnumLabel("userRole", row.original.role, tEnums),
      },
      {
        accessorKey: "status",
        header: tUsers("table.status"),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
              {getEnumLabel("userStatus", status, tEnums)}
            </Badge>
          );
        },
      },
    ],
    [tUsers, tEnums],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("employeeList")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{department?.name}</p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">{tCommon("loading")}</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            {t("noEmployees")}
          </div>
        ) : (
          <BaseTable
            columns={columns}
            data={employees}
            showPagination={employees.length > 10}
            pageSize={10}
            noResultsText={t("noEmployees")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
