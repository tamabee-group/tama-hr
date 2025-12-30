"use client";

import { ReactNode } from "react";

/**
 * Props cho PageHeader component
 */
interface PageHeaderProps {
  /** Tiêu đề trang */
  title: string;
  /** Mô tả ngắn về trang (optional) */
  description?: string;
  /** Actions hiển thị bên phải (buttons, etc.) */
  actions?: ReactNode;
}

/**
 * Component header dùng chung cho các trang trong AdminLayout
 * Design đơn giản: title + description bên trái, actions bên phải
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
