"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BankAccountType, BankAccountCategory } from "@/types/user";

export type JapanBankType = "normal" | "yucho";

const BANK_ACCOUNT_CATEGORIES = [
  { value: "futsu", label: "普通 (Thông thường)" },
  { value: "toza", label: "当座 (Vãng lai)" },
] as const;

export interface BankInfoFormData {
  bankAccountType: BankAccountType;
  japanBankType: JapanBankType;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  bankCode: string;
  bankBranchCode: string;
  bankBranchName: string;
  bankAccountCategory: BankAccountCategory | "";
  bankSymbol: string;
  bankNumber: string;
}

interface BankInfoFormProps {
  data: BankInfoFormData;
  onChange: (data: Partial<BankInfoFormData>) => void;
  isEditing: boolean;
}

/**
 * Form thông tin ngân hàng với tabs VN/JP
 */
export function BankInfoForm({ data, onChange, isEditing }: BankInfoFormProps) {
  const handleTabChange = (value: string) => {
    onChange({ bankAccountType: value as BankAccountType });
  };

  return (
    <div className="border-t pt-4 sm:border sm:rounded-lg sm:p-4 space-y-4">
      <h3 className="font-semibold text-sm">Thông tin ngân hàng</h3>

      <Tabs
        value={data.bankAccountType || "VN"}
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="VN" disabled={!isEditing}>
            Việt Nam
          </TabsTrigger>
          <TabsTrigger value="JP" disabled={!isEditing}>
            Nhật Bản
          </TabsTrigger>
        </TabsList>

        {/* Tab Việt Nam */}
        <TabsContent value="VN" className="space-y-3 mt-4">
          <div>
            <Label className="text-muted-foreground text-xs">
              Tên ngân hàng
            </Label>
            <Input
              value={data.bankName}
              onChange={(e) => onChange({ bankName: e.target.value })}
              disabled={!isEditing}
              placeholder="Vietcombank"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">
              Số tài khoản
            </Label>
            <Input
              value={data.bankAccount}
              onChange={(e) => onChange({ bankAccount: e.target.value })}
              disabled={!isEditing}
              placeholder="0123456789"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">
              Tên chủ tài khoản
            </Label>
            <Input
              value={data.bankAccountName}
              onChange={(e) =>
                onChange({ bankAccountName: e.target.value.toUpperCase() })
              }
              disabled={!isEditing}
              placeholder="NGUYEN VAN A"
              className="mt-1"
            />
          </div>
        </TabsContent>

        {/* Tab Nhật Bản */}
        <TabsContent value="JP" className="space-y-3 mt-4">
          {/* Chọn loại ngân hàng */}
          <RadioGroup
            value={data.japanBankType || "normal"}
            onValueChange={(value) =>
              onChange({ japanBankType: value as JapanBankType })
            }
            disabled={!isEditing}
            className="flex flex-col sm:flex-row gap-2 sm:gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="bank-normal" />
              <Label htmlFor="bank-normal" className="cursor-pointer text-sm">
                Ngân hàng thông thường
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yucho" id="bank-yucho" />
              <Label htmlFor="bank-yucho" className="cursor-pointer text-sm">
                ゆうちょ銀行
              </Label>
            </div>
          </RadioGroup>

          {/* Ngân hàng thông thường */}
          {(data.japanBankType || "normal") === "normal" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Tên ngân hàng (銀行名)
                  </Label>
                  <Input
                    value={data.bankName}
                    onChange={(e) => onChange({ bankName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Rakuten"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Mã ngân hàng (銀行コード)
                  </Label>
                  <Input
                    value={data.bankCode}
                    onChange={(e) => onChange({ bankCode: e.target.value })}
                    disabled={!isEditing}
                    placeholder="0005"
                    maxLength={4}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Tên chi nhánh (支店名)
                  </Label>
                  <Input
                    value={data.bankBranchName}
                    onChange={(e) =>
                      onChange({ bankBranchName: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="渋谷支店"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Mã chi nhánh (支店コード)
                  </Label>
                  <Input
                    value={data.bankBranchCode}
                    onChange={(e) =>
                      onChange({ bankBranchCode: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="150"
                    maxLength={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Loại tài khoản (口座種別)
                  </Label>
                  <Select
                    value={data.bankAccountCategory || ""}
                    onValueChange={(value) =>
                      onChange({
                        bankAccountCategory: value as BankAccountCategory,
                      })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANK_ACCOUNT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Số tài khoản (口座番号)
                  </Label>
                  <Input
                    value={data.bankAccount}
                    onChange={(e) => onChange({ bankAccount: e.target.value })}
                    disabled={!isEditing}
                    placeholder="6677889"
                    maxLength={7}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">
                  Tên chủ tài khoản (口座名義)
                </Label>
                <Input
                  value={data.bankAccountName}
                  onChange={(e) =>
                    onChange({ bankAccountName: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="SATO MISAKI"
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* ゆうちょ銀行 */}
          {data.japanBankType === "yucho" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    記号 (Kigou)
                  </Label>
                  <Input
                    value={data.bankSymbol}
                    onChange={(e) => onChange({ bankSymbol: e.target.value })}
                    disabled={!isEditing}
                    placeholder="10000"
                    maxLength={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    番号 (Bangou)
                  </Label>
                  <Input
                    value={data.bankNumber}
                    onChange={(e) => onChange({ bankNumber: e.target.value })}
                    disabled={!isEditing}
                    placeholder="12345678"
                    maxLength={8}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">
                  Tên chủ tài khoản (口座名義)
                </Label>
                <Input
                  value={data.bankAccountName}
                  onChange={(e) =>
                    onChange({ bankAccountName: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="SATO MISAKI"
                  className="mt-1"
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center italic bg-secondary py-1 rounded-xs">
        ※ Đây là tài khoản nhận lương, vui lòng kiểm tra kỹ thông tin.
      </p>
    </div>
  );
}
