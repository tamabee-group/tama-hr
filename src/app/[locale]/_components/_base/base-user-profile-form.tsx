"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ConfirmChangesDialog,
  FieldChange,
} from "@/app/[locale]/_components/_base/confirm-changes-dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { ClearableInput } from "@/components/ui/clearable-input";
import { getFileUrl } from "@/lib/utils/file-url";
import {
  Edit,
  Save,
  X,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Users,
  Globe,
  Milestone,
  CreditCard,
  Landmark,
  ScanBarcode,
} from "lucide-react";
import { LANGUAGES, USER_STATUS } from "@/types/enums";
import { useZipcode } from "@/hooks/use-zipcode";
import { ImageCropDialog } from "@/app/[locale]/_components/_image-crop-dialog";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";
import { capitalizeWords } from "@/lib/utils/text-format";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { User } from "@/types/user";
import { validateEmail, validatePhone } from "@/lib/validation";

// Định nghĩa kiểu dữ liệu cho role option
interface RoleOption {
  readonly value: string;
  readonly label: string;
}

// Định nghĩa kiểu dữ liệu cho form
export interface UserProfileFormData {
  name: string;
  email: string;
  phone: string;
  language: string;
  status: string;
  zipCode: string;
  address: string;
  avatar: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
}

// Props cho BaseUserProfileForm
interface BaseUserProfileFormProps {
  user: User;
  title: string;
  roles: readonly RoleOption[];
  onSave: (userId: number, data: UserProfileFormData) => Promise<void>;
  onUploadAvatar: (userId: number, file: File) => Promise<void>;
}

