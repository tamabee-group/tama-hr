"use client";

import { useTranslations } from "next-intl";
import {
  GlassNav,
  GlassNavItem,
} from "@/app/[locale]/_components/_glass-style";

type SectionId = "general" | "contact" | "bank" | "emergency";

interface SectionSidebarProps {
  activeSection: SectionId;
  onSectionClick: (sectionId: SectionId) => void;
}

const SECTION_KEYS: SectionId[] = ["general", "contact", "bank", "emergency"];

export function SectionSidebar({
  activeSection,
  onSectionClick,
}: SectionSidebarProps) {
  const t = useTranslations("employeeDetail.personalInfoSections");

  // Tạo items cho GlassNav
  const navItems: GlassNavItem[] = SECTION_KEYS.map((key) => ({
    key,
    label: t(key),
  }));

  return (
    <GlassNav
      items={navItems}
      activeKey={activeSection}
      onSelect={(key) => onSectionClick(key as SectionId)}
      className="sticky top-20"
    />
  );
}
