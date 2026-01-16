"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { WorkInfoSection } from "@/types/employee-detail";
import { UpdateCompanyEmployeeRequest } from "@/lib/apis/company-employees";
import { departmentApi } from "@/lib/apis/department-api";
import { DepartmentSummary } from "@/types/department";

interface EditWorkInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workInfo?: WorkInfoSection;
  onSave: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
}

export function EditWorkInfoDialog({
  open,
  onOpenChange,
  workInfo,
  onSave,
}: EditWorkInfoDialogProps) {
  const t = useTranslations("employeeDetail.personalInfo");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [employmentType, setEmploymentType] = useState("");
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(undefined);
  const [workLocation, setWorkLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch departments khi dialog mở
  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  // Reset form khi dialog mở
  useEffect(() => {
    if (open && workInfo) {
      setJobTitle(workInfo.jobTitle || "");
      setDepartmentId(workInfo.departmentId?.toString() || "");
      setEmploymentType(workInfo.employmentType || "");
      setJoiningDate(
        workInfo.joiningDate ? parseISO(workInfo.joiningDate) : undefined,
      );
      setWorkLocation(workInfo.workLocation || "");
    }
  }, [open, workInfo]);

  // Fetch departments cho dropdown
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const data = await departmentApi.getDepartmentsForDropdown();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSave({
      jobTitle: jobTitle || undefined,
      departmentId:
        departmentId && departmentId !== "none"
          ? parseInt(departmentId)
          : undefined,
      employmentType: employmentType || undefined,
      joiningDate: joiningDate ? format(joiningDate, "yyyy-MM-dd") : undefined,
      workLocation: workLocation || undefined,
    } as UpdateCompanyEmployeeRequest);
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workInfo")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("workInfo")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">{tCommon("jobTitle")}</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{tCommon("department")}</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger disabled={loadingDepartments}>
                <SelectValue placeholder={tCommon("select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{tCommon("none")}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tCommon("employmentType")}</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger>
                <SelectValue placeholder={tCommon("select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_TIME">
                  {tEnums("contractType.FULL_TIME")}
                </SelectItem>
                <SelectItem value="PART_TIME">
                  {tEnums("contractType.PART_TIME")}
                </SelectItem>
                <SelectItem value="CONTRACT">
                  {tEnums("contractType.CONTRACT")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tCommon("joiningDate")}</Label>
            <DatePicker
              value={joiningDate}
              onChange={setJoiningDate}
              placeholder={tCommon("select")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workLocation">{tCommon("workLocation")}</Label>
            <Input
              id="workLocation"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? tCommon("saving") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
