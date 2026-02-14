"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  GlassSection,
  GlassCard,
} from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import { Play, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils/format-date-time";

interface ApiLog {
  id: string;
  status: "success" | "error";
  timestamp: Date;
  endpoint: string;
  latency: string;
  responseLog?: Record<string, unknown>;
}

interface SchedulerActionProps {
  /** Key trong translations: schedulers.actions.{actionKey} */
  actionKey: string;
  /** Hàm gọi API */
  onExecute: () => Promise<unknown>;
  /** Nội dung form bổ sung (nếu có) */
  children?: React.ReactNode;
  /** Variant cho action card */
  variant?: "default" | "warning";
}

/**
 * Component dùng chung cho mỗi scheduler action
 * Hiển thị thông tin, nút thực thi, và bảng log kết quả
 */
export function SchedulerAction({
  actionKey,
  onExecute,
  children,
  variant = "default",
}: SchedulerActionProps) {
  const t = useTranslations("schedulers");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const endpoint = t(`actions.${actionKey}.endpoint`);

  const executeAction = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    try {
      const result = await onExecute();
      const latency = `${(performance.now() - startTime).toFixed(0)}ms`;

      setLogs((prev) => [
        {
          id: Date.now().toString(),
          status: "success",
          timestamp: new Date(),
          endpoint,
          latency,
          responseLog: (result || { success: true }) as Record<string, unknown>,
        },
        ...prev,
      ]);
      toast.success(t("messages.executeSuccess"));
    } catch (error) {
      const latency = `${(performance.now() - startTime).toFixed(0)}ms`;

      setLogs((prev) => [
        {
          id: Date.now().toString(),
          status: "error",
          timestamp: new Date(),
          endpoint,
          latency,
          responseLog: { error: String(error) },
        },
        ...prev,
      ]);
      toast.error(t("messages.executeError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("messages.copySuccess"));
  };

  const isWarning = variant === "warning";

  return (
    <div className="space-y-6">
      {/* Action Card */}
      <GlassSection title={t("quickActions")}>
        <div
          className={`p-4 border rounded-lg ${isWarning ? "bg-yellow-500/5 border-yellow-500/20" : ""}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={`font-medium ${isWarning ? "text-yellow-600" : ""}`}
              >
                {t(`actions.${actionKey}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t(`actions.${actionKey}.description`)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {endpoint}
                </code>
                <Badge
                  variant="outline"
                  className="font-mono bg-blue-500/10 text-blue-500"
                >
                  POST
                </Badge>
              </div>
              {/* Form bổ sung */}
              {children && <div className="mt-4">{children}</div>}
            </div>
            <Button
              onClick={executeAction}
              disabled={isLoading}
              variant={isWarning ? "outline" : "default"}
              className={`ml-4 shrink-0 ${isWarning ? "border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10" : ""}`}
            >
              <Play className="h-4 w-4 mr-2" />
              {t("execute")}
            </Button>
          </div>
        </div>
      </GlassSection>

      {/* Logs */}
      {logs.length > 0 && (
        <GlassCard className="py-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">
                    {t("table.status")}
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">
                    {t("table.timestamp")}
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">
                    {t("table.endpoint")}
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">
                    {t("table.latency")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        setExpandedLog(expandedLog === log.id ? null : log.id)
                      }
                    >
                      <td className="p-4">
                        <Badge
                          variant={
                            log.status === "success" ? "default" : "destructive"
                          }
                          className="font-mono"
                        >
                          {log.status === "success" ? "200 OK" : "500 ERR"}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="p-4">
                        <code className="text-xs text-blue-500">
                          {log.endpoint}
                        </code>
                      </td>
                      <td className="p-4 text-sm">{log.latency}</td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr>
                        <td colSpan={4} className="p-4 bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">
                              {t("table.responseLog")}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(log.responseLog, null, 2),
                                )
                              }
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {t("table.copy")}
                            </Button>
                          </div>
                          <pre className="bg-background p-3 rounded text-xs overflow-auto max-h-[300px] border">
                            {JSON.stringify(log.responseLog, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
