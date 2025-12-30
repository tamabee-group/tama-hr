"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatDate } from "@/lib/utils/format-date";
import { User, UserRole } from "@/types/user";
import { SupportedLocale } from "@/lib/utils/format-currency";

export function useColumns(): ColumnDef<User>[] {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  return [
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Link href={`/tamabee/users/${row.original.id}`}>
              <DropdownMenuItem>
                <Eye className="h-4 w-4" />
                {tCommon("details")}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const name = row.original.profile?.name || row.original.email;
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <Avatar className="h-10 w-10">
            <AvatarImage src={getFileUrl(row.original.profile?.avatar)} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "employeeCode",
      header: t("table.employeeCode"),
    },
    {
      id: "name",
      header: t("table.name"),
      cell: ({ row }) => row.original.profile?.name || "-",
    },
    {
      accessorKey: "email",
      header: t("table.email"),
    },
    {
      accessorKey: "role",
      header: t("table.role"),
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return tEnums(`userRole.${role}`);
      },
    },
    {
      accessorKey: "referralCode",
      header: t("table.referralCode"),
      cell: ({ row }) => row.original.profile?.referralCode || "-",
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {tEnums(`userStatus.${status}`)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => formatDate(row.getValue("createdAt"), locale),
    },
    {
      accessorKey: "profileCompleteness",
      header: t("table.profile"),
      cell: ({ row }) => {
        const completeness = row.original.profileCompleteness || 0;
        const getColor = (value: number) => {
          if (value >= 80) return "bg-green-500";
          if (value >= 50) return "bg-yellow-500";
          return "bg-red-500";
        };
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColor(completeness)} transition-all`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {completeness}%
            </span>
          </div>
        );
      },
    },
  ];
}

// Export static columns for backward compatibility
export const columns: ColumnDef<User>[] = [];
