"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { WalletTransactionResponse } from "@/types/wallet";
import { formatCurrency } from "@/lib/utils/format-currency";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import {
  ChartContainer,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "@/components/ui/chart";

interface TransactionChartProps {
  transactions: WalletTransactionResponse[];
}

interface MonthlyData {
  month: string;
  monthKey: string;
  deposit: number;
  billing: number;
  depositDisplay: number;
  billingDisplay: number;
  hasDeposit: boolean;
  hasBilling: boolean;
}

// Màu xám cho cột không có dữ liệu
const EMPTY_COLOR = "#d1d5db";
// Giá trị tối thiểu để hiển thị cột trống
const MIN_DISPLAY_VALUE = 0.3;
// Giá trị tối thiểu cho trục Y khi không có data
const MIN_Y_AXIS_VALUE = 10;

/**
 * Tạo danh sách N tháng gần nhất
 */
function getLastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push(monthKey);
  }

  return months;
}

/**
 * Format tháng: "2024-01" -> "T1/24"
 */
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `T${parseInt(month)}/${year.slice(-2)}`;
}

/**
 * Custom tooltip hiển thị giá trị thực
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MonthlyData;
  }>;
  label?: string;
  depositLabel: string;
  billingLabel: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  depositLabel,
  billingLabel,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: data.hasDeposit ? "#22c55e" : EMPTY_COLOR,
            }}
          />
          <span className="text-muted-foreground">{depositLabel}:</span>
          <span className="font-medium">{formatCurrency(data.deposit)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: data.hasBilling ? "#ef4444" : EMPTY_COLOR,
            }}
          />
          <span className="text-muted-foreground">{billingLabel}:</span>
          <span className="font-medium">{formatCurrency(data.billing)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Legend component
 */
interface CustomLegendProps {
  depositLabel: string;
  billingLabel: string;
}

function CustomLegend({ depositLabel, billingLabel }: CustomLegendProps) {
  return (
    <div className="flex justify-end gap-4 pb-2">
      <div className="flex items-center gap-1.5">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: "#22c55e" }}
        />
        <span className="text-sm">{depositLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: "#ef4444" }}
        />
        <span className="text-sm">{billingLabel}</span>
      </div>
    </div>
  );
}

/**
 * Chart hiển thị giao dịch theo tháng
 * Nhận transactions từ props, tính toán data cho chart
 */
export function TransactionChart({ transactions }: TransactionChartProps) {
  const t = useTranslations("wallet");
  const [isDesktop, setIsDesktop] = useState(false);

  // Labels từ translations
  const depositLabel = t("chart.deposit");
  const billingLabel = t("chart.billing");

  // Chart config với labels động
  const chartConfig = {
    deposit: {
      label: depositLabel,
      color: "#22c55e",
    },
    billing: {
      label: billingLabel,
      color: "#ef4444",
    },
  };

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Số tháng hiển thị: 12 trên desktop, 6 trên mobile
  const monthCount = isDesktop ? 12 : 6;

  // Tính toán data cho chart từ transactions
  const { data, yAxisMax } = useMemo(() => {
    // Group theo tháng
    const monthlyMap = new Map<string, { deposit: number; billing: number }>();

    transactions.forEach((tx: WalletTransactionResponse) => {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { deposit: 0, billing: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      if (tx.transactionType === "DEPOSIT") {
        monthData.deposit += tx.amount;
      } else if (tx.transactionType === "BILLING") {
        monthData.billing += Math.abs(tx.amount);
      }
    });

    // Tạo data cho N tháng gần nhất
    const lastNMonths = getLastNMonths(monthCount);

    // Tính max value để xác định giá trị hiển thị cho cột trống
    let max = 0;
    lastNMonths.forEach((monthKey: string) => {
      const values = monthlyMap.get(monthKey);
      if (values) {
        max = Math.max(max, values.deposit, values.billing);
      }
    });

    // Giá trị hiển thị cho cột trống (khoảng 3% của max)
    const emptyDisplayValue = max > 0 ? max * 0.03 : MIN_DISPLAY_VALUE;

    // Tính yAxisMax - làm tròn lên số đẹp
    const calculatedMax = Math.max(MIN_Y_AXIS_VALUE, Math.ceil(max * 1.2));
    const niceMax = Math.ceil(calculatedMax / 5) * 5; // Làm tròn lên bội số của 5

    const chartData: MonthlyData[] = lastNMonths.map((monthKey: string) => {
      const values = monthlyMap.get(monthKey) || { deposit: 0, billing: 0 };
      const hasDeposit = values.deposit > 0;
      const hasBilling = values.billing > 0;

      return {
        month: formatMonthLabel(monthKey),
        monthKey,
        deposit: values.deposit,
        billing: values.billing,
        depositDisplay: hasDeposit ? values.deposit : emptyDisplayValue,
        billingDisplay: hasBilling ? values.billing : emptyDisplayValue,
        hasDeposit,
        hasBilling,
      };
    });

    return {
      data: chartData,
      yAxisMax: niceMax || MIN_Y_AXIS_VALUE,
    };
  }, [transactions, monthCount]);

  return (
    <GlassCard className="h-[225px] p-4">
      <ChartContainer config={chartConfig} className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={50}
              ticks={[0, yAxisMax / 2, yAxisMax]}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
              }
              domain={[0, yAxisMax]}
            />
            <Tooltip
              content={
                <CustomTooltip
                  depositLabel={depositLabel}
                  billingLabel={billingLabel}
                />
              }
            />
            <Legend
              content={
                <CustomLegend
                  depositLabel={depositLabel}
                  billingLabel={billingLabel}
                />
              }
              verticalAlign="top"
            />
            <Bar dataKey="depositDisplay" name="deposit" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`deposit-${index}`}
                  fill={entry.hasDeposit ? "#22c55e" : EMPTY_COLOR}
                />
              ))}
            </Bar>
            <Bar dataKey="billingDisplay" name="billing" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`billing-${index}`}
                  fill={entry.hasBilling ? "#ef4444" : EMPTY_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </GlassCard>
  );
}
