import { NextPage } from "next";
import Link from "next/link";
import { LogoFull } from "../../_components/_logo";
import Languages from "../../_components/_language-dropdown";
import NavLinks from "./_nav-links";
import AuthButtons from "./_auth-buttons";
import { ToggleTheme } from "../_toggle-theme";

interface Props {
  height: number;
}

/**
 * Header chính của trang web
 */
const Header: NextPage<Props> = ({ height }: Props) => {
  return (
    <header
      style={{ height }}
      className="z-111 flex justify-center bg-white/80 dark:bg-[#222]/80 backdrop-blur-xs border-b border-gray-100 shadow-xs sticky top-0 right-0 left-0 w-full"
    >
      <div className="w-full h-full px-4 flex justify-between items-center">
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
