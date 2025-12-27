"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils/file-url";
import { User, USER_ROLE_LABELS, UserRole } from "@/types/user";

export const columns: ColumnDef<User>[] = [
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
              Xem chi tiết
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
    header: "Mã NV",
  },
  {
    id: "name",
    header: "Tên",
    cell: ({ row }) => row.original.profile?.name || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return USER_ROLE_LABELS[role] || role;
    },
  },
  {
    accessorKey: "referralCode",
    header: "Mã giới thiệu",
    cell: ({ row }) => row.original.profile?.referralCode || "-",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
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
          {status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "profileCompleteness",
    header: "Hồ sơ",
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
          <span className="text-xs text-muted-foreground">{completeness}%</span>
        </div>
      );
    },
  },
];
