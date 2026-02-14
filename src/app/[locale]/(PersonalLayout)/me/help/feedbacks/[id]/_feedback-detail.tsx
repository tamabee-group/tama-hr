"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  MessageSquareOff,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { ImageZoomDialog } from "@/app/[locale]/_components/image/_image-zoom-dialog";
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

// Màu badge theo status
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

// ============================================
// Skeleton Component
// ============================================

function DetailSkeleton() {
  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <Skeleton className="h-8 w-24 rounded-full" />
      <GlassSection>
        <div className="space-y-4 p-6">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </GlassSection>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface FeedbackDetailContentProps {
  feedbackId: number;
}

export function FeedbackDetailContent({
  feedbackId,
}: FeedbackDetailContentProps) {
  const t = useTranslations("help.feedback");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await feedbackApi.getMyFeedbackDetail(feedbackId);
        setFeedback(data);
      } catch (error) {
        const errorCode = (error as { errorCode?: string }).errorCode;
        if (
          errorCode === "FEEDBACK_NOT_FOUND" ||
          errorCode === "FORBIDDEN" ||
          (error as { status?: number }).status === 404 ||
          (error as { status?: number }).status === 403
        ) {
          setNotFound(true);
        } else {
          toast.error(getErrorMessage(error, tErrors));
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [feedbackId, tErrors]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !feedback) {
    return (
      <div className="max-w-[700px] mx-auto space-y-4">
        <BackButton />
        <GlassSection>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {tErrors("FEEDBACK_NOT_FOUND")}
            </p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("listTitle")}
            </Button>
          </div>
        </GlassSection>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <BackButton />

      {/* Thông tin feedback */}
      <GlassSection>
        <div className="p-6 space-y-4">
          {/* Badges */}
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

          {/* Tiêu đề */}
          <h1 className="text-xl font-semibold leading-tight">
            {feedback.title}
          </h1>

          {/* Thời gian */}
          <p className="text-sm text-muted-foreground">
            {t("createdAt")}: {formatDateTime(feedback.createdAt, locale)}
          </p>

          {/* Mô tả */}
          <div className="pt-2 border-t">
            <p className="text-sm whitespace-pre-wrap">
              {feedback.description}
            </p>
          </div>

          {/* Ảnh đính kèm */}
          {feedback.attachmentUrls && feedback.attachmentUrls.length > 0 && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                {t("attachments")} ({feedback.attachmentUrls.length})
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

      {/* Phản hồi từ Tamabee */}
      <GlassSection>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("replies")}</h2>

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
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("noReplies")}</p>
              <p className="text-xs text-muted-foreground">
                {t("noRepliesHint")}
              </p>
            </div>
          )}
        </div>
      </GlassSection>

      {/* Image zoom dialog */}
      <ImageZoomDialog
        open={!!zoomImage}
        onOpenChange={() => setZoomImage(null)}
        src={zoomImage || ""}
      />
    </div>
  );
}
