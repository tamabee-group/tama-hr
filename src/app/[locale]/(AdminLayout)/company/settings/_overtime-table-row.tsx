"use client";

import { Input } from "@/components/ui/input";

interface MultiplierRowProps {
  label: string;
  legalMin: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Row cho bảng hệ số tăng ca (editable)
 */
export function MultiplierRow({
  label,
  legalMin,
  value,
  onChange,
  disabled = false,
  error,
}: MultiplierRowProps) {
  return (
    <tr>
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2 text-center text-muted-foreground">
        ×{legalMin}
      </td>
      <td className="px-3 py-2">
        <Input
          type="number"
          step="0.01"
          min={1}
          max={5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 1)}
          disabled={disabled}
          className="h-8 text-center"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </td>
    </tr>
  );
}

interface PreviewRowProps {
  label: string;
  hours: number;
  rate: number;
  amount: string;
}

/**
 * Row cho bảng preview tính toán tăng ca
 */
export function PreviewRow({ label, hours, rate, amount }: PreviewRowProps) {
  return (
    <tr className="border-t">
      <td className="p-2">{label}</td>
      <td className="text-right p-2">{hours}h</td>
      <td className="text-right p-2">×{rate.toFixed(2)}</td>
      <td className="text-right p-2 font-medium">{amount}</td>
    </tr>
  );
}
