"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import { AttendanceLocation } from "@/types/attendance-config";
import { attendanceLocationApi } from "@/lib/apis/attendance-location-api";
import { HelpLink } from "@/components/ui/help-link";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// ============================================
// Props
// ============================================

interface LocationManagementSectionProps {
  locations: AttendanceLocation[];
  onRefresh: () => void;
  onEdit: (location: AttendanceLocation) => void;
  onAdd: () => void;
}

// ============================================
// Component
// ============================================

/**
 * Section quản lý vị trí chấm công
 * Hiển thị danh sách locations với BaseTable, Google Maps link, CRUD buttons
 */
export function LocationManagementSection({
  locations,
  onRefresh,
  onEdit,
  onAdd,
}: LocationManagementSectionProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // State cho delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] =
    useState<AttendanceLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mở Google Maps với tọa độ
  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // Xử lý click nút xóa
  const handleDeleteClick = (location: AttendanceLocation) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  // Xác nhận xóa location
  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      setIsDeleting(true);
      await attendanceLocationApi.deleteLocation(locationToDelete.id);
      toast.success(t("locations.deleteSuccess"));
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
      onRefresh();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsDeleting(false);
    }
  };

  // Định nghĩa columns cho BaseTable
  const columns: ColumnDef<AttendanceLocation>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 60,
    },
    {
      accessorKey: "name",
      header: t("locations.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "address",
      header: t("locations.address"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.original.address || "-"}
        </span>
      ),
    },
    {
      accessorKey: "radiusMeters",
      header: t("locations.radius"),
      cell: ({ row }) => `${row.original.radiusMeters} m`,
    },
    {
      accessorKey: "isActive",
      header: t("locations.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive
            ? t("locations.active")
            : t("locations.inactive")}
        </Badge>
      ),
    },
    {
      id: "map",
      header: t("locations.map"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          onClick={(e) => {
            e.stopPropagation();
            openGoogleMaps(row.original.latitude, row.original.longitude);
          }}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Maps
        </Button>
      ),
    },
    {
      id: "actions",
      header: t("locations.actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 100,
    },
  ];

  return (
    <>
      <GlassSection
        title={t("locations.title")}
        headerAction={
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {t("locations.add")}
          </Button>
        }
      >
        <BaseTable
          columns={columns}
          data={locations}
          showPagination={false}
          noResultsText={t("locations.noData")}
        />
        <HelpLink topic="company_settings" article="location_settings" />
      </GlassSection>

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("locations.deleteConfirm")}
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
    </>
  );
}
