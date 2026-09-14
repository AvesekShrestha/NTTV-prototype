import DashboardCard from "@/components/custom/DashboardCard";
import { CircleCheck, CornerDownLeft, Send, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import Searchbar from "@/components/custom/Searchbar";
import TicketTable from "@/components/custom/TicketTable";
import { getCategories, getMyTickets } from "@/lib/storage";

const Staff = () => {
  const [tickets] = useState(() => getMyTickets());

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priority, setPriority] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      // Search
      const matchesSearch =
        !query ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query);

      // Priority
      const matchesPriority =
        priority === "all" ||
        ticket.priority.toLowerCase() === priority.toLowerCase();

      // Category
      // ticket.category contains the category ID
      const matchesCategory =
        category === "all" ||
        ticket.category === category;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [tickets, searchQuery, priority, category]);

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
          <DashboardCard
            title="Total Submitted"
            value={tickets.length}
            icon={Send}
          />

          <DashboardCard
            title="In Progress"
            value={
              tickets.filter(
                (ticket) => ticket.status === "INPROCESS"
              ).length
            }
            icon={Timer}
          />

          <DashboardCard
            title="Forwarded Back"
            value={
              tickets.filter(
                (ticket) => ticket.status === "FORWARDED"
              ).length
            }
            icon={CornerDownLeft}
          />

          <DashboardCard
            title="Resolved"
            value={
              tickets.filter(
                (ticket) => ticket.status === "RESOLVED"
              ).length
            }
            icon={CircleCheck}
          />
        </section>

        {/* Filters */}
        <section className="flex flex-col gap-4">
          <Searchbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search tickets..."
            filters={[
              {
                key: "priority",
                value: priority,
                onChange: setPriority,
                options: [
                  { label: "Priority", value: "all" },
                  { label: "Critical", value: "critical" },
                  { label: "High", value: "high" },
                  { label: "Medium", value: "medium" },
                  { label: "Low", value: "low" },
                ],
              },
              {
                key: "category",
                value: category,
                onChange: setCategory,
                options: [
                  { label: "Categories", value: "all" },

                  ...getCategories().map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  })),
                ],
              },
            ]}
          />
        </section>

        <TicketTable
          tickets={filteredTickets}
          role="STAFF"
        />
      </div>
    </>
  );
};

export default Staff;
