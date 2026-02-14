"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { HelpArticle } from "@/constants/help-center";

// ============================================
// Types
// ============================================

export interface ArticleWithTopic extends HelpArticle {
  topicKey: string;
  topicTitle: string;
}

interface HelpArticleListProps {
  articles: ArticleWithTopic[];
  isSearchResult?: boolean;
  /** Map of placeholder → value to replace in article content, e.g. { hourlyRate: "50,000đ" } */
  currencyMap?: Record<string, string>;
}

// ============================================
// Rich text renderer — hỗ trợ bold, italic, danh sách
// ============================================

function RichContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: { content: string; ordered: boolean }[] = [];
  let listType: "ol" | "ul" | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems.map((item, i) => (
      <li key={i}>{formatInline(item.content)}</li>
    ));
    if (listType === "ol") {
      elements.push(
        <ol
          key={`list-${elements.length}`}
          className="list-decimal list-inside space-y-1 my-2 ml-1"
        >
          {items}
        </ol>,
      );
    } else {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc list-inside space-y-1 my-2 ml-1"
        >
          {items}
        </ul>,
      );
    }
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Danh sách có thứ tự: "1. ", "2. ", ...
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (orderedMatch) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push({ content: orderedMatch[1], ordered: true });
      continue;
    }

    // Danh sách không thứ tự: "- "
    const unorderedMatch = trimmed.match(/^-\s+(.+)/);
    if (unorderedMatch) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push({ content: unorderedMatch[1], ordered: false });
      continue;
    }

    // Dòng trống
    if (!trimmed) {
      flushList();
      continue;
    }

    // Đoạn văn thường
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="my-2">
        {formatInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return (
    <div className="text-sm text-muted-foreground leading-relaxed">
      {elements}
    </div>
  );
}

/**
 * Format inline: **bold** và *italic*
 */
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Regex: **bold** hoặc *italic*
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text trước match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[1]}
        </strong>,
      );
    } else if (match[2]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic">
          {match[2]}
        </em>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  // Text còn lại
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ============================================
// Component
// ============================================

/**
 * Danh sách articles dạng Accordion — chỉ 1 article mở tại 1 thời điểm
 */
export function HelpArticleList({
  articles,
  isSearchResult = false,
  currencyMap,
}: HelpArticleListProps) {
  const t = useTranslations("help");
  const [openItem, setOpenItem] = useState<string>("");

  /** Replace currency placeholders like [[hourlyRate]] in content */
  const applyMap = (text: string) => {
    if (!currencyMap) return text;
    return text.replace(/\[\[(\w+)\]\]/g, (_, key) => currencyMap[key] ?? _);
  };

  // Empty state
  if (articles.length === 0 && isSearchResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          {t("noResults")}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {t("noResultsHint")}
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={openItem}
      onValueChange={setOpenItem}
    >
      {articles.map((article) => {
        const itemValue = `${article.topicKey}-${article.key}`;
        const isOpen = openItem === itemValue;
        return (
          <AccordionItem key={itemValue} value={itemValue}>
            <AccordionTrigger
              className={cn(
                "text-left no-underline hover:no-underline cursor-pointer hover:text-primary",
                isOpen && "text-primary",
              )}
            >
              <div>
                <span>
                  {t(`articles.${article.topicKey}_${article.key}.title`)}
                </span>
                {isSearchResult && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5 font-normal">
                    {t("topicLabel", { topic: article.topicTitle })}
                  </p>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <RichContent
                text={applyMap(
                  t(`articles.${article.topicKey}_${article.key}.content`),
                )}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
