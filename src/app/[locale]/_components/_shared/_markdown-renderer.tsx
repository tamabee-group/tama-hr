"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// ============================================
// Helpers
// ============================================

/**
 * Kiểm tra link có phải internal navigation hay không
 * Internal links: bắt đầu bằng /me/ hoặc /dashboard/
 */
function isInternalLink(href: string): boolean {
  return href.startsWith("/me/") || href.startsWith("/dashboard/");
}

// ============================================
// Component
// ============================================

/**
 * Markdown renderer dùng chung — react-markdown + Tailwind prose
 * Custom link renderer: internal links dùng router.push(), external links mở tab mới
 */
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const router = useRouter();
  const locale = useLocale();

  const handleInternalClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      router.push(`/${locale}${href}`);
    },
    [router, locale],
  );

  const components: Components = {
    a: ({ href, children, ...props }) => {
      if (href && isInternalLink(href)) {
        return (
          <a
            href={`/${locale}${href}`}
            onClick={(e) => handleInternalClick(e, href)}
            className="text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
            {...props}
          >
            {children}
          </a>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold",
        "prose-p:leading-relaxed",
        "prose-li:leading-relaxed",
        "prose-a:no-underline",
        className,
      )}
    >
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
