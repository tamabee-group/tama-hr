"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "./LoginDialog";
import { UserMenu } from "./UserMenu";

/**
 * Component hiển thị nút đăng nhập/đăng ký hoặc menu user
 * @client-only - Chỉ sử dụng được ở client side
 */
export default function AuthButtons() {
  const t = useTranslations("header");
  const { user, status, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  // Đang loading, không hiển thị gì
  if (status === "loading") return null;

  // Đã đăng nhập, hiển thị menu user
  if (user) {
    return <UserMenu user={user} onLogout={logout} />;
  }

  // Chưa đăng nhập, hiển thị nút đăng nhập/đăng ký
  return (
    <>
      <Button onClick={() => setLoginOpen(true)}>{t("login")}</Button>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
