import * as React from "react";

import { cn } from "@/lib/utils";

// Các kiểu transform text
type TextTransform =
  | "none"
  | "capitalize"
  | "words"
  | "uppercase"
  | "lowercase";

// Hàm transform text theo kiểu
function transformText(value: string, transform: TextTransform): string {
  switch (transform) {
    case "capitalize": // Viết hoa chữ cái đầu tiên trong ô
      return value.charAt(0).toUpperCase() + value.slice(1);
    case "words": // Viết hoa chữ cái đầu mỗi từ
      return value.replace(/\b\w/g, (char) => char.toUpperCase());
    case "uppercase": // Viết hoa hết
      return value.toUpperCase();
    case "lowercase": // Viết thường hết
      return value.toLowerCase();
    default:
      return value;
  }
}

export interface InputProps extends React.ComponentProps<"input"> {
  textTransform?: TextTransform;
  isPassword?: boolean; // Đánh dấu đây là field password (dù type có thể là "text" khi show)
}

function Input({
  className,
  type,
  textTransform = "capitalize", // Mặc định viết hoa chữ cái đầu tiên
  isPassword,
  onChange,
  ...props
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Không transform nếu là email, password, hoặc field được đánh dấu là password
    if (
      textTransform !== "none" &&
      type !== "email" &&
      type !== "password" &&
      !isPassword
    ) {
      e.target.value = transformText(e.target.value, textTransform);
    }
    onChange?.(e);
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "my-1.5",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Input };
