import { useState } from 'react';
import {
  FolderPlus,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import Searchbar from '@/components/custom/Searchbar';
import DashboardCard from '@/components/custom/DashboardCard';
import type { Category, CategoryStatus } from '@/types/category';
import AddCategoryDialog from '@/components/custom/AddCategoryDialog';
import { getCategories, removeCategory, updateCategoryStatus } from '@/lib/storage';
import CategoryTable from '@/components/custom/CategoryTable';

export default function Category() {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleCategoryDeleted = (categoryId: string) => {
    removeCategory(categoryId);
    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
  };

  const handleCategoryCreated = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const handleStatusChange = (categoryId: string, newStatus: CategoryStatus) => {
    updateCategoryStatus(categoryId, newStatus);
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, status: newStatus } : category
      )
    );
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || category.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Categories
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Organize and manage catalog categories for your store.
          </p>
        </div>
        <AddCategoryDialog onCategoryCreated={handleCategoryCreated} />
      </div>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Category"
          value={categories.length}
          icon={Layers}
        />
        <DashboardCard
          title="Active"
          value={
            categories.filter((category) => category.status === 'active').length
          }
          icon={CheckCircle2}
        />
        <DashboardCard
          title="Inactive"
          value={
            categories.filter((category) => category.status === 'inactive').length
          }
          icon={FolderPlus}
        />
      </section>

      {/* Main Content Section */}
      <section className="flex flex-col gap-4">
        <Searchbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search categories..."
          filters={[
            {
              key: 'status',
              value: filterStatus,
              onChange: setFilterStatus,
              options: [
                { label: 'Status', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ],
            },
          ]}
        />
        <CategoryTable
          categories={filteredCategories}
          onCategoryDeleted={handleCategoryDeleted}
          onStatusChange={handleStatusChange}
        />
      </section>
    </div>
  );
}
