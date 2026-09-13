import React, { useState } from "react";
import { Button } from "../ui/button";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  itemsPerPage?: number;
  emptyMessage?: string;
  // Slots for searchbar or actions header
  toolbar?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  itemsPerPage = 5,
  emptyMessage = "No records found.",
  toolbar,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when data length shrinks (e.g. active filtering)
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Optional Search / Filter Toolbar */}
      {toolbar}

      {/* Styled Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`py-3 px-6 ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-8 text-center text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {columns.map((col, index) => (
                      <td
                        key={index}
                        className={`py-4 px-6 ${col.className || ""}`}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? String(item[col.accessorKey] ?? "")
                            : null}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {startIndex + 1}
            </span>{" "}
            –{" "}
            <span className="font-medium text-slate-700">
              {Math.min(startIndex + itemsPerPage, data.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">{data.length}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="h-8 text-xs rounded-lg border-slate-200"
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={safeCurrentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 text-xs rounded-lg ${safeCurrentPage === page
                    ? "bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="h-8 text-xs rounded-lg border-slate-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
