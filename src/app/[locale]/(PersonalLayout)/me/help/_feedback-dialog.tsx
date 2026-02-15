"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, ImagePlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { feedbackApi } from "@/lib/apis/feedback-api";
import { FEEDBACK_TYPES, type FeedbackType } from "@/types/feedback";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_IMAGES = 3;

/**
 * Dialog gửi feedback / yêu cầu hỗ trợ
 * Form: loại feedback, tiêu đề, mô tả, ảnh đính kèm (tối đa 3, compress WebP)
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  onSuccess,
}: FeedbackDialogProps) {
  const t = useTranslations("help.feedback");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");

  const [type, setType] = useState<FeedbackType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form khi đóng dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setType("");
      setTitle("");
      setDescription("");
      setFiles([]);
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  // Xử lý chọn ảnh
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const remaining = MAX_IMAGES - files.length;
    if (remaining <= 0) {
      toast.error(t("maxImages"));
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < Math.min(selectedFiles.length, remaining); i++) {
      try {
        const compressed = await compressImageToWebP(selectedFiles[i]);
        newFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        // Bỏ qua file không compress được
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Xóa ảnh
  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!type) newErrors.type = "required";
    if (!title.trim()) newErrors.title = "required";
    if (!description.trim()) newErrors.description = "required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi feedback
  const handleSubmit = async () => {
    if (!validate()) return;

    setSending(true);
    try {
      await feedbackApi.createFeedback(
        {
          type: type as string,
          title: title.trim(),
          description: description.trim(),
        },
        files.length > 0 ? files : undefined,
      );
      toast.success(t("success"));
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors, t("error")));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="md:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Loại feedback */}
          <div>
            <Label>{t("type")}</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as FeedbackType);
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
            >
              <SelectTrigger
                className={errors.type ? "border-destructive" : ""}
              >
                <SelectValue placeholder={t("typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {getEnumLabel("feedbackType", ft, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tiêu đề */}
          <div>
            <Label>{t("titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder={t("titlePlaceholder")}
              className={errors.title ? "border-destructive" : ""}
            />
          </div>

          {/* Mô tả */}
          <div>
            <Label>{t("description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder={t("descriptionPlaceholder")}
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
          </div>

          {/* Ảnh đính kèm */}
          <div>
            <Label>{t("attachments")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("attachmentsHint")}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border"
                >
                  <Image
                    src={preview}
                    alt={`attachment-${index}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {files.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-muted-foreground/50 transition-colors"
                >
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {t("addImage")}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={sending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={sending}>
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sending ? t("sending") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
