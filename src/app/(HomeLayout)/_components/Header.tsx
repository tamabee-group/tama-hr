import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import Link from "next/link";
import { LogoFull } from "../../_components/Logo";

interface Props {
  height: number;
  widthContent: number;
}

const Header: NextPage<Props> = ({ height, widthContent }: Props) => {
  return (
    <header
      style={{ height }}
      className="z-111 flex justify-center bg-white/80 backdrop-blur-xs border-b border-gray-100 shadow-xs fixed top-0 right-0 w-screen"
    >
      <div
        style={{ maxWidth: `${widthContent}px` }}
        className="w-full h-full px-4 flex justify-between items-center"
      >
        <Link href={"/"} className="flex items-center gap-2">
          <LogoFull />
        </Link>
        <nav className="hidden md:flex gap-4">
          <Link href={"/"}>
            <Button variant="link" className="text-#333">
              Trang chủ
            </Button>
            <Button variant="link" className="text-#333">
              Giới thiệu
            </Button>
          </Link>
          <Link href={"/"}>
            <Button variant="link" className="text-#333">
              Bảng giá
            </Button>
          </Link>
          <Link href={"/"}>
            <Button variant="link" className="text-#333">
              Liên hệ
            </Button>
          </Link>
        </nav>

        <div className="flex gap-1 md:gap-4">
          <Link href={"/register"}>
            <Button variant={"link"} className="text-gray-900 dark:text-white">
              Đăng ký
            </Button>
          </Link>
          <Link href={"/login"}>
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
