"use client";

import { useTranslations } from "next-intl";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
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
  const t = useTranslations("users.bankInfo");

  return (
    <div className="border-t pt-4 sm:border sm:rounded-lg sm:p-4 space-y-4">
      <h3 className="font-semibold text-sm">{t("title")}</h3>

      <GlassTabs
        tabs={[
          { value: "VN", label: t("vietnam") },
          { value: "JP", label: t("japan") },
        ]}
        value={data.bankAccountType || "VN"}
        onChange={(value) =>
          onChange({ bankAccountType: value as BankAccountType })
        }
      />

      {/* Tab Việt Nam */}
      {(data.bankAccountType || "VN") === "VN" && (
        <div className="space-y-3 mt-4">
          <div>
            <Label className="text-muted-foreground text-xs">
              {t("bankName")}
            </Label>
            <Input
              value={data.bankName}
              onChange={(e) => onChange({ bankName: e.target.value })}
              disabled={!isEditing}
              placeholder={t("bankNamePlaceholderVN")}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">
              {t("accountNumber")}
            </Label>
            <Input
              value={data.bankAccount}
              onChange={(e) => onChange({ bankAccount: e.target.value })}
              disabled={!isEditing}
              placeholder={t("accountNumberPlaceholder")}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">
              {t("accountHolder")}
            </Label>
            <Input
              value={data.bankAccountName}
              onChange={(e) => onChange({ bankAccountName: e.target.value })}
              disabled={!isEditing}
              placeholder={t("accountHolderPlaceholderVN")}
              className="mt-1"
              textTransform="uppercase"
            />
          </div>
        </div>
      )}

      {/* Tab Nhật Bản */}
      {data.bankAccountType === "JP" && (
        <div className="space-y-3 mt-4">
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
                {t("normalBank")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yucho" id="bank-yucho" />
              <Label htmlFor="bank-yucho" className="cursor-pointer text-sm">
                {t("yuchoBank")}
              </Label>
            </div>
          </RadioGroup>

          {/* Ngân hàng thông thường */}
          {(data.japanBankType || "normal") === "normal" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    {t("bankNameJP")}
                  </Label>
                  <Input
                    value={data.bankName}
                    onChange={(e) => onChange({ bankName: e.target.value })}
                    disabled={!isEditing}
                    placeholder={t("bankNamePlaceholderJP")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    {t("bankCode")}
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
                    {t("branchName")}
                  </Label>
                  <Input
                    value={data.bankBranchName}
                    onChange={(e) =>
                      onChange({ bankBranchName: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder={t("branchNamePlaceholder")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    {t("branchCode")}
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
                    {t("accountType")}
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
                      <SelectValue placeholder={t("selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="futsu">{t("futsu")}</SelectItem>
                      <SelectItem value="toza">{t("toza")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    {t("accountNumberJP")}
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
                  {t("accountHolderJP")}
                </Label>
                <Input
                  value={data.bankAccountName}
                  onChange={(e) =>
                    onChange({ bankAccountName: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder={t("accountHolderPlaceholderJP")}
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
                    {t("kigou")}
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
                    {t("bangou")}
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
                  {t("accountHolderJP")}
                </Label>
                <Input
                  value={data.bankAccountName}
                  onChange={(e) =>
                    onChange({ bankAccountName: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder={t("accountHolderPlaceholderJP")}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center italic bg-secondary py-1 rounded-xs">
        {t("salaryAccountNote")}
      </p>
    </div>
  );
}
