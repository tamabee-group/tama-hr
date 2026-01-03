"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Mail, Lock } from "lucide-react";
import { login } from "@/lib/apis/auth";
import { useAuth, fetchCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

/**
 * Dialog đăng nhập - hiển thị form login trong modal
 * @client-only - Chỉ sử dụng được ở client side
 */
export function LoginDialog({
  open,
  onOpenChange,
  onLoginSuccess,
}: LoginDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const { login: setAuthUser } = useAuth();
  const t = useTranslations("auth");
  const tDialog = useTranslations("auth.loginDialog");
  const tHeader = useTranslations("header");
  const tErrors = useTranslations("errors");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.identifier, formData.password);
      const user = await fetchCurrentUser();
      setAuthUser(user);

      toast.success(t("loginSuccess"));
      onOpenChange(false);
      onLoginSuccess?.();
      router.push("/");
    } catch (error) {
      const message = getErrorMessage(error, tErrors, t("loginFailed"));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData({ identifier: "", password: "" });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-center text-2xl">
            {tDialog("title")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dialog-identifier">{tDialog("identifier")}</Label>
            <InputGroup>
              <InputGroupInput
                id="dialog-identifier"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                placeholder={tDialog("identifierPlaceholder")}
                autoComplete="off"
                required
              />
              <InputGroupAddon>
                <Mail className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div>
            <Label htmlFor="dialog-password">{t("password")}</Label>
            <InputGroup>
              <InputGroupInput
                id="dialog-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={tDialog("passwordPlaceholder")}
                autoComplete="off"
                required
              />
              <InputGroupAddon>
                <Lock className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
            <div className="flex justify-end mt-2">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-primary hover:underline"
                onClick={() => onOpenChange(false)}
              >
                {t("forgotPassword.title")}?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("loggingIn") : t("login")}
          </Button>
          <div className="text-center text-sm">
            {tDialog("noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-primary dark:text-(--blue-light) hover:underline font-medium"
              onClick={() => onOpenChange(false)}
            >
              {tHeader("register")}
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
