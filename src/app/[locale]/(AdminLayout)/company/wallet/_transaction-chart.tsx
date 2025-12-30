"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WalletTransactionResponse } from "@/types/wallet";
import { getMyTransactions } from "@/lib/apis/wallet-api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  locale: SupportedLocale;
  refreshTrigger?: number;
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
const MIN_DISPLAY_VALUE = 0.5;

// Chart colors
const CHART_COLORS = {
  deposit: "#22c55e",
  billing: "#ef4444",
};

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
  locale: SupportedLocale;
  labels: {
    deposit: string;
    billing: string;
  };
}

function CustomTooltip({
  active,
  payload,
  label,
  locale,
  labels,
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
              backgroundColor: data.hasDeposit
                ? CHART_COLORS.deposit
                : EMPTY_COLOR,
            }}
          />
          <span className="text-muted-foreground">{labels.deposit}:</span>
          <span className="font-medium">
            {formatCurrency(data.deposit, locale)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: data.hasBilling
                ? CHART_COLORS.billing
                : EMPTY_COLOR,
            }}
          />
          <span className="text-muted-foreground">{labels.billing}:</span>
          <span className="font-medium">
            {formatCurrency(data.billing, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Legend component
 */
interface CustomLegendProps {
  labels: {
    deposit: string;
    billing: string;
  };
}

function CustomLegend({ labels }: CustomLegendProps) {
  return (
    <div className="flex justify-end gap-4 pb-2">
      <div className="flex items-center gap-1.5">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: CHART_COLORS.deposit }}
        />
        <span className="text-sm">{labels.deposit}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: CHART_COLORS.billing }}
        />
        <span className="text-sm">{labels.billing}</span>
      </div>
    </div>
  );
}

/**
 * Chart hiển thị giao dịch theo tháng
 */
export function TransactionChart({
  locale,
  refreshTrigger,
}: TransactionChartProps) {
  const tEnums = useTranslations("enums");
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Labels cho chart
  const chartLabels = {
    deposit: tEnums("transactionType.DEPOSIT"),
    billing: tEnums("transactionType.BILLING"),
  };

  // Chart config với labels đã translate
  const chartConfig = {
    deposit: {
      label: chartLabels.deposit,
      color: CHART_COLORS.deposit,
    },
    billing: {
      label: chartLabels.billing,
      color: CHART_COLORS.billing,
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy 200 giao dịch gần nhất để cover 12 tháng
        const response = await getMyTransactions(undefined, 0, 200);
        const transactions = response.content;

        // Group theo tháng
        const monthlyMap = new Map<
          string,
          { deposit: number; billing: number }
        >();

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

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch transactions for chart:", error);
        // Vẫn hiển thị N tháng trống nếu lỗi
        const lastNMonths = getLastNMonths(monthCount);
        setData(
          lastNMonths.map((monthKey: string) => ({
            month: formatMonthLabel(monthKey),
            monthKey,
            deposit: 0,
            billing: 0,
            depositDisplay: MIN_DISPLAY_VALUE,
            billingDisplay: MIN_DISPLAY_VALUE,
            hasDeposit: false,
            hasBilling: false,
          })),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, monthCount]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col justify-end">
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[200px]">
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
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
              />
              <Tooltip
                content={<CustomTooltip locale={locale} labels={chartLabels} />}
              />
              <Legend
                content={<CustomLegend labels={chartLabels} />}
                verticalAlign="top"
              />
              <Bar
                dataKey="depositDisplay"
                name="deposit"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`deposit-${index}`}
                    fill={entry.hasDeposit ? CHART_COLORS.deposit : EMPTY_COLOR}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="billingDisplay"
                name="billing"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`billing-${index}`}
                    fill={entry.hasBilling ? CHART_COLORS.billing : EMPTY_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
