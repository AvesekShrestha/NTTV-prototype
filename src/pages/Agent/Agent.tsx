import DashboardCard from "@/components/custom/DashboardCard";
import {
  CircleCheck,
  CornerDownLeft,
  Ticket as TicketIcon,
  Timer,
  Users,
  ArrowUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Searchbar from "@/components/custom/Searchbar";
import TicketTable from "@/components/custom/TicketTable";

import {
  getCategories,
  getCurrentUser,
  getTeams,
  getTickets,
} from "@/lib/storage";

const Agent = () => {

  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [tickets] = useState(() => getTickets());

  const teams = useMemo(() => getTeams(), []);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priority, setPriority] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  /*
   * Find the team the currently logged-in agent belongs to.
   */
  const currentTeam = useMemo(() => {
    if (!currentUser) return undefined;

    return teams.find((team) =>
      team.members?.includes(currentUser.id)
    );
  }, [teams, currentUser]);

  const myTickets = useMemo(() => {
    if (!currentUser) return [];

    return tickets.filter((ticket) => {
      /*
       * Directly assigned ticket.
       */
      if (ticket.assignedTo === currentUser.id) {
        return true;
      }

      /*
       * Team-dispatched ticket.
       */
      const dispatches = ticket.dispatches ?? [];

      if (dispatches.length === 0) {
        return false;
      }

      /*
       * Only the latest dispatch matters.
       *
       * If the ticket was later forwarded/escalated to
       * another team, members of the previous team should
       * no longer see it.
       */
      const latestDispatch =
        dispatches[dispatches.length - 1];

      return (
        latestDispatch.recipients?.some(
          (recipient) =>
            recipient.agentId === currentUser.id
        ) ?? false
      );
    });
  }, [tickets, currentUser]);

  /*
   * Filter tickets.
   */
  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return myTickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query);

      const matchesPriority =
        priority === "all" ||
        ticket.priority.toLowerCase() ===
        priority.toLowerCase();

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
    myTickets,
    searchQuery,
    priority,
    category,
  ]);

  /*
   * Dashboard metrics.
   */
  const inProgressCount = myTickets.filter(
    (ticket) => ticket.status === "INPROCESS"
  ).length;

  const forwardedCount = myTickets.filter(
    (ticket) => ticket.status === "FORWARDED"
  ).length;

  const resolvedCount = myTickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;

  /*
   * Forward handler passed to TicketTable.
   *
   * The TicketTable can call this when the agent forwards
   * a ticket to another same-level team/agent.
   */
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8 lg:p-10">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Overview
        </h1>

        <p className="text-sm font-medium text-slate-500">
          Monitor and manage tickets assigned to you.
        </p>
      </div>

      {/* Agent / Team Information */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashboardCard
          title="Current Team"
          value={currentTeam?.name ?? "Not Assigned"}
          icon={Users}
        />

        <DashboardCard
          title="Team Level"
          value={currentTeam?.level ?? "N/A"}
          icon={ArrowUp}
        />
      </section>

      {/* Ticket Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Assigned Tickets"
          value={myTickets.length}
          icon={TicketIcon}
        />

        <DashboardCard
          title="In Progress"
          value={inProgressCount}
          icon={Timer}
        />

        <DashboardCard
          title="Forwarded"
          value={forwardedCount}
          icon={CornerDownLeft}
        />

        <DashboardCard
          title="Resolved"
          value={resolvedCount}
          icon={CircleCheck}
        />
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-4">
        <Searchbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search assigned tickets..."
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
        role="AGENT"
        onForward={(ticket) => navigate(`/tickets/${ticket.id}`)}
        onEscalate={(ticket) => navigate(`/tickets/${ticket.id}`)}
      />
    </div>
  );
};

export default Agent;
