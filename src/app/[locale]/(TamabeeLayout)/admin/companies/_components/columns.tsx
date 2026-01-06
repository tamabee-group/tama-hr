"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Company, INDUSTRY_LABELS } from "@/types/company";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatDate } from "@/lib/utils/format-date";
import { useParams } from "next/navigation";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { getLocaleLabel } from "@/lib/utils/get-enum-label";
import { normalizeLocale, LocaleCode } from "@/types/enums";

export function useColumns(): ColumnDef<Company>[] {
  const t = useTranslations("companies");
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
            <Link href={`/${locale}/admin/companies/${row.original.id}`}>
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
      header: t("table.name"),
    },
    {
      accessorKey: "ownerName",
      header: t("form.name"),
    },
    {
      accessorKey: "phone",
      header: tCommon("phone"),
    },
    {
      accessorKey: "industry",
      header: t("form.industry") || "Industry",
      cell: ({ row }) => {
        const industry = row.getValue("industry") as string;
        return INDUSTRY_LABELS[industry] || industry;
      },
    },
    {
      accessorKey: "locale",
      header: t("form.locale") || "Locale",
      cell: ({ row }) => {
        const localeValue = row.getValue("locale") as string;
        if (!localeValue) return localeValue;
        const normalizedLocale = normalizeLocale(localeValue) as LocaleCode;
        return getLocaleLabel(normalizedLocale, tEnums);
      },
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => formatDate(row.getValue("createdAt"), locale),
    },
  ];
}

export const columns: ColumnDef<Company>[] = [];
