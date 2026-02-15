"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Users, MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DepartmentTreeNode } from "@/types/department";
import { DepartmentActions } from "./_department-actions";

interface DepartmentTreeProps {
  departments: DepartmentTreeNode[];
  onEdit: (department: DepartmentTreeNode) => void;
  onDelete: (department: DepartmentTreeNode) => void;
  onViewEmployees: (department: DepartmentTreeNode) => void;
  searchKeyword?: string;
}

// Đếm tổng số phòng ban trong tree
function countDepartments(nodes: DepartmentTreeNode[]): number {
  return nodes.reduce((count, node) => {
    return count + 1 + countDepartments(node.children);
  }, 0);
}

// Highlight text khi search
function HighlightText({ text, keyword }: { text: string; keyword?: string }) {
  if (!keyword) return <>{text}</>;
  const regex = new RegExp(`(${keyword})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

// Card phòng ban cho Desktop
function DepartmentCard({
  node,
  onEdit,
  onDelete,
  onViewEmployees,
  searchKeyword,
}: {
  node: DepartmentTreeNode;
  onEdit: () => void;
  onDelete: () => void;
  onViewEmployees: () => void;
  searchKeyword?: string;
}) {
  const t = useTranslations("departments");

  return (
    <div className="relative bg-card border rounded-xl p-4 shadow-sm min-w-[200px] max-w-[240px] group">
      {/* Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DepartmentActions
          department={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewEmployees={onViewEmployees}
          trigger={
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-foreground pr-8">
            <HighlightText text={node.name} keyword={searchKeyword} />
          </h3>
          <Badge variant="secondary" className="text-xs font-mono mt-1">
            <HighlightText text={node.code} keyword={searchKeyword} />
          </Badge>
        </div>

        {node.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {node.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
          <Users className="h-4 w-4" />
          <span>
            {node.employeeCount} {t("fields.employeeUnit")}
          </span>
        </div>
      </div>
    </div>
  );
}

// Desktop: Horizontal tree node
function HorizontalTreeNode({
  node,
  isRoot = false,
  onEdit,
  onDelete,
  onViewEmployees,
  searchKeyword,
}: {
  node: DepartmentTreeNode;
  isRoot?: boolean;
  onEdit: (department: DepartmentTreeNode) => void;
  onDelete: (department: DepartmentTreeNode) => void;
  onViewEmployees: (department: DepartmentTreeNode) => void;
  searchKeyword?: string;
}) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex items-center">
      {!isRoot && <div className="w-8 h-0.5 bg-border shrink-0" />}

      <DepartmentCard
        node={node}
        onEdit={() => onEdit(node)}
        onDelete={() => onDelete(node)}
        onViewEmployees={() => onViewEmployees(node)}
        searchKeyword={searchKeyword}
      />

      {hasChildren && (
        <>
          <div className="w-8 h-0.5 bg-border shrink-0" />
          <div className="relative flex flex-col gap-4">
            {node.children.length > 1 && (
              <div
                className="absolute left-0 w-0.5 bg-border"
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: `calc(100% - 60px)`,
                }}
              />
            )}
            {node.children.map((child) => (
              <HorizontalTreeNode
                key={child.id}
                node={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewEmployees={onViewEmployees}
                searchKeyword={searchKeyword}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Mobile: Collapsible tree item
function CollapsibleTreeItem({
  node,
  level = 0,
  onEdit,
  onDelete,
  onViewEmployees,
  searchKeyword,
}: {
  node: DepartmentTreeNode;
  level?: number;
  onEdit: (department: DepartmentTreeNode) => void;
  onDelete: (department: DepartmentTreeNode) => void;
  onViewEmployees: (department: DepartmentTreeNode) => void;
  searchKeyword?: string;
}) {
  const t = useTranslations("departments");
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="flex items-center gap-2 py-3 border-b"
        style={{ paddingLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-90",
                )}
              />
            </Button>
          </CollapsibleTrigger>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              <HighlightText text={node.name} keyword={searchKeyword} />
            </span>
            <Badge variant="secondary" className="text-xs font-mono">
              <HighlightText text={node.code} keyword={searchKeyword} />
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Users className="h-3 w-3" />
            <span>
              {node.employeeCount} {t("fields.employeeUnit")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <DepartmentActions
          department={node}
          onEdit={() => onEdit(node)}
          onDelete={() => onDelete(node)}
          onViewEmployees={() => onViewEmployees(node)}
          trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* Children */}
      {hasChildren && (
        <CollapsibleContent>
          {node.children.map((child) => (
            <CollapsibleTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewEmployees={onViewEmployees}
              searchKeyword={searchKeyword}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function DepartmentTree({
  departments,
  onEdit,
  onDelete,
  onViewEmployees,
  searchKeyword,
}: DepartmentTreeProps) {
  const t = useTranslations("departments");

  const totalCount = useMemo(
    () => countDepartments(departments),
    [departments],
  );

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mb-4" />
        <p>{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop: Horizontal tree */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-6 min-w-max p-4">
          {departments.map((department) => (
            <HorizontalTreeNode
              key={department.id}
              node={department}
              isRoot
              onEdit={onEdit}
              onDelete={onDelete}
              onViewEmployees={onViewEmployees}
              searchKeyword={searchKeyword}
            />
          ))}
        </div>
      </div>

      {/* Mobile: Collapsible tree */}
      <div className="md:hidden">
        {departments.map((department) => (
          <CollapsibleTreeItem
            key={department.id}
            node={department}
            level={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewEmployees={onViewEmployees}
            searchKeyword={searchKeyword}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center pt-4 text-sm text-muted-foreground">
        <span>{t("tree.showingCount", { count: totalCount })}</span>
      </div>
    </div>
  );
}
