"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props cho Pagination component
 * Dùng chung cho tất cả các table có phân trang
 */
interface PaginationProps {
  /** Trang hiện tại (0-indexed) */
  page: number;
  /** Tổng số trang */
  totalPages: number;
  /** Callback khi thay đổi trang */
  onPageChange: (page: number) => void;
  /** Text cho nút trang trước (mặc định: "Trước") */
  previousText?: string;
  /** Text cho nút trang sau (mặc định: "Sau") */
  nextText?: string;
}

/**
 * Component phân trang dùng chung
 * Hiển thị nút Trước/Sau và các số trang
 * Chỉ hiển thị khi có nhiều hơn 1 trang
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  previousText = "Trước",
  nextText = "Sau",
}: PaginationProps) {
  // Guard: không hiển thị nếu totalPages không hợp lệ hoặc chỉ có 1 trang
  if (!totalPages || isNaN(totalPages) || totalPages <= 1) {
    return null;
  }

  // Guard: đảm bảo page hợp lệ
  const safePage = isNaN(page)
    ? 0
    : Math.max(0, Math.min(page, totalPages - 1));

  const handlePrevious = () => {
    if (safePage > 0) {
      onPageChange(safePage - 1);
    }
  };

  const handleNext = () => {
    if (safePage < totalPages - 1) {
      onPageChange(safePage + 1);
    }
  };

  // Tạo danh sách các trang để hiển thị
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Hiển thị tất cả nếu ít trang
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(0);

      if (safePage > 2) {
        pages.push("ellipsis");
      }

      // Các trang xung quanh trang hiện tại
      const start = Math.max(1, safePage - 1);
      const end = Math.min(totalPages - 2, safePage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safePage < totalPages - 3) {
        pages.push("ellipsis");
      }

      // Luôn hiển thị trang cuối
      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Nút Previous */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={safePage === 0}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{previousText}</span>
      </Button>

      {/* Các số trang */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) =>
          pageNum === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={safePage === pageNum ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="min-w-[36px]"
            >
              {pageNum + 1}
            </Button>
          ),
        )}
      </div>

      {/* Nút Next */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={safePage >= totalPages - 1}
        className="gap-1"
      >
        <span className="hidden sm:inline">{nextText}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
