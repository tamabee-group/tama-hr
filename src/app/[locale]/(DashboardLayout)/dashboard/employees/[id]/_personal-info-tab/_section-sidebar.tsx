"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SectionId = "general" | "contact" | "bank" | "emergency";

interface SectionSidebarProps {
  activeSection: SectionId;
  onSectionClick: (sectionId: SectionId) => void;
}

const SECTIONS: { id: SectionId; labelKey: string }[] = [
  { id: "general", labelKey: "general" },
  { id: "contact", labelKey: "contact" },
  { id: "bank", labelKey: "bank" },
  { id: "emergency", labelKey: "emergency" },
];

export function SectionSidebar({
  activeSection,
  onSectionClick,
}: SectionSidebarProps) {
  const t = useTranslations("employeeDetail.personalInfoSections");

  return (
    <Card className="sticky top-20">
      <CardContent className="p-2">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "justify-start",
                activeSection === section.id && "bg-muted",
              )}
              onClick={() => onSectionClick(section.id)}
            >
              {t(section.labelKey)}
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
