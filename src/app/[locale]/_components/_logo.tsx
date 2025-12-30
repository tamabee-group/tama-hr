import { cn } from "@/lib/utils";
import { NextPage } from "next";
import Image from "next/image";

interface Props {
  className?: string;
  /** Size của logo (mặc định 32px) */
  size?: number;
}

const Logo: NextPage<Props> = ({ className, size = 32 }: Props) => {
  return (
    <>
      <Image
        src={"/logo/logo-simple-light.svg"}
        width={size}
        height={size}
        alt="Logo"
        className={cn(
          className,
          "dark:hidden w-8 h-8 md:w-9 md:h-9 border-2 border-primary rounded-md p-1",
        )}
      />
      <Image
        src={"/logo/dark-bg-rounded.svg"}
        width={size}
        height={size}
        alt="Logo"
        className={cn(className, "hidden dark:block w-8 h-8 md:w-9 md:h-9")}
      />
    </>
  );
};

/**
 * Logo đơn giản cho sidebar - chỉ hiển thị 1 logo phù hợp với theme
 */
export const SidebarLogo = ({ size = 32 }: { size?: number }) => {
  return (
    <Image
      src={"/logo/dark-bg-rounded.svg"}
      width={size}
      height={size}
      alt="Logo"
      className={cn("w-8 h-8 md:w-9 md:h-9")}
    />
  );
};

const LogoText = () => {
  return (
    <span className="text-xl md:text-2xl font-bold text-primary dark:text-[#69ebff] font-mono">
      Tamabee
    </span>
  );
};

export const LogoFull = () => {
  return (
    <div className="flex items-center gap-2">
      <Logo />
      <LogoText />
    </div>
  );
};

export default Logo;
