"use client";

import { useRouter } from "next/navigation";
import { CompanyDetailCard } from "@/app/[locale]/_components/company";
import { Company } from "@/types/company";
import { updateMyCompany, uploadMyCompanyLogo } from "@/lib/apis/company-api";
import { useAuth } from "@/hooks/use-auth";

interface ProfileFormProps {
  company: Company;
  canEdit: boolean;
}

export function CompanyProfileForm({ company, canEdit }: ProfileFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSave = async (
    data: {
      name: string;
      ownerName: string;
      email: string;
      phone: string;
      industry: string;
      zipcode: string;
      address: string;
      locale: string;
      language: string;
    },
    logoFile: File | null,
  ) => {
    if (logoFile) {
      await uploadMyCompanyLogo(logoFile);
    }
    await updateMyCompany(data);
    await refreshUser();
    router.refresh();
  };

  return (
    <CompanyDetailCard
      company={company}
      canEdit={canEdit}
      showWalletButton={true}
      onSave={handleSave}
    />
  );
}
