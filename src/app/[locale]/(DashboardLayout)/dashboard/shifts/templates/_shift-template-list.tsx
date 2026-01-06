"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ShiftTemplate, ShiftTemplateInput } from "@/types/attendance-records";
import {
  getShiftTemplates,
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
} from "@/lib/apis/shift-api";
import { ShiftTemplateFormDialog } from "./_shift-template-form-dialog";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component danh sách mẫu ca làm việc với CRUD
 */
export function ShiftTemplateList() {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");

  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(
    null,
  );
  const [deletingTemplate, setDeletingTemplate] =
    useState<ShiftTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch danh sách templates
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getShiftTemplates(DEFAULT_PAGE, DEFAULT_LIMIT);
      setTemplates(response.content);
    } catch {
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Xử lý tạo/cập nhật template
  const handleSubmit = async (data: ShiftTemplateInput) => {
    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        await updateShiftTemplate(editingTemplate.id, data);
        toast.success(t("templateUpdateSuccess"));
      } else {
        await createShiftTemplate(data);
        toast.success(t("templateCreateSuccess"));
      }
      setIsFormOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch {
      toast.error(
        editingTemplate ? t("templateUpdateError") : t("templateCreateError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa template
  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      setIsSubmitting(true);
      await deleteShiftTemplate(deletingTemplate.id);
      toast.success(t("templateDeleteSuccess"));
      setDeletingTemplate(null);
      fetchTemplates();
    } catch {
      toast.error(t("templateDeleteError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở form tạo mới
  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  // Mở form chỉnh sửa
  const handleEdit = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  // Format thời gian HH:mm
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {tCommon("total")}: {templates.length}
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("createTemplate")}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {tCommon("loading")}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noTemplates")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.time")}</TableHead>
                  <TableHead>{t("table.break")}</TableHead>
                  <TableHead>{t("multiplier")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="w-[100px]">
                    {tCommon("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template, index) => (
                  <TableRow key={template.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      {formatTime(template.startTime)} -{" "}
                      {formatTime(template.endTime)}
                    </TableCell>
                    <TableCell>
                      {template.breakMinutes} {tCommon("minutes")}
                    </TableCell>
                    <TableCell>x{template.multiplier}</TableCell>
                    <TableCell>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                      >
                        {template.isActive
                          ? tCommon("active")
                          : tCommon("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ShiftTemplateFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        template={editingTemplate}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTemplate")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTemplate?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
