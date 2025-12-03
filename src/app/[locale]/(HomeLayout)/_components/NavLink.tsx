"use client";

import { cn } from "@/lib/utils";
import pathReplace from "@/lib/utils/path-replace";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink: NextPage = () => {
  const path = usePathname();
  console.log("path-repace: ", pathReplace(path));
  const t = useTranslations("header");
  return (
    <nav className="hidden md:flex gap-12">
      <Link
        href={"/"}
        className={cn(
          "border-b-2 border-transparent transition flex-1 text-nowrap",
          pathReplace(path) === "/" && "border-b-2 border-primary"
        )}
      >
        {t("home")}
      </Link>
      <Link
        href={"/about"}
        className={cn(
          "border-b-2 border-transparent transition flex-1 text-nowrap",
          pathReplace(path) === "/about" && "border-b-2 border-primary"
        )}
      >
        {t("about")}
      </Link>
      <Link
        href={"/pricing"}
        className={cn(
          "border-b-2 border-transparent transition flex-1 text-nowrap",
          pathReplace(path) === "/pricing" && "border-b-2 border-primary"
        )}
      >
        {t("pricing")}
      </Link>
      <Link
        href={"/contact"}
        className={cn(
          "border-b-2 border-transparent transition flex-1 text-nowrap",
          pathReplace(path) === "/contact" && "border-b-2 border-primary"
        )}
      >
        {t("contact")}
      </Link>
    </nav>
  );
};

export default NavLink;
