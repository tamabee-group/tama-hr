import { cn } from "@/lib/utils";
import { NextPage } from "next";

interface Props {
  className?: string;
}

const Footer: NextPage<Props> = ({ className }: Props) => {
  return (
    <footer className={cn("w-full h-20 bg-primary text-white", className)}>
      Footer
    </footer>
  );
};

export default Footer;
