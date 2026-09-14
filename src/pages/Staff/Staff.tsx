import DashboardCard from "@/components/custom/DashboardCard";
import { CircleCheck, CornerDownLeft, Send, Timer } from "lucide-react";
import { useState } from "react";
import Searchbar from "@/components/custom/Searchbar";
import TicketTable from "@/components/custom/TicketTable";
import { getMyTickets } from "@/lib/storage";

const Staff = () => {

  const [tickets] = useState(() => getMyTickets())
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  return (
    <>
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
          <DashboardCard title="Total Submitted" value={0} icon={Send} />
          <DashboardCard title="In Progress" value={0} icon={Timer} />
          <DashboardCard title="Forwarded Back" value={0} icon={CornerDownLeft} />
          <DashboardCard title="Resolved" value={0} icon={CircleCheck} />
        </section>

        <section className="flex flex-col gap-4">
          <Searchbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search tickets..."
            filters={[
              {
                key: 'priority',
                value: priority,
                onChange: setPriority,
                options: [
                  { label: 'Priority', value: 'all' },
                  { label: 'Critical', value: 'critical' },
                  { label: 'High', value: 'high' },
                  { label: 'Low', value: 'low' }
                ],
              },
            ]}
          />
        </section>

        <TicketTable tickets={tickets} />

      </div>

    </>

  )
}

export default Staff;
