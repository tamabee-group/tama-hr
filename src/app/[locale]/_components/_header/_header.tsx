import { NextPage } from "next";
import Link from "next/link";
import { LogoFull } from "../../_components/_logo";
import Languages from "../../_components/_language-dropdown";
import NavLinks from "./_nav-links";
import AuthButtons from "./_auth-buttons";
import { ToggleTheme } from "../_toggle-theme";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * Header chính của trang web
 */
const Header: NextPage<Props> = ({ className }: Props) => {
  return (
    <header
      style={{ height: "50px" }}
      className={cn(
        "z-50 flex justify-center bg-white/20 dark:bg-[#222]/20 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 right-0 left-0 w-full",
        className,
      )}
    >
      <div className="w-full h-full px-4 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <LogoFull />
        </Link>
        <NavLinks />

        <div className="flex gap-1 md:gap-4 items-center">
          <ToggleTheme />
          <Languages />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
