"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Company, INDUSTRY_LABELS, LOCALE_LABELS } from "@/types/company";
import { getFileUrl } from "@/lib/utils/file-url";

export const columns: ColumnDef<Company>[] = [
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
          <Link href={`/tamabee/customers/${row.original.id}`}>
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
    accessorKey: "logo",
    header: "",
    cell: ({ row }) => {
      const logo = row.original.logo;
      return logo ? (
        <div className="relative h-8 w-8">
          <Image
            src={getFileUrl(logo)}
            alt="Logo"
            fill
            className="rounded object-cover"
          />
        </div>
      ) : (
        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
          <span className="text-[8px] text-muted-foreground font-medium">
            LOGO
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Tên công ty",
  },
  {
    accessorKey: "ownerName",
    header: "Người đại diện",
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
  },
  {
    accessorKey: "industry",
    header: "Ngành nghề",
    cell: ({ row }) => {
      const industry = row.getValue("industry") as string;
      return INDUSTRY_LABELS[industry] || industry;
    },
  },
  {
    accessorKey: "locale",
    header: "Khu vực",
    cell: ({ row }) => {
      const locale = row.getValue("locale") as string;
      return LOCALE_LABELS[locale] || locale;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày đăng ký",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN"),
  },
];
