"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationDialogVariant = "default" | "destructive" | "warning";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant?: ConfirmationDialogVariant;
  onConfirm: (inputValue?: string) => void;
  isLoading?: boolean;
  // Optional input field
  requireInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: "text" | "textarea";
  // Impact summary
  impactSummary?: string;
  actionSummary?: string;
}

const variantConfig = {
  default: {
    icon: Info,
    iconClassName: "text-primary",
    buttonVariant: "default" as const,
  },
  destructive: {
    icon: AlertCircle,
    iconClassName: "text-destructive",
    buttonVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-yellow-500",
    buttonVariant: "default" as const,
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  onConfirm,
  isLoading = false,
  requireInput = false,
  inputLabel,
  inputPlaceholder,
  inputType = "text",
  impactSummary,
  actionSummary,
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (requireInput && !inputValue.trim()) {
      setInputError(
        inputLabel ? `${inputLabel} là bắt buộc` : "Vui lòng nhập thông tin",
      );
      return;
    }
    setInputError("");
    onConfirm(requireInput ? inputValue : undefined);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state khi đóng dialog
      setInputValue("");
      setInputError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                variant === "destructive" && "bg-destructive/10",
                variant === "warning" && "bg-yellow-500/10",
                variant === "default" && "bg-primary/10",
              )}
            >
              <Icon className={cn("h-5 w-5", config.iconClassName)} />
            </div>
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Summary */}
          {actionSummary && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Hành động
              </p>
              <p className="text-sm">{actionSummary}</p>
            </div>
          )}

          {/* Impact Summary */}
          {impactSummary && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Ảnh hưởng
              </p>
              <p className="text-sm">{impactSummary}</p>
            </div>
          )}

          {/* Optional Input Field */}
          {requireInput && (
            <div className="space-y-2">
              {inputLabel && (
                <Label htmlFor="confirmation-input">{inputLabel}</Label>
              )}
              {inputType === "textarea" ? (
                <Textarea
                  id="confirmation-input"
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  className={cn(inputError && "border-destructive")}
                  rows={3}
                />
              ) : (
                <Input
                  id="confirmation-input"
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  className={cn(inputError && "border-destructive")}
                />
              )}
              {inputError && (
                <p className="text-sm text-destructive">{inputError}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
