"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Paperclip,
  MessageSquareOff,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { ImageZoomDialog } from "@/app/[locale]/_components/image/_image-zoom-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { feedbackApi } from "@/lib/apis/feedback-api";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getFileUrl } from "@/lib/utils/file-url";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type {
  FeedbackDetail,
  FeedbackType,
  FeedbackStatus,
} from "@/types/feedback";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const STATUS_BADGE_CLASSES: Record<FeedbackStatus, string> = {
  RECEIVED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  INVESTIGATING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_DISCUSSION:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  RESOLVED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
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

// Admin Tamabee có thể chuyển sang bất kỳ trạng thái nào
function getOtherStatuses(current: FeedbackStatus): FeedbackStatus[] {
  const all: FeedbackStatus[] = [
    "RECEIVED",
    "INVESTIGATING",
    "IN_DISCUSSION",
    "RESOLVED",
  ];
  return all.filter((s) => s !== current);
}

interface AdminFeedbackDetailProps {
  feedbackId: number;
}

/**
 * Chi tiết feedback cho admin — chỉ giám sát, không phản hồi.
 * Có thể cập nhật trạng thái và xóa feedback.
 * Phản hồi được thực hiện ở /support.
 */
export function AdminFeedbackDetail({ feedbackId }: AdminFeedbackDetailProps) {
  const t = useTranslations("adminFeedbacks");
  const tDialogs = useTranslations("dialogs");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const params = useParams();

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fetchFeedback = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
        const data = await feedbackApi.getAdminFeedbackDetail(feedbackId);
        setFeedback(data);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [feedbackId],
  );

  useEffect(() => {
    fetchFeedback(true);
  }, [fetchFeedback]);

  useEffect(() => {
    const unsub = subscribeToNotificationEvents("FEEDBACK", () => {
      fetchFeedback();
    });
    return unsub;
  }, [fetchFeedback]);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await feedbackApi.deleteFeedback(feedbackId);
      toast.success(t("detail.deleteSuccess"));
      router.push(`/${params.locale}/admin/feedbacks`);
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
    } finally {
      setDeleting(false);
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

  const otherStatuses = getOtherStatuses(feedback.status);

  return (
    <div className="max-w-[800px] mx-auto space-y-4">
      <BackButton />

      {/* Thông tin feedback */}
      <GlassSection>
        <div className="p-6 space-y-4">
          {/* Badges + Actions */}
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

            <div className="flex items-center gap-2">
              {otherStatuses.length > 0 && (
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
                    {otherStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getEnumLabel("feedbackStatus", status, tEnums)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Nút xóa */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {tDialogs("delete.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("detail.deleteConfirm")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {tDialogs("delete.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {tDialogs("delete.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
                    className="relative w-24 h-24 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={getFileUrl(url)}
                      alt={`attachment-${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassSection>

      {/* Phản hồi (chỉ đọc) */}
      <GlassSection>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("reply.title")}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/${params.locale}/support/feedbacks/${feedbackId}`)
              }
              className="gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("detail.replyInSupport")}
            </Button>
          </div>

          {feedback.replies && feedback.replies.length > 0 ? (
            <div className="space-y-4">
              {feedback.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={cn(
                    "border rounded-lg p-4 space-y-2",
                    reply.fromUser && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {reply.fromUser
                        ? `👤 ${reply.repliedByName}`
                        : reply.repliedByName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(reply.createdAt, locale)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                  {reply.attachmentUrls && reply.attachmentUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {reply.attachmentUrls.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setZoomImage(getFileUrl(url))}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                        >
                          <Image
                            src={getFileUrl(url)}
                            alt={`reply-img-${i + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("reply.noReplies")}
              </p>
            </div>
          )}
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
