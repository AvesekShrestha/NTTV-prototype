import DashboardCard from "@/components/custom/DashboardCard";
import TicketTable from "@/components/custom/TicketTable";
import { User } from "lucide-react";

const Admin = () => {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Overview
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Monitor key metrics, performance indicators, and recent ticket activity.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Total Users" value={0} icon={User} />
        <DashboardCard title="Active Tickets" value={0} icon={User} />
        <DashboardCard title="Resolved Issues" value={0} icon={User} />
      </section>

      {/* Main Content Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Recent Tickets
          </h2>
        </div>
        <TicketTable />
      </section>
    </div>
  );
};

export default Admin;
