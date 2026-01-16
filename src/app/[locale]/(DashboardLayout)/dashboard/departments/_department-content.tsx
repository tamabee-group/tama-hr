"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DepartmentTree } from "./_department-tree";
import { DepartmentDialog } from "./_department-dialog";
import { DepartmentEmployeesDialog } from "./_department-employees-dialog";
import { departmentApi } from "@/lib/apis/department-api";
import { DepartmentTreeNode } from "@/types/department";
import { getErrorMessage } from "@/lib/utils/get-error-message";

/**
 * Component chính quản lý phòng ban
 */
export function DepartmentContent() {
  const t = useTranslations("departments");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // State
  const [departments, setDepartments] = useState<DepartmentTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentTreeNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<DepartmentTreeNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Employees dialog state
  const [employeesDialogOpen, setEmployeesDialogOpen] = useState(false);
  const [departmentForEmployees, setDepartmentForEmployees] =
    useState<DepartmentTreeNode | null>(null);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await departmentApi.getDepartmentTree();
      setDepartments(data);
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Filter departments theo search keyword
  const filterDepartments = useCallback(
    (nodes: DepartmentTreeNode[], keyword: string): DepartmentTreeNode[] => {
      if (!keyword.trim()) return nodes;

      const lowerKeyword = keyword.toLowerCase();

      const filterNode = (
        node: DepartmentTreeNode,
      ): DepartmentTreeNode | null => {
        const matchesName = node.name.toLowerCase().includes(lowerKeyword);
        const matchesCode = node.code.toLowerCase().includes(lowerKeyword);
        const filteredChildren = node.children
          .map(filterNode)
          .filter((child): child is DepartmentTreeNode => child !== null);

        if (matchesName || matchesCode || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }

        return null;
      };

      return nodes
        .map(filterNode)
        .filter((node): node is DepartmentTreeNode => node !== null);
    },
    [],
  );

  const filteredDepartments = useMemo(
    () => filterDepartments(departments, searchKeyword),
    [departments, searchKeyword, filterDepartments],
  );

  // Handle add new
  const handleAddNew = () => {
    setSelectedDepartment(null);
    setDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (department: DepartmentTreeNode) => {
    setSelectedDepartment(department);
    setDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (department: DepartmentTreeNode) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  // Handle view employees
  const handleViewEmployees = (department: DepartmentTreeNode) => {
    setDepartmentForEmployees(department);
    setEmployeesDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      setIsDeleting(true);
      await departmentApi.deleteDepartment(departmentToDelete.id);
      toast.success(t("messages.deleteSuccess"));
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      fetchDepartments();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle dialog success
  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setSelectedDepartment(null);
    fetchDepartments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9"
            textTransform="none"
          />
        </div>

        {/* Add button */}
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t("create")}
        </Button>
      </div>

      {/* Department Tree */}
      <div className="md:border md:rounded-lg md:p-6 md:bg-card">
        <DepartmentTree
          departments={filteredDepartments}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onViewEmployees={handleViewEmployees}
          searchKeyword={searchKeyword}
        />
      </div>

      {/* Create/Edit Dialog */}
      <DepartmentDialog
        department={selectedDepartment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Employees Dialog */}
      <DepartmentEmployeesDialog
        department={departmentForEmployees}
        open={employeesDialogOpen}
        onOpenChange={setEmployeesDialogOpen}
      />
    </div>
  );
}
