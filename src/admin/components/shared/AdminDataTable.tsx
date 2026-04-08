/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Loader } from "lucide-react";

/* ---------------------------
   Debounce Hook (Typed)
---------------------------- */
// function useDebounce<T extends (...args: any[]) => void>(
//   callback: T,
//   delay: number
// ) {
//   const timer = useRef<NodeJS.Timeout | null>(null);

//   return (...args: Parameters<T>) => {
//     if (timer.current) clearTimeout(timer.current);

//     timer.current = setTimeout(() => {
//       callback(...args);
//     }, delay);
//   };
// }

/* ---------------------------
   Component Types
---------------------------- */
interface DataTableProps<TData> {
  columns?: ColumnDef<TData>[];
  data?: TData[];

  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;

  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  search?: string;
  onSearch?: (value: string) => void;
  isFetching?: boolean | null;

  globalFilterValue?: string;
  onGlobalFilterChange?: (value: string) => void;
  onRowClick?: (row: TData) => void;
  rowSelection?: any;
  onRowSelectionChange?: any;
  filters?: React.ReactNode;
}

/* ---------------------------
   DataTable Component
---------------------------- */
export function AdminDataTable<TData>({
  columns = [],
  data = [],
  totalCount = 0,
  pageIndex = 0,
  pageSize = 10,
  onPageChange = () => { },
  onPageSizeChange = () => { },
  onSearch = () => { },
  isFetching = null,
  // onGlobalFilterChange = () => {},
  globalFilterValue = "",
  onRowClick,
  rowSelection = {},
  onRowSelectionChange,
  filters,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState(globalFilterValue || "");

  // const debouncedFilter = useDebounce((value: string) => {
  //   onGlobalFilterChange && onGlobalFilterChange(value);
  // }, 300);

  // useEffect(() => {
  //   debouncedFilter(globalFilter);
  // }, [globalFilter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination: { pageIndex, pageSize }, rowSelection },
    onRowSelectionChange: onRowSelectionChange || (() => { }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  // const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {/* Search & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card/50 p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="pr-10 h-10 bg-background border-input/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {filters && (
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {filters}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/30 border-b border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`h-12 px-4 text-sm font-semibold text-foreground/80 ${(header.column.columnDef.meta as any)?.className}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-border/50">
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Loader className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(row.original);
                    } else if (onRowSelectionChange && table.getColumn("select")) {
                      row.toggleSelected();
                    }
                  }}
                  className={`group transition-all duration-200 ${
                    (onRowClick || (onRowSelectionChange && table.getColumn("select")))
                      ? "cursor-pointer hover:bg-muted/40 active:bg-muted/60"
                      : ""
                  } ${row.getIsSelected() ? "bg-primary/5 hover:bg-primary/10" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-3.5 text-sm group-hover:text-foreground transition-colors ${(cell.column.columnDef.meta as any)?.className}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">No results found</span>
                    <span className="text-xs">Try adjusting your search or filters</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between px-2 py-3 gap-4 bg-card/30 rounded-lg border border-border/50">
        {/* Showing X–Y of Z */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{pageIndex * pageSize + 1}</span>–
            <span className="font-medium text-foreground">{Math.min((pageIndex + 1) * pageSize, totalCount)}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span> results
          </div>
          <div className="flex items-center gap-2 pl-4 border-l border-border/50">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange?.(Number(e.target.value));
              }}
              className="h-8 border border-input/50 rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pageIndex - 1)}
            disabled={pageIndex <= 0}
            className="h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          {/* Page Selector */}
          <div className="flex items-center gap-1.5 text-sm bg-background border border-input/50 rounded-md px-2 py-1">
            <span className="text-muted-foreground">Page</span>
            <select
              value={pageIndex + 1}
              onChange={(e) => onPageChange?.(Number(e.target.value) - 1)}
              className="h-7 border-0 bg-transparent p-0 text-sm font-medium text-foreground focus:ring-0 cursor-pointer"
            >
              {Array.from(
                { length: Math.ceil(totalCount / pageSize) },
                (_, i) => i + 1
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground">of {Math.ceil(totalCount / pageSize)}</span>
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pageIndex + 1)}
            disabled={pageIndex + 1 >= Math.ceil(totalCount / pageSize)}
            className="h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
