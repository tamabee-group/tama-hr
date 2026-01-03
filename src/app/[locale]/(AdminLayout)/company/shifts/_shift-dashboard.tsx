"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      href: "/company/shifts/templates",
    },
    {
      title: t("assignmentsTitle"),
      description: t("assignmentsDescription"),
      icon: <CalendarDays className="h-8 w-8 text-green-500" />,
      href: "/company/shifts/assignments",
    },
    {
      title: t("swapsTitle"),
      description: t("swapsDescription"),
      icon: <ArrowLeftRight className="h-8 w-8 text-orange-500" />,
      href: "/company/shifts/swaps",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {navigationCards.map((card) => (
        <Card
          key={card.href}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(card.href)}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            {card.icon}
            <div className="flex-1">
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription className="mt-1">
                {card.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between">
              {t("table.status")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
