import { cn } from "@/lib/utils";
import { NextPage } from "next";
import Image from "next/image";

interface Props {
  className?: string;
}

const Logo: NextPage<Props> = ({ className }: Props) => {
  return (
    <>
      <Image
        src={"/logo/logo-simple-light.svg"}
        width={34}
        height={34}
        alt="Logo"
        className={cn(
          className,
          "dark:hidden w-8 h-8 md:w-9 md:h-9 border-2 border-primary rounded-md p-1"
        )}
      />
      <Image
        src={"/logo/dark-bg-rounded.svg"}
        width={34}
        height={34}
        alt="Logo"
        className="hidden dark:block w-8 h-8 md:w-9 md:h-9"
      />
    </>
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
