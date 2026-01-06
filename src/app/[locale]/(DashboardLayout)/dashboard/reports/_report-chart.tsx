"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartData } from "@/types/attendance-records";

// Màu sắc cho biểu đồ
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
];

interface ReportChartProps {
  data: ChartData;
  type?: "bar" | "line" | "pie";
}

/**
 * Component hiển thị biểu đồ báo cáo
 * Hỗ trợ 3 loại: bar, line, pie
 */
export function ReportChart({
  data,
  type: initialType = "bar",
}: ReportChartProps) {
  const t = useTranslations("reports");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">(
    initialType,
  );

  // Chuyển đổi dữ liệu cho recharts
  const chartData = data.labels.map((label, index) => {
    const item: Record<string, string | number> = { name: label };
    data.datasets.forEach((dataset) => {
      item[dataset.label] = dataset.data[index];
    });
    return item;
  });

  // Dữ liệu cho pie chart (chỉ lấy dataset đầu tiên)
  const pieData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Bar
            key={dataset.label}
            dataKey={dataset.label}
            fill={
              typeof dataset.backgroundColor === "string"
                ? dataset.backgroundColor
                : COLORS[index % COLORS.length]
            }
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  // Render line chart
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Line
            key={dataset.label}
            type="monotone"
            dataKey={dataset.label}
            stroke={
              typeof dataset.borderColor === "string"
                ? dataset.borderColor
                : COLORS[index % COLORS.length]
            }
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  // Render pie chart
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex justify-end">
        <Select
          value={chartType}
          onValueChange={(v) => setChartType(v as "bar" | "line" | "pie")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">{t("chart.typeBar")}</SelectItem>
            <SelectItem value="line">{t("chart.typeLine")}</SelectItem>
            <SelectItem value="pie">{t("chart.typePie")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div className="w-full">
        {chartType === "bar" && renderBarChart()}
        {chartType === "line" && renderLineChart()}
        {chartType === "pie" && renderPieChart()}
      </div>
    </div>
  );
}
