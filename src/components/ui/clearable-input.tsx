"use client";

import { X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { cn } from "@/lib/utils";
import type { InputProps } from "./input";

type TextTransform =
  | "none"
  | "capitalize"
  | "words"
  | "uppercase"
  | "lowercase";

interface ClearableInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  value: string;
  onClear: () => void;
  icon?: React.ReactNode;
  textTransform?: TextTransform;
  type?: InputProps["type"];
  isPassword?: boolean;
}

export function ClearableInput({
  value,
  onClear,
  icon,
  className,
  disabled,
  textTransform,
  type,
  isPassword,
  ...props
}: ClearableInputProps) {
  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type={type}
        value={value}
        disabled={disabled}
        textTransform={textTransform}
        isPassword={isPassword}
        className={cn(className)}
      />
      {icon && <InputGroupAddon>{icon}</InputGroupAddon>}
      {value && !disabled && (
        <InputGroupAddon
          onClick={onClear}
          className="cursor-pointer"
          align="inline-end"
        >
          <X />
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
