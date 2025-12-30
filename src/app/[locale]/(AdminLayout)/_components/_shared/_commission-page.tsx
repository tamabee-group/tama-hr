"use client";

import { useState, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, BarChart3, List } from "lucide-react";
import { PageHeader } from "./_page-header";

/**
 * Props cho CommissionPage component
 */
interface CommissionPageProps {
  /** Tiêu đề trang */
  title: string;
  /** Mô tả trang */
  description?: string;
  /** Component hiển thị bảng danh sách hoa hồng */
  tableComponent: ReactNode;
  /** Component hiển thị tổng hợp hoa hồng */
  summaryComponent: ReactNode;
  /** Callback khi nhấn nút làm mới */
  onRefresh: () => void;
}

/**
 * Layout dùng chung cho các trang Commission (Tamabee Admin và Employee)
 * Bao gồm PageHeader, Tabs (Danh sách/Tổng hợp), và RefreshButton
 */
export function CommissionPage({
  title,
  description,
  tableComponent,
  summaryComponent,
  onRefresh,
}: CommissionPageProps) {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        }
      />

      {/* Tabs: Danh sách và Tổng hợp */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tổng hợp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {tableComponent}
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          {summaryComponent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
