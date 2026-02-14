"use client";

import { useState, useEffect } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Mail } from "lucide-react";
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
 * Lấy tenant domain từ subdomain
 * Ví dụ: tenant-japan.tamabee.local -> tenant-japan
 */
function getTenantDomain(): string {
  if (typeof window === "undefined") {
    return "tamabee";
  }

  const host = window.location.host;

  // localhost hoặc 127.0.0.1 → master domain
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return "tamabee";
  }

  const hostParts = host.split(".");

  // Cần ít nhất 3 phần: subdomain.tamabee.local
  if (hostParts.length >= 3) {
    const subdomain = hostParts[0];
    if (subdomain === "tamabee") {
      return "tamabee";
    }
    return subdomain;
  }

  // Root domain (tamabee.local) -> default tenant
  return "tamabee";
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
  const [tenantDomain, setTenantDomain] = useState("tamabee");

  // Lấy tenant domain từ subdomain
  useEffect(() => {
    setTenantDomain(getTenantDomain());
  }, []);

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
      router.push("/me");
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
                type="text"
                textTransform="none"
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
            <PasswordInput
              id="dialog-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={tDialog("passwordPlaceholder")}
              autoComplete="off"
              required
            />
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
          {/* Chỉ hiển thị link đăng ký trên master domain (tamabee) */}
          {tenantDomain === "tamabee" && (
            <div className="text-center text-sm">
              {tDialog("noAccount")}{" "}
              <Link
                href={`/${locale}/register`}
                className="text-primary hover:underline font-medium"
                onClick={() => onOpenChange(false)}
              >
                {tHeader("register")}
              </Link>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
