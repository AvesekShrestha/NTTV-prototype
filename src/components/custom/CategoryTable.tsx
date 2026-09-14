import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Category, CategoryStatus } from "@/types/category";

export interface CategoryTableProps {
  categories: Category[];
  onCategoryDeleted(categoryId: string): void;
  onStatusChange(categoryId: string, status: CategoryStatus): void;
}

const CategoryTable = ({
  categories,
  onCategoryDeleted,
  onStatusChange,
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
        <span className="font-semibold text-slate-900">
          {category.name}
        </span>
      ),
    },

    {
      header: "Description",
      className: "max-w-sm truncate text-xs text-slate-600",
      cell: (category) => (
        <span className="block max-w-xs truncate text-slate-600">
          {category.description}
        </span>
      ),
    },

    {
      header: "Status",
      cell: (category) => (
        <select
          value={category.status}
          onChange={(e) =>
            onStatusChange(
              category.id,
              e.target.value as CategoryStatus
            )
          }
          className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      ),
    },

    {
      header: "Actions",
      className: "text-right",
      cell: (category) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onCategoryDeleted(category.id)}
            className="inline-flex items-center justify-center rounded-md border border-transparent p-2 text-slate-900 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Delete Category"
          >
            <Trash2 className="h-4 w-4" />
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
