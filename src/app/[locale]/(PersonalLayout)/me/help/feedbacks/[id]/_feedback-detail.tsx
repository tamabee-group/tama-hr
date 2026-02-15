"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Loader2,
  MessageSquareOff,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { ImageZoomDialog } from "@/app/[locale]/_components/image/_image-zoom-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

// Màu badge theo status
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
  const [replyContent, setReplyContent] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchData = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
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
        if (showLoading) setLoading(false);
      }
    },
    [feedbackId, tErrors],
  );

  // Fetch lần đầu
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Tự động cập nhật khi có notification FEEDBACK
  useEffect(() => {
    const unsub = subscribeToNotificationEvents("FEEDBACK", () => {
      fetchData();
    });
    return unsub;
  }, [fetchData]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (feedback?.replies?.length) {
      scrollToBottom();
    }
  }, [feedback?.replies?.length, scrollToBottom]);

  // Gửi tin nhắn
  const handleSendReply = async () => {
    if ((!replyContent.trim() && replyFiles.length === 0) || sending) return;
    setSending(true);
    try {
      const reply = await feedbackApi.replyMyFeedback(
        feedbackId,
        replyContent.trim(),
        replyFiles.length > 0 ? replyFiles : undefined,
      );
      setFeedback((prev) =>
        prev ? { ...prev, replies: [...prev.replies, reply] } : prev,
      );
      setReplyContent("");
      setReplyFiles([]);
      toast.success(t("replySent"));
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors));
    } finally {
      setSending(false);
    }
  };

  // Chọn ảnh đính kèm (tối đa 3)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReplyFiles((prev) => [...prev, ...files].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Gửi bằng Ctrl+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendReply();
    }
  };

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

  const isClosed = feedback.status === "RESOLVED";

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <BackButton />

      {/* Thông tin feedback */}
      <GlassSection>
        <div className="p-6 space-y-4">
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
          <h1 className="text-xl font-semibold leading-tight">
            {feedback.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("createdAt")}: {formatDateTime(feedback.createdAt, locale)}
          </p>
          <div className="pt-2 border-t">
            <p className="text-sm whitespace-pre-wrap">
              {feedback.description}
            </p>
          </div>
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

      {/* Cuộc trò chuyện (chat-style) */}
      <GlassSection>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("replies")}</h2>

          {feedback.replies && feedback.replies.length > 0 ? (
            <div className="space-y-3">
              {feedback.replies.map((reply) => {
                const isUser = reply.fromUser;
                return (
                  <div
                    key={reply.id}
                    className={cn(
                      "flex gap-2",
                      isUser ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    {/* Avatar */}
                    {!isUser && (
                      <Avatar className="h-8 w-8 shrink-0 bg-primary p-1">
                        <AvatarImage
                          src="/logo/logo-simple-white.svg"
                          alt="Tamabee"
                        />
                        <AvatarFallback className="text-[10px]">
                          TB
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Nội dung tin nhắn */}
                    <div
                      className={cn(
                        "max-w-[80%] space-y-1",
                        isUser ? "items-end" : "items-start",
                      )}
                    >
                      <span
                        className={cn(
                          "block text-xs text-muted-foreground",
                          isUser ? "text-right" : "text-left",
                        )}
                      >
                        {isUser ? t("you") : "Tamabee Support"}
                      </span>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                          isUser
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md",
                        )}
                      >
                        {reply.content}
                        {reply.attachmentUrls &&
                          reply.attachmentUrls.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {reply.attachmentUrls.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => setZoomImage(getFileUrl(url))}
                                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20 hover:opacity-80 transition-opacity"
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
                      <span
                        className={cn(
                          "block text-[11px] text-muted-foreground",
                          isUser ? "text-right" : "text-left",
                        )}
                      >
                        {formatDateTime(reply.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
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

          {/* Form gửi tin nhắn */}
          {!isClosed && (
            <div className="pt-3 border-t space-y-2">
              {/* Preview ảnh đã chọn */}
              {replyFiles.length > 0 && (
                <div className="flex gap-2">
                  {replyFiles.map((file, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-lg border overflow-hidden"
                    >
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  disabled={replyFiles.length >= 3 || sending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("replyPlaceholder")}
                  rows={2}
                  className="resize-none flex-1"
                  disabled={sending}
                />
                <Button
                  size="icon"
                  onClick={handleSendReply}
                  disabled={
                    (!replyContent.trim() && replyFiles.length === 0) || sending
                  }
                  className="shrink-0"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
