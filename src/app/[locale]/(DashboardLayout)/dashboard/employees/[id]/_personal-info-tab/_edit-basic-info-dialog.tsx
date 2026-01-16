"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BasicInfoSection } from "@/types/employee-detail";
import { UpdateCompanyEmployeeRequest } from "@/lib/apis/company-employees";

interface EditBasicInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basicInfo?: BasicInfoSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
}

interface BasicInfoFormProps {
  basicInfo?: BasicInfoSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
  onClose: () => void;
}

export function EditBasicInfoDialog({
  open,
  onOpenChange,
  basicInfo,
  onSave,
}: EditBasicInfoDialogProps) {
  const t = useTranslations("employeeDetail.personalInfo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("basicInfo")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("basicInfo")}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <BasicInfoForm
            key={String(open)}
            basicInfo={basicInfo}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BasicInfoForm({ basicInfo, onSave, onClose }: BasicInfoFormProps) {
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [name, setName] = useState(basicInfo?.name || "");
  const [dateOfBirth, setDateOfBirth] = useState(basicInfo?.dateOfBirth || "");
  const [gender, setGender] = useState(basicInfo?.gender || "");
  const [nationality, setNationality] = useState(basicInfo?.nationality || "");
  const [maritalStatus, setMaritalStatus] = useState(
    basicInfo?.maritalStatus || "",
  );
  const [nationalId, setNationalId] = useState(basicInfo?.nationalId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSave({
      name: name || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      nationality: nationality || undefined,
      maritalStatus: maritalStatus || undefined,
      nationalId: nationalId || undefined,
    } as UpdateCompanyEmployeeRequest);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">{tCommon("name")}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{tCommon("dateOfBirth")}</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{tCommon("gender")}</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder={tCommon("select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">{tEnums("gender.MALE")}</SelectItem>
              <SelectItem value="FEMALE">{tEnums("gender.FEMALE")}</SelectItem>
              <SelectItem value="OTHER">{tEnums("gender.OTHER")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">{tCommon("nationality")}</Label>
          <Input
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{tCommon("maritalStatus")}</Label>
          <Select value={maritalStatus} onValueChange={setMaritalStatus}>
            <SelectTrigger>
              <SelectValue placeholder={tCommon("select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SINGLE">
                {tEnums("maritalStatus.SINGLE")}
              </SelectItem>
              <SelectItem value="MARRIED">
                {tEnums("maritalStatus.MARRIED")}
              </SelectItem>
              <SelectItem value="DIVORCED">
                {tEnums("maritalStatus.DIVORCED")}
              </SelectItem>
              <SelectItem value="WIDOWED">
                {tEnums("maritalStatus.WIDOWED")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalId">{tCommon("nationalId")}</Label>
          <Input
            id="nationalId"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          {tCommon("cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? tCommon("saving") : tCommon("save")}
        </Button>
      </DialogFooter>
    </>
  );
}
