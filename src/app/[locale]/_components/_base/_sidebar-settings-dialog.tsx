"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, User, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { User as UserType } from "@/types/user";
import { Button } from "@/components/ui/button";

type SettingsTab = "general" | "account";

interface SidebarSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
}

export function SidebarSettingsDialog({
  open,
  onOpenChange,
  user,
}: SidebarSettingsDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("common");
  const tHeader = useTranslations("header");
  const tEnums = useTranslations("enums");
  const tAuth = useTranslations("auth");

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    router.push("/");
    toast.success(tAuth("logoutSuccess"));
  };

  const handleLanguageChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    // Thêm query param để giữ dialog mở sau khi chuyển ngôn ngữ
    router.push(`${newPathname}?settings=open`);
  };

  const handleNavigate = (path: string) => {
    router.push(`/${locale}${path}`);
    handleClose();
  };

  const languages = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
  ];

  const themes = [
    { value: "light", label: t("lightMode") },
    { value: "dark", label: t("darkMode") },
  ];

  const menuItems = [
    { id: "general" as const, icon: Settings, label: t("general") },
    { id: "account" as const, icon: User, label: t("account") },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="md:max-w-sm p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{tHeader("settings")}</DialogTitle>

        {/* Tabs - horizontal wrap với title và close button */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center">
            <div className="flex flex-wrap gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    " cursor-pointer border flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                    activeTab === item.id
                      ? "bg-muted text-foreground border-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted border cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Separator />

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] flex flex-col bg-accent">
          <div className="flex-1">
            {activeTab === "general" && (
              <GeneralSettings
                theme={theme}
                setTheme={setTheme}
                locale={locale}
                languages={languages}
                themes={themes}
                onLanguageChange={handleLanguageChange}
                t={t}
              />
            )}

            {activeTab === "account" && (
              <AccountSettings
                user={user}
                onNavigate={handleNavigate}
                t={t}
                tHeader={tHeader}
                tEnums={tEnums}
              />
            )}
          </div>
        </div>
        {/* Logout button - bottom right */}
        <div className=" flex justify-end p-4 border-t">
          <Button
            onClick={handleLogout}
            variant={"destructive"}
            className="flex items-center"
          >
            <LogOut />
            {tHeader("logout")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GeneralSettingsProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  locale: string;
  languages: { code: string; label: string }[];
  themes: { value: string; label: string }[];
  onLanguageChange: (locale: string) => void;
  t: ReturnType<typeof useTranslations>;
}

function GeneralSettings({
  theme,
  setTheme,
  locale,
  languages,
  themes,
  onLanguageChange,
  t,
}: GeneralSettingsProps) {
  return (
    <div>
      {/* Theme */}
      <SettingRow label={t("theme")}>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[140px] border-none shadow-none justify-end gap-1 px-0 bg-transparent dark:bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {themes.map((themeItem) => (
              <SelectItem key={themeItem.value} value={themeItem.value}>
                {themeItem.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      {/* Language */}
      <SettingRow label={t("language")}>
        <Select value={locale} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] border-none shadow-none justify-end gap-1 px-0 bg-transparent dark:bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      {/* Time Format */}
      <SettingRow
        label={t("timeFormat")}
        className="text-muted-foreground mr-5"
      >
        <span className="text-sm text-muted-foreground">24h</span>
      </SettingRow>
    </div>
  );
}

interface AccountSettingsProps {
  user: UserType | null;
  onNavigate: (path: string) => void;
  t: ReturnType<typeof useTranslations>;
  tHeader: ReturnType<typeof useTranslations>;
  tEnums: ReturnType<typeof useTranslations>;
}

function AccountSettings({
  user,
  onNavigate,
  t,
  tHeader,
  tEnums,
}: AccountSettingsProps) {
  return (
    <div>
      {/* Email */}
      <SettingRow label={t("email")}>
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </SettingRow>

      {/* Role */}
      <SettingRow label={t("role")}>
        <span className="text-sm text-muted-foreground">
          {user?.role ? tEnums(`userRole.${user.role}`) : "-"}
        </span>
      </SettingRow>

      {/* Profile link */}
      <SettingRow label={tHeader("profile")}>
        <button
          onClick={() => onNavigate("/profile")}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          {t("viewDetail")}
        </button>
      </SettingRow>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

function SettingRow({ label, className, children }: SettingRowProps) {
  return (
    <div
      className={cn("flex items-center justify-between py-1 h-10", className)}
    >
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}
