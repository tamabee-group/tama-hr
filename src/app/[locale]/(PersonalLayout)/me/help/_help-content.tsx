"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquarePlus, History } from "lucide-react";
import {
  GlassNav,
  GlassSection,
  GlassTabs,
  type GlassNavItem,
  type GlassTabItem,
} from "@/app/[locale]/_components/_glass-style";
import { ExplanationPanel } from "@/app/[locale]/_components/_explanation-panel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  HELP_TOPICS,
  filterByRole,
  toRoleGroup,
} from "@/constants/help-center";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import type { CompanySettings } from "@/types/attendance-config";
import { formatTime } from "@/lib/utils/format-date-time";
import { HelpSearch } from "./_help-search";
import { HelpArticleList } from "./_help-article-list";
import { FeedbackDialog } from "./_feedback-dialog";

/**
 * Help Center — Client component chính
 * Layout: content ở giữa, GlassNav sidebar bên phải (lg+) / GlassTabs (mobile/md)
 * Fetch company settings để hiển thị dữ liệu thật trong help content
 */
export function HelpContent() {
  const t = useTranslations("help");
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc topic và article từ URL params
  const urlTopic = searchParams.get("topic");
  const urlArticle = searchParams.get("article");

  // Dialog gửi feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Company settings
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    companySettingsApi
      .getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  // Lọc topics theo role
  const roleGroup = toRoleGroup(user?.role);
  const filteredTopics = useMemo(
    () => filterByRole(HELP_TOPICS, roleGroup),
    [roleGroup],
  );

  // Topic đang chọn — ưu tiên từ URL, fallback topic đầu tiên
  const [activeTopic, setActiveTopic] = useState(
    urlTopic && filteredTopics.some((tp) => tp.key === urlTopic)
      ? urlTopic
      : filteredTopics[0]?.key || "",
  );

  // Article mở sẵn từ URL (format: "topicKey-articleKey")
  const defaultOpenArticle =
    urlTopic && urlArticle ? `${urlTopic}-${urlArticle}` : undefined;

  // Trạng thái tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // Tạo nav items cho GlassNav (desktop)
  const navItems: GlassNavItem[] = useMemo(
    () =>
      filteredTopics.map((topic) => ({
        key: topic.key,
        label: t(`topics.${topic.key}.title`),
        icon: topic.icon,
      })),
    [filteredTopics, t],
  );

  // Tạo tab items cho GlassTabs (mobile/md)
  const tabItems: GlassTabItem[] = useMemo(
    () =>
      filteredTopics.map((topic) => ({
        value: topic.key,
        label: t(`topics.${topic.key}.title`),
      })),
    [filteredTopics, t],
  );

  // Topic hiện tại
  const currentTopic = filteredTopics.find((tp) => tp.key === activeTopic);

  // Kết quả tìm kiếm — gộp từ tất cả topics
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();

    return filteredTopics.flatMap((topic) =>
      topic.articles
        .filter((article) => {
          const title = t(
            `articles.${topic.key}_${article.key}.title`,
          ).toLowerCase();
          const content = t(
            `articles.${topic.key}_${article.key}.content`,
          ).toLowerCase();
          return title.includes(query) || content.includes(query);
        })
        .map((article) => ({
          ...article,
          topicKey: topic.key,
          topicTitle: t(`topics.${topic.key}.title`),
        })),
    );
  }, [searchQuery, filteredTopics, t]);

  const isSearching = searchQuery.trim().length > 0;

  // Currency examples dựa trên locale khu vực hoạt động của company
  const currencyMap = useMemo(() => {
    const locale = user?.locale || "vi";
    if (locale === "ja")
      return {
        hourlyRate: "1,000円",
        hourlyDeduction: "1,000円",
        overtimeResult: "1,000 x 1.25 x 2 = 2,500円",
        monthlySalary: "200,000円",
        monthlyHourly: "200,000 / 176 = 1,136円",
        breakDeduction: "1,136 x 22 = 25,000円",
        lunchAllowance: "20,000円",
        transportAllowance: "10,000円",
      };
    // Default: vi (VND)
    return {
      hourlyRate: "50,000đ",
      hourlyDeduction: "50,000đ",
      overtimeResult: "50,000 x 1.25 x 2 = 125,000đ",
      monthlySalary: "10,000,000đ",
      monthlyHourly: "10,000,000 / 176 = 56,818đ",
      breakDeduction: "56,818 x 22 = 1,250,000đ",
      lunchAllowance: "500,000đ",
      transportAllowance: "300,000đ",
    };
  }, [user?.locale]);

  // Build settings info string cho hiển thị trong help content
  const settingsInfo = useMemo(() => {
    if (!settings) return null;
    const {
      attendanceConfig: a,
      payrollConfig: p,
      breakConfig: b,
      overtimeConfig: o,
    } = settings;

    // Format time: "09:00:00" → "09:00"
    const fmtTime = formatTime;

    // Translate breakType enum — không còn dùng
    return {
      workStart: fmtTime(a.defaultWorkStartTime),
      workEnd: fmtTime(a.defaultWorkEndTime),
      lateGrace: a.lateGraceMinutes,
      earlyLeaveGrace: a.earlyLeaveGraceMinutes,
      requireGeo: a.requireGeoLocation,
      geoRadius: a.geoFenceRadiusMeters,
      saturdayOff: a.saturdayOff,
      sundayOff: a.sundayOff,
      breakEnabled: b.breakEnabled,
      defaultBreakMinutes: b.defaultBreakMinutes,
      maxBreaksPerDay: b.maxBreaksPerDay,
      payDay: p.payDay,
      cutoffDay: p.cutoffDay,
      overtimeEnabled: o.overtimeEnabled,
      regularOvertimeRate: o.regularOvertimeRate,
      nightWorkRate: o.nightWorkRate,
    };
  }, [settings]);

  return (
    <div className="space-y-4">
      {/* Nút gửi feedback và xem lịch sử */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setFeedbackOpen(true)} className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          {t("feedback.button")}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/me/help/feedbacks")}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          {t("feedback.historyButton")}
        </Button>
      </div>

      {/* Mobile/Tablet: GlassTabs */}
      {!isSearching && (
        <div className="lg:hidden">
          <GlassTabs
            tabs={tabItems}
            value={activeTopic}
            onChange={setActiveTopic}
          />
        </div>
      )}

      {/* Main layout — content trái, sidebar phải */}
      <div className="flex gap-6">
        {/* Nội dung chính */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Ô tìm kiếm */}
          <HelpSearch value={searchQuery} onChange={setSearchQuery} />

          {/* Company settings info banner */}
          {settingsInfo && !isSearching && activeTopic === "attendance" && (
            <ExplanationPanel
              title={t("companyInfo.title")}
              description={`${t("companyInfo.workHours")}: ${settingsInfo.workStart} - ${settingsInfo.workEnd}`}
              defaultCollapsed
              tipsLabel={t("companyInfo.details")}
              tips={[
                `${t("companyInfo.lateGrace")}: ${settingsInfo.lateGrace}${t("companyInfo.minutes")}`,
                `${t("companyInfo.earlyLeaveGrace")}: ${settingsInfo.earlyLeaveGrace}${t("companyInfo.minutes")}`,
                `${t("companyInfo.geoRequired")}: ${settingsInfo.requireGeo ? "✓" : "✗"}${settingsInfo.requireGeo ? ` (${t("companyInfo.geoRadius")}: ${settingsInfo.geoRadius}m)` : ""}`,
                `${t("companyInfo.saturdayOff")}: ${settingsInfo.saturdayOff ? "✓" : "✗"}`,
                `${t("companyInfo.sundayOff")}: ${settingsInfo.sundayOff ? "✓" : "✗"}`,
              ]}
            />
          )}

          {settingsInfo && !isSearching && activeTopic === "breaks" && (
            <ExplanationPanel
              title={t("companyInfo.title")}
              description={`${t("companyInfo.breakEnabled")}: ${settingsInfo.breakEnabled ? "✓" : "✗"}`}
              defaultCollapsed
              tipsLabel={t("companyInfo.details")}
              tips={[
                `${t("companyInfo.defaultBreak")}: ${settingsInfo.defaultBreakMinutes}${t("companyInfo.minutes")}`,
                `${t("companyInfo.maxBreaks")}: ${settingsInfo.maxBreaksPerDay}`,
              ]}
            />
          )}

          {settingsInfo && !isSearching && activeTopic === "payroll" && (
            <ExplanationPanel
              title={t("companyInfo.title")}
              description={`${t("companyInfo.payDay")}: ${settingsInfo.payDay} | ${t("companyInfo.cutoffDay")}: ${settingsInfo.cutoffDay}`}
              defaultCollapsed
              tipsLabel={t("companyInfo.details")}
              tips={[
                `${t("companyInfo.overtimeEnabled")}: ${settingsInfo.overtimeEnabled ? "✓" : "✗"}`,
                ...(settingsInfo.overtimeEnabled
                  ? [
                      `${t("companyInfo.overtimeRate")}: x${settingsInfo.regularOvertimeRate}`,
                      `${t("companyInfo.nightRate")}: x${settingsInfo.nightWorkRate}`,
                    ]
                  : []),
              ]}
            />
          )}

          {/* Kết quả tìm kiếm hoặc articles theo topic */}
          <GlassSection>
            {isSearching ? (
              <HelpArticleList
                articles={searchResults || []}
                isSearchResult
                currencyMap={currencyMap}
              />
            ) : currentTopic ? (
              <HelpArticleList
                articles={currentTopic.articles.map((a) => ({
                  ...a,
                  topicKey: currentTopic.key,
                  topicTitle: t(`topics.${currentTopic.key}.title`),
                }))}
                currencyMap={currencyMap}
                defaultOpenArticle={
                  activeTopic === urlTopic ? defaultOpenArticle : undefined
                }
              />
            ) : null}
          </GlassSection>
        </main>

        {/* Sidebar bên phải — lg only */}
        {!isSearching && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <GlassNav
                items={navItems}
                activeKey={activeTopic}
                onSelect={setActiveTopic}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Dialog gửi feedback */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}
