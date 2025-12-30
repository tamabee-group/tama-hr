"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Chart config type
export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

// Chart container
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={
        {
          "--color-deposit": config.deposit?.color || "#22c55e",
          "--color-billing": config.billing?.color || "#ef4444",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

// Custom tooltip
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  config?: ChartConfig;
  formatter?: (value: number) => string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  formatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {config?.[item.dataKey]?.label || item.name}:
            </span>
            <span className="font-medium">
              {formatter ? formatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Re-export recharts components
export {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
