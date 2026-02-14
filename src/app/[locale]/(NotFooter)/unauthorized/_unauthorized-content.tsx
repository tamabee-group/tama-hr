"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function UnauthorizedContent() {
  const t = useTranslations("unauthorized");
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
      <div className="w-64 h-64 mb-4">
        <DotLottieReact
          src="/animations/401_animation.lottie"
          loop
          autoplay
          className="w-full h-full"
        />
      </div>
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-6">{t("description")}</p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          {t("goBack")}
        </Button>
        <Button onClick={() => router.push("/")}>{t("goHome")}</Button>
      </div>
    </div>
  );
}
