"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { login } from "@/lib/apis/auth";
import { useAuth, fetchCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/utils/get-error-message";

/**
 * Form đăng nhập - hiển thị trong page login
 * @client-only
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [tenantDomain, setTenantDomain] = useState<string | null>(null);

  // Lấy tenant domain từ subdomain
  useEffect(() => {
    const tenant = getTenantDomain();
    setTenantDomain(tenant);
  }, []);

  /**
   * Lấy tenant domain từ subdomain
   * Ví dụ: tenant-japan.tamabee.local -> tenant-japan
   */
  const getTenantDomain = (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const host = window.location.host;
    const hostParts = host.split(".");

    // Cần ít nhất 3 phần: subdomain.tamabee.local hoặc subdomain.tamabee.vn
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0];
      // Nếu subdomain là "tamabee" thì đây là root domain
      if (subdomain === "tamabee") {
        return "tamabee";
      }
      return subdomain;
    }

    // Root domain (tamabee.local hoặc tamabee.vn) -> default tenant
    return "tamabee";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gửi tenant domain trong request để backend biết query đúng database
      await login(
        formData.identifier,
        formData.password,
        tenantDomain || undefined,
      );
      const user = await fetchCurrentUser();
      setAuthUser(user);

      toast.success(t("loginSuccess"));

      // Redirect về trang trước đó hoặc dashboard
      // Không redirect về login/register pages
      let redirect = searchParams.get("redirect") || "/dashboard";
      if (redirect.includes("/login") || redirect.includes("/register")) {
        redirect = "/dashboard";
      }
      router.push(redirect);
    } catch (error) {
      const message = getErrorMessage(error, tErrors, t("loginFailed"));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{tDialog("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">{tDialog("identifier")}</Label>
            <InputGroup>
              <InputGroupInput
                id="identifier"
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
            <Label htmlFor="password">{t("password")}</Label>
            <InputGroup>
              <InputGroupInput
                id="password"
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
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
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
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              {tHeader("register")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
