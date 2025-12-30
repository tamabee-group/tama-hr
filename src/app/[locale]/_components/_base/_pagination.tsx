"use client";

import { Button } from "@/components/ui/button";

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
 * Hiển thị nút Trước/Sau và chỉ số trang hiện tại
 * Chỉ hiển thị khi có nhiều hơn 1 trang
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  previousText = "Trước",
  nextText = "Sau",
}: PaginationProps) {
  // Không hiển thị nếu chỉ có 1 trang hoặc ít hơn
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={page === 0}
      >
        {previousText}
      </Button>
      <span className="text-sm text-muted-foreground">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={page >= totalPages - 1}
      >
        {nextText}
      </Button>
    </div>
  );
}
