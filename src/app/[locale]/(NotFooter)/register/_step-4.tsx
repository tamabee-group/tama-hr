"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Gift,
  Milestone,
  LocateFixed,
  Languages,
  Edit,
} from "lucide-react";
import { NextPage } from "next";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/use-key-down";
import { getIndustryLabel } from "@/constants/industries";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  handleBack: () => void;
  handleSubmit: () => void;
  handleEditInfo: () => void;
  submitting?: boolean;
}

const Step4: NextPage<Props> = ({
  formData,
  setFormData,
  handleBack,
  handleSubmit,
  handleEditInfo,
  submitting = false,
}) => {
  useKeyDown({ onEnter: handleSubmit, disabled: submitting });

  return (
    <div className="space-y-6 max-w-[500px] mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Xác nhận thông tin</CardTitle>
        <CardDescription>
          Kiểm tra lại thông tin và nhập mã giới thiệu nếu có
        </CardDescription>
      </div>

      {/* Mã giới thiệu */}
      <div>
        <Label htmlFor="referralCode">Mã giới thiệu (không bắt buộc)</Label>
        <ClearableInput
          id="referralCode"
          value={formData.referralCode || ""}
          onChange={(e) =>
            setFormData({ ...formData, referralCode: e.target.value })
          }
          onClear={() => setFormData({ ...formData, referralCode: "" })}
          icon={<Gift />}
          placeholder="Nhập mã giới thiệu..."
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Thông tin đăng ký</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditInfo}
            disabled={submitting}
            className="h-8 gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" />
            Sửa
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-top gap-2">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Tên công ty</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <User className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Chủ doanh nghiệp</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Email</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.email}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Số điện thoại</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.phone}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Milestone className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Mã bưu điện</p>
              <p className="text-sm text-muted-foreground wrap-break-words">
                {formData.zipcode}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Địa chỉ</p>
              <p className="text-sm text-muted-foreground wrap-break-words">
                {formData.address}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Briefcase className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Ngành nghề</p>
              <p className="text-sm text-muted-foreground truncate">
                {getIndustryLabel(formData.industry)}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <LocateFixed className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Khu vực</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.locale === "vi" ? "Việt Nam" : "Nhật Bản"}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Languages className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">Ngôn ngữ</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.language === "vi"
                  ? "Tiếng Việt"
                  : formData.language === "en"
                    ? "English"
                    : "日本語"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1"
          disabled={submitting}
        >
          Quay lại
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Hoàn tất đăng ký"}
        </Button>
      </div>
    </div>
  );
};

export default Step4;
