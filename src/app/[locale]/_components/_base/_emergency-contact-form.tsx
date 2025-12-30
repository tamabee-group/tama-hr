"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface EmergencyContactFormData {
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
}

interface EmergencyContactFormProps {
  data: EmergencyContactFormData;
  onChange: (data: Partial<EmergencyContactFormData>) => void;
  isEditing: boolean;
  errors?: Record<string, string>;
}

/**
 * Form thông tin liên lạc khẩn cấp
 */
export function EmergencyContactForm({
  data,
  onChange,
  isEditing,
  errors,
}: EmergencyContactFormProps) {
  return (
    <div className="border-t pt-4 sm:border sm:rounded-lg sm:p-4 space-y-4">
      <h3 className="font-semibold text-sm">Liên lạc khẩn cấp</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-muted-foreground text-xs">Họ & tên</Label>
          <Input
            value={data.emergencyContactName}
            onChange={(e) => onChange({ emergencyContactName: e.target.value })}
            disabled={!isEditing}
            placeholder="Nguyễn Văn A"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Mối quan hệ</Label>
          <Input
            value={data.emergencyContactRelation}
            onChange={(e) =>
              onChange({ emergencyContactRelation: e.target.value })
            }
            disabled={!isEditing}
            placeholder="Bố/Mẹ/Vợ/Chồng"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Số điện thoại</Label>
        <Input
          value={data.emergencyContactPhone}
          onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
          disabled={!isEditing}
          placeholder="0901234567"
          className="mt-1"
        />
        {errors?.emergencyContactPhone && (
          <p className="text-sm text-destructive mt-1">
            {errors.emergencyContactPhone}
          </p>
        )}
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Địa chỉ</Label>
        <Input
          value={data.emergencyContactAddress}
          onChange={(e) =>
            onChange({ emergencyContactAddress: e.target.value })
          }
          disabled={!isEditing}
          placeholder="123 Đường ABC, Quận XYZ"
          className="mt-1"
        />
      </div>
    </div>
  );
}
