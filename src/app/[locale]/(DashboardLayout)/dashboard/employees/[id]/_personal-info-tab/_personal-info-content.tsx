"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { User } from "@/types/user";
import { EmployeePersonalInfo } from "@/types/employee-detail";
import { getEmployeePersonalInfo } from "@/lib/apis/employee-detail-api";
import {
  updateCompanyEmployee,
  uploadCompanyEmployeeAvatar,
  UpdateCompanyEmployeeRequest,
} from "@/lib/apis/company-employees";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionSidebar } from "./_section-sidebar";
import { BasicInfoCard } from "./_basic-info-card";
import { WorkInfoCard } from "./_work-info-card";
import { ContactInfoCard } from "./_contact-info-card";
import { BankDetailsCard } from "./_bank-details-card";
import { EmergencyContactCard } from "./_emergency-contact-card";
import { EditContactDialog } from "./_edit-contact-dialog";
import { EditBankDialog } from "./_edit-bank-dialog";
import { EditEmergencyDialog } from "./_edit-emergency-dialog";
import { EditBasicInfoDialog } from "./_edit-basic-info-dialog";

interface PersonalInfoContentProps {
  employee: User;
}

// Section IDs
type SectionId = "general" | "contact" | "bank" | "emergency";

// Loading skeleton
function PersonalInfoSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="lg:col-span-1">
        <Skeleton className="h-48" />
      </div>
      <div className="lg:col-span-3 space-y-6">
        <Skeleton className="h-60" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

export function PersonalInfoContent({ employee }: PersonalInfoContentProps) {
  const tCommon = useTranslations("common");
  const [data, setData] = useState<EmployeePersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [avatarKey, setAvatarKey] = useState(0); // Force re-render avatar

  // Edit dialog states
  const [editBasicInfoOpen, setEditBasicInfoOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editBankOpen, setEditBankOpen] = useState(false);
  const [editEmergencyOpen, setEditEmergencyOpen] = useState(false);

  // Refs cho các sections
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    general: null,
    contact: null,
    bank: null,
    emergency: null,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const personalInfo = await getEmployeePersonalInfo(employee.id);
      setData(personalInfo);
    } catch (err) {
      console.error("Error fetching personal info:", err);
    } finally {
      setLoading(false);
    }
  }, [employee.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll to section khi click sidebar
  const handleSectionClick = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadCompanyEmployeeAvatar(employee.id, file);
      toast.success(tCommon("updateSuccess"));
      setAvatarKey((prev) => prev + 1); // Force re-render avatar
      fetchData();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(tCommon("updateError"));
    }
  };

  // Handle update employee
  const handleUpdate = async (updateData: UpdateCompanyEmployeeRequest) => {
    try {
      await updateCompanyEmployee(employee.id, updateData);
      toast.success(tCommon("updateSuccess"));
      fetchData();
      return true;
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error(tCommon("updateError"));
      return false;
    }
  };

  if (loading) {
    return <PersonalInfoSkeleton />;
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
      {/* Content Area */}
      <div className="lg:col-span-4 space-y-6">
        {/* General Section: Basic Info + Work Info */}
        <div
          ref={(el) => {
            sectionRefs.current.general = el;
          }}
          className="space-y-6"
        >
          <BasicInfoCard
            basicInfo={data?.basicInfo}
            onAvatarUpload={handleAvatarUpload}
            onEdit={() => setEditBasicInfoOpen(true)}
            avatarKey={avatarKey}
          />
          <WorkInfoCard workInfo={data?.workInfo} onUpdate={handleUpdate} />
        </div>

        {/* Contact Section */}
        <div
          ref={(el) => {
            sectionRefs.current.contact = el;
          }}
        >
          <ContactInfoCard
            contactInfo={data?.contactInfo}
            onEdit={() => setEditContactOpen(true)}
          />
        </div>

        {/* Bank Section */}
        <div
          ref={(el) => {
            sectionRefs.current.bank = el;
          }}
        >
          <BankDetailsCard
            bankDetails={data?.bankDetails}
            onEdit={() => setEditBankOpen(true)}
          />
        </div>

        {/* Emergency Section */}
        <div
          ref={(el) => {
            sectionRefs.current.emergency = el;
          }}
        >
          <EmergencyContactCard
            emergencyContact={data?.emergencyContact}
            onEdit={() => setEditEmergencyOpen(true)}
          />
        </div>
      </div>

      {/* Edit Dialogs */}
      <EditBasicInfoDialog
        open={editBasicInfoOpen}
        onOpenChange={setEditBasicInfoOpen}
        basicInfo={data?.basicInfo}
        onSave={handleUpdate}
      />

      <EditContactDialog
        open={editContactOpen}
        onOpenChange={setEditContactOpen}
        contactInfo={data?.contactInfo}
        onSave={handleUpdate}
      />

      <EditBankDialog
        open={editBankOpen}
        onOpenChange={setEditBankOpen}
        bankDetails={data?.bankDetails}
        onSave={handleUpdate}
      />

      <EditEmergencyDialog
        open={editEmergencyOpen}
        onOpenChange={setEditEmergencyOpen}
        emergencyContact={data?.emergencyContact}
        onSave={handleUpdate}
      />
      {/* Section Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <SectionSidebar
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </div>
    </div>
  );
}
