"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import {
  LayoutTemplate,
  CalendarDays,
  ArrowLeftRight,
  ArrowRight,
} from "lucide-react";

/**
 * Dashboard quản lý ca làm việc
 * Hiển thị navigation cards đến các trang con: templates, assignments, swaps
 */
export function ShiftDashboard() {
  const t = useTranslations("shifts");
  const router = useRouter();

  const navigationCards = [
    {
      title: t("templatesTitle"),
      description: t("templatesDescription"),
      icon: <LayoutTemplate className="h-8 w-8 text-blue-500" />,
      href: "/dashboard/shifts/templates",
    },
    {
      title: t("assignmentsTitle"),
      description: t("assignmentsDescription"),
      icon: <CalendarDays className="h-8 w-8 text-green-500" />,
      href: "/dashboard/shifts/assignments",
    },
    {
      title: t("swapsTitle"),
      description: t("swapsDescription"),
      icon: <ArrowLeftRight className="h-8 w-8 text-orange-500" />,
      href: "/dashboard/shifts/swaps",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {navigationCards.map((card) => (
        <GlassCard
          key={card.href}
          variant="interactive"
          onClick={() => router.push(card.href)}
          className="p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            {card.icon}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {card.description}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-between">
            {t("table.status")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </GlassCard>
      ))}
    </div>
  );
}
