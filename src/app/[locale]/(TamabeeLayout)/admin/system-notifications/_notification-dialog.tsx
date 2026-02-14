"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { systemNotificationApi } from "@/lib/apis/system-notification-api";
import { TARGET_AUDIENCES } from "@/types/system-notification";
import type { CreateSystemNotificationRequest } from "@/types/system-notification";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { MarkdownRenderer } from "@/app/[locale]/_components/_shared/_markdown-renderer";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
import {
  NOTIFICATION_TEMPLATES,
  type NotificationTemplate,
} from "@/constants/notification-templates";

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog tạo system notification mới
 * Form: tiêu đề (vi/en/ja), nội dung Markdown (vi/en/ja), target audience
 * Hỗ trợ preview Markdown
 */
export function NotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: NotificationDialogProps) {
  const t = useTranslations("systemNotifications");
  const tEnums = useTranslations("enums");

  const [sending, setSending] = useState(false);
  const [previewLang, setPreviewLang] = useState<string | null>(null);

  // Form state
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleJa, setTitleJa] = useState("");
  const [contentVi, setContentVi] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentJa, setContentJa] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const resetForm = () => {
    setTitleVi("");
    setTitleEn("");
    setTitleJa("");
    setContentVi("");
    setContentEn("");
    setContentJa("");
    setTargetAudience("");
    setPreviewLang(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const isValid =
    titleVi.trim() &&
    titleEn.trim() &&
    titleJa.trim() &&
    contentVi.trim() &&
    contentEn.trim() &&
    contentJa.trim() &&
    targetAudience;

  const applyTemplate = (template: NotificationTemplate) => {
    setTitleVi(template.titleVi);
    setTitleEn(template.titleEn);
    setTitleJa(template.titleJa);
    setContentVi(template.contentVi);
    setContentEn(template.contentEn);
    setContentJa(template.contentJa);
    setTargetAudience(template.targetAudience);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSending(true);

    try {
      const request: CreateSystemNotificationRequest = {
        titleVi: titleVi.trim(),
        titleEn: titleEn.trim(),
        titleJa: titleJa.trim(),
        contentVi: contentVi.trim(),
        contentEn: contentEn.trim(),
        contentJa: contentJa.trim(),
        targetAudience:
          targetAudience as CreateSystemNotificationRequest["targetAudience"],
      };

      await systemNotificationApi.create(request);
      toast.success(t("dialog.success"));
      onSuccess();
    } catch {
      toast.error(t("dialog.error"));
    } finally {
      setSending(false);
    }
  };

  // Lấy nội dung preview theo ngôn ngữ đang chọn
  const getPreviewContent = () => {
    if (previewLang === "vi") return contentVi;
    if (previewLang === "en") return contentEn;
    if (previewLang === "ja") return contentJa;
    return "";
  };

  const getPreviewTitle = () => {
    if (previewLang === "vi") return titleVi;
    if (previewLang === "en") return titleEn;
    if (previewLang === "ja") return titleJa;
    return "";
  };

  const previewTabs = [
    { value: "vi", label: t("detail.tabVi") },
    { value: "en", label: t("detail.tabEn") },
    { value: "ja", label: t("detail.tabJa") },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
        </DialogHeader>

        {previewLang ? (
          /* Chế độ preview */
          <div className="space-y-4 py-2">
            <GlassTabs
              tabs={previewTabs}
              value={previewLang}
              onChange={setPreviewLang}
            />
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-4">
                {getPreviewTitle() || "—"}
              </h3>
              <MarkdownRenderer content={getPreviewContent()} />
            </div>
          </div>
        ) : (
          /* Chế độ chỉnh sửa */
          <div className="space-y-4 py-2">
            {/* Template selector */}
            <div className="space-y-2">
              <Label>{t("dialog.useTemplate")}</Label>
              <Select
                onValueChange={(key) => {
                  const tmpl = NOTIFICATION_TEMPLATES.find(
                    (t) => t.key === key,
                  );
                  if (tmpl) applyTemplate(tmpl);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dialog.selectTemplate")} />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TEMPLATES.map((tmpl) => (
                    <SelectItem key={tmpl.key} value={tmpl.key}>
                      {t(`dialog.templates.${tmpl.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>{t("dialog.targetAudience")}</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dialog.selectAudience")} />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_AUDIENCES.map((audience) => (
                    <SelectItem key={audience} value={audience}>
                      {getEnumLabel("targetAudience", audience, tEnums)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tiêu đề 3 ngôn ngữ */}
            <div className="space-y-2">
              <Label>{t("dialog.titleVi")}</Label>
              <Input
                value={titleVi}
                onChange={(e) => setTitleVi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.titleEn")}</Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.titleJa")}</Label>
              <Input
                value={titleJa}
                onChange={(e) => setTitleJa(e.target.value)}
              />
            </div>

            {/* Nội dung Markdown 3 ngôn ngữ */}
            <div className="space-y-2">
              <Label>{t("dialog.contentVi")}</Label>
              <Textarea
                value={contentVi}
                onChange={(e) => setContentVi(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.contentEn")}</Label>
              <Textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.contentJa")}</Label>
              <Textarea
                value={contentJa}
                onChange={(e) => setContentJa(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {previewLang ? (
            <Button variant="outline" onClick={() => setPreviewLang(null)}>
              {t("dialog.edit")}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setPreviewLang("vi")}
              disabled={!contentVi && !contentEn && !contentJa}
            >
              {t("dialog.preview")}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!isValid || sending}>
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {sending ? t("dialog.sending") : t("dialog.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
