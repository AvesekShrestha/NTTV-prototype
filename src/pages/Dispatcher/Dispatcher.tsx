import DashboardCard from "@/components/custom/DashboardCard";
import Searchbar from "@/components/custom/Searchbar";
import TicketTable from "@/components/custom/TicketTable";
import { getCategories, getTickets } from "@/lib/storage";
import type { Ticket } from "@/types/ticket";
import {
  CircleCheck,
  Clock3,
  FilePlus2,
  Forward,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dispatcher = () => {
  const navigate = useNavigate();

  const [tickets] = useState<Ticket[]>(() => getTickets());

  const [searchQuery, setSearchQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const categories = getCategories();

  /*
   * New tickets are tickets that have not been dispatched yet.
   *
   * Once the dispatcher dispatches a ticket, its status becomes
   * ASSIGNED, so it disappears from this queue.
   */
  const newTickets = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === "NEW");
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return newTickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query);

      const matchesPriority =
        priority === "all" ||
        ticket.priority.toLowerCase() === priority.toLowerCase();

      const matchesCategory =
        category === "all" ||
        ticket.category === category;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    newTickets,
    searchQuery,
    priority,
    category,
  ]);

  /*
   * Dashboard statistics
   */
  const totalTickets = tickets.length;

  const newTicketCount = tickets.filter(
    (ticket) => ticket.status === "NEW"
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "INPROCESS"
  ).length;

  const forwardedCount = tickets.filter(
    (ticket) => ticket.status === "FORWARDED"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Dispatcher Overview
        </h1>

        <p className="text-sm font-medium text-slate-500">
          Monitor incoming tickets and dispatch them to the appropriate teams.
        </p>
      </div>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Tickets"
          value={totalTickets}
          icon={FilePlus2}
        />

        <DashboardCard
          title="New Tickets"
          value={newTicketCount}
          icon={Clock3}
        />

        <DashboardCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock3}
        />

        <DashboardCard
          title="Forwarded"
          value={forwardedCount}
          icon={Forward}
        />

        <DashboardCard
          title="Resolved"
          value={resolvedCount}
          icon={CircleCheck}
        />

      </section>

      {/* New Tickets */}
      <section className="flex flex-col gap-4">

        {/* Filters */}
        <Searchbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search new tickets..."
          filters={[
            {
              key: "priority",
              value: priority,
              onChange: setPriority,
              options: [
                {
                  label: "Priority",
                  value: "all",
                },
                {
                  label: "Critical",
                  value: "critical",
                },
                {
                  label: "High",
                  value: "high",
                },
                {
                  label: "Medium",
                  value: "medium",
                },
                {
                  label: "Low",
                  value: "low",
                },
              ],
            },

            {
              key: "category",
              value: category,
              onChange: setCategory,
              options: [
                {
                  label: "Categories",
                  value: "all",
                },

                ...categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                })),
              ],
            },
          ]}
        />

        {/* Ticket table */}
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Send className="h-5 w-5 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No new tickets
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              There are currently no tickets waiting for dispatch.
            </p>
          </div>
        ) : (
          <TicketTable
            tickets={filteredTickets}
            role="DISPATCHER"
            onDispatch={(ticket) =>
              navigate(`/ticket/dispatch/${ticket.id}`)
            }
          />
        )}

      </section>
    </div>
  );
};

export default Dispatcher;