export function BaseUserProfileForm({
  user,
  title,
  roles,
  onSave,
  onUploadAvatar,
}: BaseUserProfileFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Khởi tạo dữ liệu từ user
  const getInitialData = (): UserProfileFormData => ({
    name: user.profile?.name || "",
    email: user.email,
    phone: user.profile?.phone || "",
    language: user.language || "vi",
    status: user.status,
    zipCode: user.profile?.zipCode || "",
    address: user.profile?.address || "",
    avatar: user.profile?.avatar || "",
    bankName: user.profile?.bankName || "",
    bankAccount: user.profile?.bankAccount || "",
    bankAccountName: user.profile?.bankAccountName || "",
    emergencyContactName: user.profile?.emergencyContactName || "",
    emergencyContactPhone: user.profile?.emergencyContactPhone || "",
    emergencyContactRelation: user.profile?.emergencyContactRelation || "",
    emergencyContactAddress: user.profile?.emergencyContactAddress || "",
  });

  const [formData, setFormData] = useState<UserProfileFormData>(getInitialData);
  const [initialData] = useState<UserProfileFormData>(getInitialData);

  const { address: autoAddress, loading } = useZipcode(formData.zipCode);

  // Kiểm tra có thay đổi không
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData) ||
    avatarFile !== null;

  // Tự động điền địa chỉ khi nhập mã bưu điện
  useEffect(() => {
    if (autoAddress && isEditing) {
      setFormData((prev) => ({ ...prev, address: autoAddress }));
    }
  }, [autoAddress, isEditing]);

  // Mapping field sang nhóm
  const fieldGroups: Record<
    keyof UserProfileFormData,
    "basic" | "emergency" | "bank"
  > = {
    name: "basic",
    email: "basic",
    phone: "basic",
    language: "basic",
    status: "basic",
    zipCode: "basic",
    address: "basic",
    avatar: "basic",
    bankName: "bank",
    bankAccount: "bank",
    bankAccountName: "bank",
    emergencyContactName: "emergency",
    emergencyContactPhone: "emergency",
    emergencyContactRelation: "emergency",
    emergencyContactAddress: "emergency",
  };

  // Mapping tên field sang tiếng Việt
  const fieldLabels: Record<keyof UserProfileFormData, string> = {
    name: "Họ & tên",
    email: "Email",
    phone: "Số điện thoại",
    language: "Ngôn ngữ",
    status: "Trạng thái",
    zipCode: "Mã bưu điện",
    address: "Địa chỉ",
    avatar: "Ảnh đại diện",
    bankName: "Tên ngân hàng",
    bankAccount: "Số tài khoản",
    bankAccountName: "Tên chủ tài khoản",
    emergencyContactName: "Họ tên",
    emergencyContactPhone: "Số điện thoại",
    emergencyContactRelation: "Mối quan hệ",
    emergencyContactAddress: "Địa chỉ",
  };

  // Hàm format giá trị hiển thị (chuyển value sang label)
  const formatDisplayValue = (
    key: keyof UserProfileFormData,
    value: string,
  ): string => {
    if (!value) return "(trống)";

    // Format language
    if (key === "language") {
      const lang = LANGUAGES.find((l) => l.value === value);
      return lang ? `${lang.flag} ${lang.label}` : value;
    }

    // Format status
    if (key === "status") {
      const status = USER_STATUS.find((s) => s.value === value);
      return status ? status.label : value;
    }

    return value;
  };

  // Lấy danh sách các field đã thay đổi
  const getChangedFields = (): FieldChange[] => {
    const changes: FieldChange[] = [];

    (Object.keys(formData) as (keyof UserProfileFormData)[]).forEach((key) => {
      if (key === "avatar") {
        // Xử lý riêng cho avatar
        if (avatarFile) {
          changes.push({
            field: key,
            label: fieldLabels[key],
            oldValue: initialData[key] ? "Có ảnh" : "Chưa có ảnh",
            newValue: "Ảnh mới",
            group: fieldGroups[key],
          });
        }
      } else if (formData[key] !== initialData[key]) {
        changes.push({
          field: key,
          label: fieldLabels[key],
          oldValue: formatDisplayValue(key, initialData[key]),
          newValue: formatDisplayValue(key, formData[key]),
          group: fieldGroups[key],
        });
      }
    });

    return changes;
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (formData.emergencyContactPhone) {
      const emergencyPhoneError = validatePhone(formData.emergencyContactPhone);
      if (emergencyPhoneError)
        newErrors.emergencyContactPhone = emergencyPhoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mở dialog xác nhận trước khi lưu
  const handleSaveClick = () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
    setConfirmDialogOpen(true);
  };

  // Xử lý lưu sau khi xác nhận
  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    setIsSaving(true);
    try {
      if (avatarFile) {
        await onUploadAvatar(user.id, avatarFile);
      }

      await onSave(user.id, formData);

      toast.success("Cập nhật thành công");
      setIsEditing(false);
      setAvatarFile(null);
      setErrors({});
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      const message = error instanceof Error ? error.message : "Lỗi khi lưu";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    setFormData(initialData);
    setAvatarFile(null);
    setErrors({});
    setIsEditing(false);
  };

  // Xử lý chọn file ảnh
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý sau khi crop ảnh
  const handleCropComplete = async (croppedFile: File) => {
    try {
      const compressedFile = await compressImageToWebP(croppedFile);
      setAvatarFile(compressedFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      setFormData((prev) => ({ ...prev, avatar: previewUrl }));
    } catch (error) {
      console.error("Crop error:", error);
      toast.error("Lỗi khi xử lý ảnh");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveClick}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar và thông tin cơ bản */}
        <div className="grid grid-cols-3 gap-4">
          <div className="relative w-fit">
            <Avatar className="h-20 w-20 border-2 border-primary sm:relative sm:bottom-3">
              <AvatarImage src={getFileUrl(formData.avatar)} />
              <AvatarFallback>
                {formData.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
              {isEditing && (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="avatar-input"
                  />
                  <label
                    htmlFor="avatar-input"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </label>
                </>
              )}
            </Avatar>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center col-span-2">
            <div>
              <Label>Mã nhân viên</Label>
              <InputGroup>
                <InputGroupInput value={user.employeeCode || "-"} disabled />
                <InputGroupAddon>
                  <ScanBarcode />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <SelectWithIcon
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                disabled={!isEditing}
              >
                <SelectContent>
                  {USER_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectWithIcon>
            </div>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Họ & tên</Label>
            <ClearableInput
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: capitalizeWords(e.target.value),
                }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, name: "" }))}
              disabled={!isEditing}
              icon={<UserIcon />}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Email</Label>
            <ClearableInput
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, email: "" }))}
              disabled={!isEditing}
              icon={<Mail />}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>Vai trò</Label>
            <SelectWithIcon
              value={user.role}
              onValueChange={() => {}}
              icon={<Users />}
              disabled
            >
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithIcon>
          </div>

          <div>
            <Label>Số điện thoại</Label>
            <ClearableInput
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, phone: "" }))}
              disabled={!isEditing}
              icon={<Phone />}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label>Ngôn ngữ nhận thông báo</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value }))
              }
              icon={<Globe />}
              disabled={!isEditing}
            >
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithIcon>
          </div>

          <div>
            <Label>Mã bưu điện</Label>
            <ClearableInput
              value={formData.zipCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, zipCode: "" }))}
              disabled={!isEditing}
              placeholder="Nhập mã bưu điện"
              icon={<Milestone />}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Địa chỉ</Label>
            <ClearableInput
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, address: "" }))}
              disabled={!isEditing || loading}
              placeholder={loading ? "Đang tự nhập địa chỉ..." : "Nhập địa chỉ"}
              icon={loading ? <Spinner /> : <MapPin />}
            />
          </div>
        </div>

        {/* Thông tin liên lạc khẩn cấp và ngân hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded-md bg-secondary">
            <h3 className="font-semibold mb-4">Thông tin liên lạc khẩn cấp</h3>
            <div className="space-y-4">
              <div>
                <Label>Họ & tên</Label>
                <ClearableInput
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactName: capitalizeWords(e.target.value),
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactName: "",
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="Nhập họ tên"
                  icon={<UserIcon />}
                />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <ClearableInput
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactPhone: e.target.value,
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactPhone: "",
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="Nhập số điện thoại"
                  icon={<Phone />}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.emergencyContactPhone}
                  </p>
                )}
              </div>
              <div>
                <Label>Mối quan hệ</Label>
                <ClearableInput
                  value={formData.emergencyContactRelation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactRelation: e.target.value,
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactRelation: "",
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="VD: Bố/Mẹ/Vợ/Chồng"
                  icon={<Users />}
                />
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <ClearableInput
                  value={formData.emergencyContactAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactAddress: e.target.value,
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContactAddress: "",
                    }))
                  }
                  disabled={!isEditing}
                  placeholder="VD: Số 123, Đường ABC, Quận XYZ"
                  icon={<MapPin />}
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-md bg-secondary">
            <h3 className="font-semibold mb-4">Thông tin ngân hàng</h3>
            <div className="space-y-4">
              <div>
                <Label>Tên ngân hàng</Label>
                <ClearableInput
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankName: e.target.value,
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({ ...prev, bankName: "" }))
                  }
                  disabled={!isEditing}
                  placeholder="VD: Vietcombank"
                  icon={<Landmark />}
                />
              </div>
              <div>
                <Label>Số tài khoản</Label>
                <ClearableInput
                  value={formData.bankAccount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccount: e.target.value,
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({ ...prev, bankAccount: "" }))
                  }
                  disabled={!isEditing}
                  placeholder="Nhập số tài khoản"
                  icon={<CreditCard />}
                />
              </div>
              <div>
                <Label>Tên chủ tài khoản</Label>
                <ClearableInput
                  value={formData.bankAccountName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccountName: capitalizeWords(e.target.value),
                    }))
                  }
                  onClear={() =>
                    setFormData((prev) => ({ ...prev, bankAccountName: "" }))
                  }
                  disabled={!isEditing}
                  placeholder="Nhập tên chủ tài khoản"
                  icon={<UserIcon />}
                />
              </div>
              <span className="text-sm text-muted-foreground text-center italic block">
                ※ Đây là tài khoản nhận lương, vui lòng kiểm tra kỹ thông tin
                trước khi lưu.
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            Ngày tạo: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
          </span>
          <span>•</span>
          <span>
            Cập nhật lần cuối:{" "}
            {new Date(user.updatedAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </CardContent>

      {/* Dialog xác nhận thay đổi */}
      <ConfirmChangesDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        changes={getChangedFields()}
        onConfirm={handleConfirmSave}
        isLoading={isSaving}
      />
    </Card>
  );
}
