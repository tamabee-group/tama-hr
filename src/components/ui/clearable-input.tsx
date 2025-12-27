"use client";

import { X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { cn } from "@/lib/utils";

interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onClear: () => void;
  icon?: React.ReactNode;
}

export function ClearableInput({
  value,
  onClear,
  icon,
  className,
  disabled,
  ...props
}: ClearableInputProps) {
  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        value={value}
        disabled={disabled}
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
