import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Category, CategoryStatus } from "@/types/category";

const statusBadgeStyles: Record<CategoryStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/60 focus:ring-emerald-500",
  inactive: "bg-slate-100 text-slate-600 border-slate-200/60 focus:ring-slate-400",
};

export interface CategoryTableProps {
  categories: Category[];
  onCategoryDeleted(categoryId: string): void;
  onStatusChange(categoryId: string, status: CategoryStatus): void;
}

const CategoryTable = ({
  categories,
  onCategoryDeleted,
  onStatusChange
}: CategoryTableProps) => {
  const columns: Column<Category>[] = [
    {
      header: "Category ID",
      className: "font-mono text-xs text-slate-500",
      cell: (category) => (
        <span className="font-mono text-xs text-slate-500">
          #{category.id}
        </span>
      ),
    },
    {
      header: "Category Name",
      className: "font-medium text-slate-900",
      cell: (category) => (
        <span className="font-semibold text-slate-900">{category.name}</span>
      ),
    },
    {
      header: "Description",
      className: "text-slate-600 max-w-sm truncate text-xs",
      cell: (category) => (
        <span className="text-slate-600 truncate block max-w-xs">
          {category.description}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (category) => (
        <div className="relative inline-block">
          <select
            value={category.status}
            onChange={(e) =>
              onStatusChange(category.id, e.target.value as CategoryStatus)
            }
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium appearance-none pr-6 focus:outline-none focus:ring-1 ${statusBadgeStyles[category.status]
              }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span
            className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full ${category.status === "active" ? "bg-emerald-500" : "bg-slate-400"
              }`}
          />
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (category) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onCategoryDeleted(category.id)}
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-900 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={categories}
      columns={columns}
      keyExtractor={(category) => category.id}
      itemsPerPage={5}
      emptyMessage="No categories found matching your criteria."
    />
  );
};

export default CategoryTable;
