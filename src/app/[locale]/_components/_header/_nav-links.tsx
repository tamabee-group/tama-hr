"use client";

import { cn } from "@/lib/utils";
import pathReplace from "@/lib/utils/path-replace";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLinks: NextPage = () => {
  const path = usePathname();
  const t = useTranslations("header");
  const isHomePage = pathReplace(path) === "/";

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    // Chỉ smooth scroll khi đang ở trang chủ
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (targetId === "hero") {
        // Scroll to top nếu không tìm thấy element hero
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="hidden md:flex gap-12">
      <Link
        href={isHomePage ? "#hero" : "/#hero"}
        onClick={(e) => handleSmoothScroll(e, "hero")}
        className={cn(
          "dark:hover:text-(--blue-light) border-b-2 border-transparent transition flex-1 text-nowrap hover:text-primary",
        )}
      >
        {t("home")}
      </Link>
      <Link
        href={isHomePage ? "#features" : "/#features"}
        onClick={(e) => handleSmoothScroll(e, "features")}
        className="dark:hover:text-(--blue-light) border-b-2 border-transparent transition flex-1 text-nowrap hover:text-primary"
      >
        {t("features")}
      </Link>
      <Link
        href={isHomePage ? "#pricing" : "/#pricing"}
        onClick={(e) => handleSmoothScroll(e, "pricing")}
        className="dark:hover:text-(--blue-light) border-b-2 border-transparent transition flex-1 text-nowrap hover:text-primary"
      >
        {t("pricing")}
      </Link>
    </nav>
  );
};

export default NavLinks;
