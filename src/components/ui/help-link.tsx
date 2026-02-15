"use client";

import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface HelpLinkProps {
  /** Help topic key (e.g. "company_settings") */
  topic: string;
  /** Help article key (e.g. "attendance_settings") */
  article: string;
  className?: string;
}

/**
 * Link đến Help Center với topic và article cụ thể.
 */
export function HelpLink({ topic, article, className }: HelpLinkProps) {
  const tCommon = useTranslations("common");

  return (
    <Link
      href={`/me/help?topic=${topic}&article=${article}`}
      target="_blank"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline",
        className,
      )}
    >
      <CircleHelp className="h-4 w-4" />
      {tCommon("viewHelp")}
    </Link>
  );
}
