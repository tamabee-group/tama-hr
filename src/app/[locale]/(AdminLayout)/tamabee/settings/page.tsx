"use client";

import { useState, useEffect, useCallback } from "react";
import { SettingResponse } from "@/types/setting";
import { settingApi } from "@/lib/apis/setting-api";
import { SettingForm } from "./_setting-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Pencil, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/utils/format-date";

/**
 * Trang quản lý Settings cho Tamabee Admin
 * - Hiển thị danh sách settings dạng table (không phân trang)
 * - ADMIN_TAMABEE: có quyền edit
 * - MANAGER_TAMABEE: chỉ được xem
 */
export default function TamabeeSettingsPage() {
  const { user } = useAuth();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SettingResponse | null>(
    null,
  );

  // Kiểm tra quyền edit (chỉ ADMIN_TAMABEE)
  const canEdit = user?.role === "ADMIN_TAMABEE";

  // Fetch settings (không phân trang)
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingApi.getAll();
      setSettings(response || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError(tCommon("errorLoading"));
      setSettings([]);
      toast.error(tCommon("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle edit setting
  const handleEditSetting = (setting: SettingResponse) => {
    if (!canEdit) {
      toast.error(t("viewOnly"));
      return;
    }
    setEditingSetting(setting);
    setFormOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchSettings();
  };

  // Get badge variant for value type
  const getValueTypeBadge = (valueType: string) => {
    switch (valueType) {
      case "INTEGER":
        return <Badge variant="default">INTEGER</Badge>;
      case "DECIMAL":
        return <Badge variant="secondary">DECIMAL</Badge>;
      case "BOOLEAN":
        return <Badge variant="outline">BOOLEAN</Badge>;
      case "STRING":
      default:
        return <Badge variant="outline">STRING</Badge>;
    }
  };

  // Format value display
  const formatValue = (setting: SettingResponse) => {
    if (setting.valueType === "BOOLEAN") {
      return setting.settingValue.toLowerCase() === "true" ? (
        <Badge variant="default" className="bg-green-500">
          true
        </Badge>
      ) : (
        <Badge variant="secondary">false</Badge>
      );
    }
    return <span className="font-mono text-sm">{setting.settingValue}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {!canEdit && (
            <Badge variant="secondary" className="mr-2">
              {t("viewOnly")}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {tCommon("refresh")}
          </Button>
        </div>
      </div>

      {/* Settings Table */}
      <div className="rounded-xl border">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : !settings || settings.length === 0 ? (
          <div className="p-12 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("noSettings")}</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    {t("table.settingKey")}
                  </TableHead>
                  <TableHead className="w-[150px]">
                    {t("table.settingValue")}
                  </TableHead>
                  <TableHead className="w-[100px]">
                    {t("table.valueType")}
                  </TableHead>
                  <TableHead>{t("table.description")}</TableHead>
                  <TableHead className="w-[150px]">
                    {t("table.updatedAt")}
                  </TableHead>
                  {canEdit && (
                    <TableHead className="w-[80px] text-right">
                      {t("table.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-mono text-sm">
                      {setting.settingKey}
                    </TableCell>
                    <TableCell>{formatValue(setting)}</TableCell>
                    <TableCell>
                      {getValueTypeBadge(setting.valueType)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {setting.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(setting.updatedAt)}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSetting(setting)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {/* Setting Form Dialog */}
      <SettingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        setting={editingSetting}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
