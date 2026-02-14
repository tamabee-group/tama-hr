"use client";

import { InputGroup, InputGroupAddon } from "./input-group";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select";

interface SelectWithIconProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SelectWithIcon({
  value,
  onValueChange,
  placeholder,
  icon,
  disabled,
  className,
  children,
}: SelectWithIconProps) {
  return (
    <InputGroup className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="border-none bg-transparent dark:bg-transparent dark:hover:bg-transparent shadow-none focus:ring-0 focus-visible:ring-0 relative pl-2 my-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {icon && <InputGroupAddon>{icon}</InputGroupAddon>}
    </InputGroup>
  );
}
