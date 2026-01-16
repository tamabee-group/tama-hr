"use client";

import { useTranslations } from "next-intl";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DepartmentTreeNode } from "@/types/department";

interface DepartmentActionsProps {
  department: DepartmentTreeNode;
  onEdit: () => void;
  onDelete: () => void;
  onViewEmployees?: () => void;
  trigger?: React.ReactNode;
}

/**
 * Component hiển thị các actions cho phòng ban
 */
export function DepartmentActions({
  onEdit,
  onDelete,
  onViewEmployees,
  trigger,
}: DepartmentActionsProps) {
  const t = useTranslations("departments");
  const tCommon = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{tCommon("actions")}</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onViewEmployees && (
          <>
            <DropdownMenuItem onClick={onViewEmployees}>
              <Users className="h-4 w-4 mr-2" />
              {t("viewEmployees")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          {tCommon("edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {tCommon("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
