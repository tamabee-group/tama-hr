"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Paperclip, MessageSquareOff, Send } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { ImageZoomDialog } from "@/app/[locale]/_components/image/_image-zoom-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feedbackApi } from "@/lib/apis/feedback-api";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getFileUrl } from "@/lib/utils/file-url";
import { cn } from "@/lib/utils";
import type {
  FeedbackDetail,
  FeedbackType,
  FeedbackStatus,
} from "@/types/feedback";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const STATUS_BADGE_CLASSES: Record<FeedbackStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESOLVED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const TYPE_BADGE_CLASSES: Record<FeedbackType, string> = {
  BUG_REPORT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  FEATURE_REQUEST:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  GENERAL_FEEDBACK:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  SUPPORT_REQUEST:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

/** Trạng thái hợp lệ cho transition */
function getValidTransitions(current: FeedbackStatus): FeedbackStatus[] {
  switch (current) {
    case "OPEN":
      return ["IN_PROGRESS", "CLOSED"];
    case "IN_PROGRESS":
      return ["RESOLVED", "CLOSED"];
    case "RESOLVED":
      return ["CLOSED"];
    case "CLOSED":
      return [];
    default:
      return [];
  }
}

const REPLY_TEMPLATE_KEYS = [
  "received",
  "investigating",
  "resolved",
  "needInfo",
  "planned",
] as const;

interface SupportFeedbackDetailProps {
  feedbackId: number;
}

/**
 * Chi tiết feedback cho SupportLayout
 * Tương tự AdminFeedbackDetail nhưng dùng trong SupportLayout
 */
export function SupportFeedbackDetail({
  feedbackId,
}: SupportFeedbackDetailProps) {
  const t = useTranslations("adminFeedbacks");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadFeedback = async () => {
      try {
        const data = await feedbackApi.getAdminFeedbackDetail(feedbackId);
        if (isMounted) setFeedback(data);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFeedback();
    return () => {
      isMounted = false;
    };
  }, [feedbackId]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      const reply = await feedbackApi.replyFeedback(
        feedbackId,
        replyContent.trim(),
      );
      setFeedback((prev) =>
        prev ? { ...prev, replies: [...prev.replies, reply] } : prev,
      );
      setReplyContent("");
      toast.success(t("reply.success"));
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await feedbackApi.updateFeedbackStatus(
        feedbackId,
        newStatus as FeedbackStatus,
      );
      setFeedback((prev) =>
        prev ? { ...prev, status: updated.status } : prev,
      );
      toast.success(t("detail.statusUpdated"));
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="space-y-4">
        <BackButton />
        <p className="text-muted-foreground text-center py-8">
          {t("detail.title")}
        </p>
      </div>
    );
  }

  const validTransitions = getValidTransitions(feedback.status);

  return (
    <div className="max-w-[800px] mx-auto space-y-4">
      <BackButton />

      {/* Thông tin feedback */}
      <GlassSection>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  TYPE_BADGE_CLASSES[feedback.type],
                )}
              >
                {getEnumLabel("feedbackType", feedback.type, tEnums)}
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  STATUS_BADGE_CLASSES[feedback.status],
                )}
              >
                {getEnumLabel("feedbackStatus", feedback.status, tEnums)}
              </span>
            </div>

            {validTransitions.length > 0 && (
              <Select
                value={feedback.status}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("detail.updateStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={feedback.status} disabled>
                    {getEnumLabel("feedbackStatus", feedback.status, tEnums)}
                  </SelectItem>
                  {validTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getEnumLabel("feedbackStatus", status, tEnums)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <h1 className="text-xl font-semibold leading-tight">
            {feedback.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              {t("detail.sender")}:{" "}
              <span className="font-medium text-foreground">
                {feedback.userName}
              </span>
            </span>
            {feedback.companyName && (
              <span>
                {t("detail.company")}:{" "}
                <span className="font-medium text-foreground">
                  {feedback.companyName}
                </span>
              </span>
            )}
            <span>
              {t("detail.email")}:{" "}
              <span className="font-medium text-foreground">
                {feedback.userEmail}
              </span>
            </span>
            <span>
              {t("detail.createdAt")}:{" "}
              <span className="font-medium text-foreground">
                {formatDateTime(feedback.createdAt, locale)}
              </span>
            </span>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm whitespace-pre-wrap">
              {feedback.description}
            </p>
          </div>

          {feedback.attachmentUrls && feedback.attachmentUrls.length > 0 && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                {t("detail.attachments")} ({feedback.attachmentUrls.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {feedback.attachmentUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setZoomImage(getFileUrl(url))}
                    className="w-24 h-24 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={getFileUrl(url)}
                      alt={`attachment-${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassSection>

      {/* Phản hồi */}
      <GlassSection>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("reply.title")}</h2>

          {feedback.replies && feedback.replies.length > 0 ? (
            <div className="space-y-4">
              {feedback.replies.map((reply) => (
                <div key={reply.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {reply.repliedByName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(reply.createdAt, locale)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("reply.noReplies")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("reply.noRepliesHint")}
              </p>
            </div>
          )}

          {/* Form reply */}
          <div className="pt-2 border-t space-y-3">
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(key) => {
                  setReplyContent(t(`reply.templates.${key}`));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("reply.useTemplate")} />
                </SelectTrigger>
                <SelectContent>
                  {REPLY_TEMPLATE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`reply.templates.${key}`).substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t("reply.placeholder")}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={!replyContent.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sending ? t("reply.sending") : t("reply.send")}
              </Button>
            </div>
          </div>
        </div>
      </GlassSection>

      <ImageZoomDialog
        open={!!zoomImage}
        onOpenChange={() => setZoomImage(null)}
        src={zoomImage || ""}
      />
    </div>
  );
}
