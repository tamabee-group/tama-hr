"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EllipsisVertical, Calendar, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatDate } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { User } from "@/types/user";

interface ColumnLabels {
  employeeCode: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  status: string;
  createdAt: string;
  profile: string;
  viewDetail: string;
  viewAttendance: string;
  viewPayroll: string;
  active: string;
  inactive: string;
  roleLabels: Record<string, string>;
  locale?: SupportedLocale;
}

export function createColumns(labels: ColumnLabels): ColumnDef<User>[] {
  const locale = labels.locale || "vi";
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
            <Link href={`/dashboard/employees/${row.original.id}`}>
              <DropdownMenuItem>
                <Eye className="h-4 w-4" />
                {labels.viewDetail}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link
              href={`/dashboard/employees/${row.original.id}?tab=attendance`}
            >
              <DropdownMenuItem>
                <Calendar className="h-4 w-4" />
                {labels.viewAttendance}
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/employees/${row.original.id}?tab=salary`}>
              <DropdownMenuItem>
                <Wallet className="h-4 w-4" />
                {labels.viewPayroll}
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
      header: labels.employeeCode,
    },
    {
      id: "name",
      header: labels.name,
      cell: ({ row }) => row.original.profile?.name || "-",
    },
    {
      accessorKey: "departmentName",
      header: labels.department,
      cell: ({ row }) => row.original.departmentName || "-",
    },
    {
      accessorKey: "status",
      header: labels.status,
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
            {status === "ACTIVE" ? labels.active : labels.inactive}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: labels.createdAt,
      cell: ({ row }) => formatDate(row.getValue("createdAt"), locale),
    },
    {
      accessorKey: "profileCompleteness",
      header: labels.profile,
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

// Note: Use createColumns() with translations instead of this default export
// This is kept for backward compatibility but should be removed when all usages are updated
export const columns: ColumnDef<User>[] = [];
