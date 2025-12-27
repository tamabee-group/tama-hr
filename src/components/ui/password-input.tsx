"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  icon?: React.ReactNode;
}

export function PasswordInput({
  className,
  icon,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type={showPassword ? "text" : "password"}
        className={cn(className)}
      />
      <InputGroupAddon>{icon ? icon : <Lock />}</InputGroupAddon>
      <InputGroupAddon
        onClick={() => setShowPassword(!showPassword)}
        className="cursor-pointer"
        align={"inline-end"}
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </InputGroupAddon>
    </InputGroup>
  );
}
