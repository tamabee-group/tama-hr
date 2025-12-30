"use client";

import { useState, useCallback } from "react";
import { WalletOverviewResponse } from "@/types/wallet";
import { walletApi } from "@/lib/apis/wallet-api";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Building2, Wallet, Gift } from "lucide-react";
import { toast } from "sonner";

interface CompanySearchProps {
  onSelectCompany: (company: WalletOverviewResponse) => void;
}

/**
 * Component tìm kiếm công ty cho Employee Support
 */
export function CompanySearch({ onSelectCompany }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<WalletOverviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search companies
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setCompanies([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await walletApi.searchCompanies(
        searchTerm.trim(),
        0,
        10,
      );
      setCompanies(response.content);
    } catch (error) {
      console.error("Failed to search companies:", error);
      toast.error("Không thể tìm kiếm công ty");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nhập tên công ty để tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : hasSearched && companies.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Không tìm thấy công ty nào
        </div>
      ) : companies.length > 0 ? (
        <div className="space-y-2">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectCompany(company)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{company.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.planName || "Chưa có gói"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {company.isFreeTrialActive && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Gift className="h-4 w-4" />
                        <span>Dùng thử</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-primary">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium">
                        {formatCurrency(company.balance, "vi")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
