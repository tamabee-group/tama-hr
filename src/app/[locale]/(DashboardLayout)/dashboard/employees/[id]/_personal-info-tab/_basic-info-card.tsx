"use client";

import { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Camera, Pencil } from "lucide-react";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BasicInfoSection } from "@/types/employee-detail";
import { formatDate } from "@/lib/utils/format-date-time";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";
import { ImageCropDialog } from "@/app/[locale]/_components/image";
import { getFileUrl } from "@/lib/utils/file-url";

interface BasicInfoCardProps {
  basicInfo?: BasicInfoSection;
  onAvatarUpload?: (file: File) => Promise<void>;
  onEdit?: () => void;
  avatarKey?: number;
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between py-2 md:border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export function BasicInfoCard({
  basicInfo,
  onAvatarUpload,
  onEdit,
  avatarKey = 0,
}: BasicInfoCardProps) {
  const t = useTranslations("employeeDetail.personalInfo");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!onAvatarUpload) return;
    try {
      const compressedFile = await compressImageToWebP(croppedFile);
      await onAvatarUpload(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <>
      <GlassSection
        title={t("basicInfo")}
        headerAction={
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            {tCommon("edit")}
          </Button>
        }
      >
        {/* Mobile: avatar centered, info below */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
          <div className="relative group shrink-0">
            <Avatar
              className="h-24 w-24 md:h-20 md:w-20 cursor-pointer"
              onClick={handleAvatarClick}
            >
              {basicInfo?.avatar && (
                <AvatarImage
                  src={`${getFileUrl(basicInfo.avatar)}?v=${avatarKey}`}
                  alt={basicInfo?.name || ""}
                />
              )}
              <AvatarFallback className="text-2xl md:text-xl">
                {basicInfo?.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
              {/* Overlay khi hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex-1 w-full grid gap-x-8 grid-cols-1 md:grid-cols-2">
            <InfoRow label={tCommon("name")} value={basicInfo?.name} />
            <InfoRow
              label={tCommon("dateOfBirth")}
              value={formatDate(basicInfo?.dateOfBirth, locale)}
            />
            <InfoRow
              label={tCommon("gender")}
              value={
                basicInfo?.gender
                  ? tEnums(`gender.${basicInfo.gender}`)
                  : undefined
              }
            />
            <InfoRow
              label={tCommon("nationality")}
              value={basicInfo?.nationality}
            />
            <InfoRow
              label={tCommon("maritalStatus")}
              value={basicInfo?.maritalStatus}
            />
            <InfoRow
              label={tCommon("nationalId")}
              value={basicInfo?.nationalId}
            />
          </div>
        </div>
      </GlassSection>

      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          cropShape="round"
        />
      )}
    </>
  );
}
