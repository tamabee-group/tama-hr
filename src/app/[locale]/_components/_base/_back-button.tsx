"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  className?: string;
}

/**
 * BackButton component dùng chung
 * Sử dụng trong các page cần nút quay lại
 */
export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={`gap-1 px-2 h-8 -ml-2 ${className || ""}`}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="text-sm">{t("back")}</span>
    </Button>
  );
}
