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
import { EmergencyContactSection } from "@/types/employee-detail";
import { UpdateCompanyEmployeeRequest } from "@/lib/apis/company-employees";

interface EditEmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyContact?: EmergencyContactSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
}

interface EmergencyFormProps {
  emergencyContact?: EmergencyContactSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
  onClose: () => void;
}

export function EditEmergencyDialog({
  open,
  onOpenChange,
  emergencyContact,
  onSave,
}: EditEmergencyDialogProps) {
  const t = useTranslations("employeeDetail.personalInfo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("emergencyContact")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("emergencyContact")}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <EmergencyForm
            key={String(open)}
            emergencyContact={emergencyContact}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmergencyForm({
  emergencyContact,
  onSave,
  onClose,
}: EmergencyFormProps) {
  const tCommon = useTranslations("common");

  const [name, setName] = useState(emergencyContact?.name || "");
  const [phone, setPhone] = useState(emergencyContact?.phone || "");
  const [relation, setRelation] = useState(emergencyContact?.relation || "");
  const [address, setAddress] = useState(emergencyContact?.address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSave({
      emergencyContactName: name || undefined,
      emergencyContactPhone: phone || undefined,
      emergencyContactRelation: relation || undefined,
      emergencyContactAddress: address || undefined,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyName">{tCommon("name")}</Label>
          <Input
            id="emergencyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">{tCommon("phone")}</Label>
          <Input
            id="emergencyPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyRelation">{tCommon("relation")}</Label>
          <Input
            id="emergencyRelation"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyAddress">{tCommon("address")}</Label>
          <Input
            id="emergencyAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
