"use client";

import { cn } from "@/lib/utils";
import { NextPage } from "next";
import { useTranslations } from "next-intl";

interface Props {
  className?: string;
}

const Footer: NextPage<Props> = ({ className }: Props) => {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "w-full h-20 bg-primary text-white flex items-center justify-center",
        className,
      )}
    >
      <p>{t("copyright", { year: currentYear })}</p>
    </footer>
  );
};

export default Footer;
