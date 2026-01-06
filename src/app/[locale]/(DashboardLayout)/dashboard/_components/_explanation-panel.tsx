"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ExplanationPanelProps {
  title: string;
  description: string;
  tips?: string[];
  workModeNote?: string;
  defaultCollapsed?: boolean;
  className?: string;
}

/**
 * Panel giải thích cho các section cấu hình
 * - Hiển thị title, description và tips
 * - Có thể collapse/expand để tiết kiệm không gian
 * - Hiển thị note về work mode nếu có
 */
export function ExplanationPanel({
  title,
  description,
  tips,
  workModeNote,
  defaultCollapsed = false,
  className,
}: ExplanationPanelProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-lg border bg-muted/30 p-4", className)}>
        <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3">
          <div className="space-y-3">
            {/* Description */}
            <p className="text-sm text-muted-foreground">{description}</p>

            {/* Work mode note */}
            {workModeNote && (
              <div className="flex items-start gap-2 rounded-md bg-primary/10 p-3">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-primary">{workModeNote}</p>
              </div>
            )}

            {/* Tips */}
            {tips && tips.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Tips</span>
                </div>
                <ul className="space-y-1 pl-6">
                  {tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground list-disc"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
