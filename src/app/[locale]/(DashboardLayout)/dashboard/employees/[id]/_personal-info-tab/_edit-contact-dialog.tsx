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
import { ContactInfoSection } from "@/types/employee-detail";
import { UpdateCompanyEmployeeRequest } from "@/lib/apis/company-employees";

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactInfo?: ContactInfoSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
}

interface ContactFormProps {
  contactInfo?: ContactInfoSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
  onClose: () => void;
}

export function EditContactDialog({
  open,
  onOpenChange,
  contactInfo,
  onSave,
}: EditContactDialogProps) {
  const t = useTranslations("employeeDetail.personalInfo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("contactInfo")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("contactInfo")}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ContactForm
            key={String(open)}
            contactInfo={contactInfo}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({ contactInfo, onSave, onClose }: ContactFormProps) {
  const tCommon = useTranslations("common");

  const [phone, setPhone] = useState(contactInfo?.phone || "");
  const [email, setEmail] = useState(contactInfo?.email || "");
  const [zipCode, setZipCode] = useState(contactInfo?.zipCode || "");
  const [address, setAddress] = useState(contactInfo?.address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSave({
      phone: phone || undefined,
      email: email || undefined,
      zipCode: zipCode || undefined,
      address: address || undefined,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{tCommon("phone")}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{tCommon("email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">{tCommon("zipCode")}</Label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{tCommon("address")}</Label>
          <Input
            id="address"
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
