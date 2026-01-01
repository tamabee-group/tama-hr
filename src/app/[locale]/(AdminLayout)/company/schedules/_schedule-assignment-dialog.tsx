"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkSchedule } from "@/types/attendance-records";
import { assignSchedule } from "@/lib/apis/work-schedule-api";
import { apiClient } from "@/lib/utils/fetch-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { PaginatedResponse } from "@/types/api";

interface Employee {
  id: number;
  name: string;
  email: string;
  employeeCode: string;
}

interface ScheduleAssignmentDialogProps {
  schedule: WorkSchedule;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialog gán lịch làm việc cho nhân viên
 * Hỗ trợ multi-select employees
 */
export function ScheduleAssignmentDialog({
  schedule,
  open,
  onClose,
  onSuccess,
}: ScheduleAssignmentDialogProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [effectiveTo, setEffectiveTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setFetchingEmployees(true);
      const response = await apiClient.get<PaginatedResponse<Employee>>(
        "/api/company/employees?page=0&size=100",
      );
      setEmployees(response.content);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setFetchingEmployees(false);
    }
  }, [tCommon]);

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open, fetchEmployees]);

  // Filter employees by search term
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Toggle employee selection
  const toggleEmployee = (employeeId: number) => {
    setSelectedIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
  };

  // Select all filtered employees
  const selectAll = () => {
    const filteredIds = filteredEmployees.map((emp) => emp.id);
    setSelectedIds((prev) => {
      const newIds = new Set([...prev, ...filteredIds]);
      return Array.from(newIds);
    });
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error(t("assignment.selectEmployees"));
      return;
    }

    try {
      setLoading(true);
      await assignSchedule(
        schedule.id,
        selectedIds,
        effectiveFrom,
        effectiveTo || undefined,
      );
      toast.success(t("messages.assignSuccess"));
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("assignment.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Schedule name */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{t("table.name")}</p>
            <p className="font-medium">{schedule.name}</p>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">{t("form.effectiveFrom")}</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveTo">{t("form.effectiveTo")}</Label>
              <Input
                id="effectiveTo"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
              />
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>{t("form.selectEmployees")}</Label>
            <Input
              placeholder={`${tCommon("search")}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Select all / Deselect all */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t("assignment.selectedCount", { count: selectedIds.length })}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {tCommon("selectAll")}
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                {tCommon("deselectAll")}
              </Button>
            </div>
          </div>

          {/* Employee list */}
          {fetchingEmployees ? (
            <div className="text-center py-4">{tCommon("loading")}</div>
          ) : (
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {filteredEmployees.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  {tCommon("noResults")}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => toggleEmployee(employee.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{employee.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {employee.employeeCode} - {employee.email}
                        </p>
                      </div>
                      {selectedIds.includes(employee.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedIds.length === 0}
            >
              {loading ? tCommon("loading") : t("assignment.assign")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
