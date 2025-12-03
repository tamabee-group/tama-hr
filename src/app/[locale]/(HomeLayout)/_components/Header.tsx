import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoFull } from "../../_components/Logo";
import Languages from "../../_components/language-dropdown";
import NavLink from "./NavLink";

interface Props {
  height: number;
  widthContent: number;
}

const Header: NextPage<Props> = ({ height, widthContent }: Props) => {
  const t = useTranslations("header");

  return (
    <header
      style={{ height }}
      className="z-111 flex justify-center bg-white/80 dark:bg-[#222]/80 backdrop-blur-xs border-b border-gray-100 shadow-xs fixed top-0 right-0 w-screen"
    >
      <div
        style={{ maxWidth: `${widthContent}px` }}
        className="w-full h-full px-4 flex justify-between items-center"
      >
        <Link href={"/"} className="flex items-center gap-2">
          <LogoFull />
        </Link>
        <NavLink />

        <div className="flex gap-1 md:gap-4 items-center">
          <Languages />
          <Link href={"/register"} className="hidden md:block">
            <Button variant={"link"} className="text-gray-900 dark:text-white">
              {t("register")}
            </Button>
          </Link>
          <Link href={"/login"}>
            <Button>{t("login")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
