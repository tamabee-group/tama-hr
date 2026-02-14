"use client";

import { useTranslations } from "next-intl";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Overlay che toàn bộ trang /me khi tài khoản bị vô hiệu hóa (INACTIVE)
 * Hiển thị animation + thông báo + nút đăng xuất
 */
export function InactiveOverlay() {
  const t = useTranslations("common");
  const { logout } = useAuth();

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-background backdrop-blur-sm">
      <div className="flex flex-col items-center text-center max-w-sm px-6">
        <div className="w-64 h-64 mb-4">
          <DotLottieReact
            src="/animations/inactive_animation.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">
          {t("inactiveAccount.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("inactiveAccount.description")}
        </p>
        <Button variant="outline" onClick={() => logout()} className="gap-2">
          <LogOut className="h-4 w-4" />
          {t("inactiveAccount.logout")}
        </Button>
      </div>
    </div>
  );
}
