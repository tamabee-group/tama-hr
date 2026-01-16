"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { departmentApi } from "@/lib/apis/department-api";
import { getApprovers, ApproverInfo } from "@/lib/apis/company-employees";
import {
  DepartmentTreeNode,
  DepartmentSummary,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "@/types/department";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface DepartmentDialogProps {
  department: DepartmentTreeNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog form tạo/sửa phòng ban
 */
export function DepartmentDialog({
  department,
  open,
  onOpenChange,
  onSuccess,
}: DepartmentDialogProps) {
  const t = useTranslations("departments");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const isEdit = !!department;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown data
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [managers, setManagers] = useState<ApproverInfo[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Fetch dropdown data và department detail khi dialog mở
  useEffect(() => {
    if (open) {
      fetchDropdownData();
      if (department) {
        fetchDepartmentDetail(department.id);
      } else {
        resetForm();
      }
    }
  }, [open, department]);

  // Reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setParentId("");
    setManagerId("");
    setErrors({});
  };

  // Fetch department detail để lấy description và parentId
  const fetchDepartmentDetail = async (id: number) => {
    try {
      const detail = await departmentApi.getDepartment(id);
      setName(detail.name);
      setDescription(detail.description || "");
      setParentId(detail.parent?.id?.toString() || "");
      setManagerId(detail.manager?.id?.toString() || "");
      setErrors({});
    } catch (error) {
      console.error("Error fetching department detail:", error);
    }
  };

  // Fetch departments và managers cho dropdown
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [deptList, managerList] = await Promise.all([
        departmentApi.getDepartmentsForDropdown(),
        getApprovers(),
      ]);
      setDepartments(deptList);
      setManagers(managerList);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = tCommon("checkInfo");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsProcessing(true);

      // Xử lý parentId và managerId - nếu là "none" thì set undefined
      const finalParentId =
        parentId && parentId !== "none" ? parseInt(parentId) : undefined;
      const finalManagerId =
        managerId && managerId !== "none" ? parseInt(managerId) : undefined;

      if (isEdit && department) {
        const data: UpdateDepartmentRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: finalParentId,
          managerId: finalManagerId,
        };
        await departmentApi.updateDepartment(department.id, data);
        toast.success(t("messages.updateSuccess"));
      } else {
        const data: CreateDepartmentRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: finalParentId,
          managerId: finalManagerId,
        };
        await departmentApi.createDepartment(data);
        toast.success(t("messages.createSuccess"));
      }

      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Lọc departments để không cho phép chọn chính nó hoặc con của nó làm parent
  const getAvailableParents = () => {
    if (!isEdit || !department) return departments;
    // Loại bỏ department hiện tại khỏi danh sách parent
    return departments.filter((d) => d.id !== department.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">{t("fields.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder={t("placeholders.name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">{t("fields.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("placeholders.description")}
              rows={3}
            />
          </div>

          {/* Parent Department */}
          <div className="grid gap-2">
            <Label>{t("fields.parent")}</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger disabled={loadingDropdowns}>
                <SelectValue placeholder={t("placeholders.selectParent")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{tCommon("none")}</SelectItem>
                {getAvailableParents().map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager */}
          <div className="grid gap-2">
            <Label>{t("fields.manager")}</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger disabled={loadingDropdowns}>
                <SelectValue placeholder={t("placeholders.selectManager")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{tCommon("none")}</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id.toString()}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
