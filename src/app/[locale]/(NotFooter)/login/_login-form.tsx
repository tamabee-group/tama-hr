"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.identifier, formData.password);
      const user = await fetchCurrentUser();
      setAuthUser(user);

      toast.success(t("loginSuccess"));

      // Redirect về trang trước đó hoặc dashboard
      const redirect = searchParams.get("redirect") || "/dashboard";
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
              className="text-primary dark:text-(--blue-light) hover:underline font-medium"
            >
              {tHeader("register")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
