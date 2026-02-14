"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE } from "@/types/api";

interface BaseTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Tùy chọn filter
  filterColumn?: string;
  filterPlaceholder?: string;
  // Tùy chọn hiển thị
  showColumnToggle?: boolean;
  showPagination?: boolean;
  showRowSelection?: boolean;
  // Ẩn/hiện cột mặc định
  initialColumnVisibility?: VisibilityState;
  // Cấu hình pagination - mặc định 20 theo Requirements 1.6, 3.3
  pageSize?: number;
  // Server-side pagination
  serverPagination?: {
    page: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
  };
  // Text tùy chỉnh
  noResultsText?: string;
  selectedText?: string;
  previousText?: string;
  nextText?: string;
  columnsText?: string;
  // Row click handler
  onRowClick?: (row: TData) => void;
  // Custom row className
  rowClassName?: (row: TData) => string;
}

export function BaseTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter...",
  showColumnToggle = false,
  showPagination = true,
  showRowSelection = false,
  initialColumnVisibility = {},
  pageSize = DEFAULT_PAGE_SIZE,
  serverPagination,
  noResultsText = "No results.",
  selectedText = "row(s) selected.",
  previousText = "Previous",
  nextText = "Next",
  columnsText = "Columns",
  onRowClick,
  rowClassName,
}: BaseTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});

  // Lưu reference của initialColumnVisibility để so sánh
  const initialColumnVisibilityRef = React.useRef(initialColumnVisibility);

  // Cập nhật columnVisibility khi initialColumnVisibility thay đổi (responsive)
  // Chỉ update khi giá trị thực sự thay đổi (deep compare)
  React.useEffect(() => {
    const prevKeys = Object.keys(initialColumnVisibilityRef.current);
    const newKeys = Object.keys(initialColumnVisibility);

    const hasChanged =
      prevKeys.length !== newKeys.length ||
      newKeys.some(
        (key) =>
          initialColumnVisibilityRef.current[key] !==
          initialColumnVisibility[key],
      );

    if (hasChanged) {
      initialColumnVisibilityRef.current = initialColumnVisibility;
      setColumnVisibility(initialColumnVisibility);
    }
  }, [initialColumnVisibility]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Cấu hình pagination với pageSize mặc định = 20 (Requirements 1.6, 3.3)
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="w-full">
      {/* Toolbar: Filter + Column Toggle */}
      {(filterColumn || showColumnToggle) && (
        <div className="flex items-center py-4">
          {filterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn(filterColumn)
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {columnsText} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table với horizontal scroll trên mobile */}
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={`${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""} ${rowClassName?.(row.original) || ""}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {noResultsText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer: Row Selection + Pagination */}
      {((showRowSelection &&
        table.getFilteredSelectedRowModel().rows.length > 0) ||
        (showPagination && !serverPagination && table.getPageCount() > 1) ||
        (showPagination &&
          serverPagination &&
          serverPagination.totalElements > 0)) && (
        <div className="flex items-center justify-between py-4">
          {showRowSelection && (
            <div className="text-muted-foreground text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} {selectedText}
            </div>
          )}
          {showPagination && (
            <>
              {serverPagination
                ? // Server-side pagination - ẩn khi không có data
                  serverPagination.totalElements > 0 && (
                    <div className="flex items-center justify-end w-full text-sm gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          serverPagination.onPageChange(
                            serverPagination.page - 1,
                          )
                        }
                        disabled={serverPagination.page === 0}
                      >
                        {previousText}
                      </Button>
                      <span className="text-muted-foreground">
                        {serverPagination.page + 1} /{" "}
                        {serverPagination.totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          serverPagination.onPageChange(
                            serverPagination.page + 1,
                          )
                        }
                        disabled={
                          serverPagination.totalPages <= 1 ||
                          serverPagination.page >=
                            serverPagination.totalPages - 1
                        }
                      >
                        {nextText}
                      </Button>
                    </div>
                  )
                : // Client-side pagination - chỉ hiển thị khi có > 1 trang
                  table.getPageCount() > 1 && (
                    <div className="space-x-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        {previousText}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        {nextText}
                      </Button>
                    </div>
                  )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
