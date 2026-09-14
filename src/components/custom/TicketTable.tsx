import { Link } from "react-router-dom";
import { ArrowUp, Forward, Send } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Ticket } from "@/types/ticket";
import { getCategories } from "@/lib/storage";

type UserRole = "ADMIN" | "STAFF" | "AGENT" | "DISPATCHER";

const priorityBadgeStyles: Record<Ticket["priority"], string> = {
  CRITICAL:
    "bg-rose-50 text-rose-700 border border-rose-200/60",
  HIGH:
    "bg-amber-50 text-amber-700 border border-amber-200/60",
  MEDIUM:
    "bg-blue-50 text-blue-700 border border-blue-200/60",
  LOW:
    "bg-slate-100 text-slate-600 border border-slate-200/60",
};

const statusBadgeStyles: Record<Ticket["status"], string> = {
  NEW:
    "bg-blue-50 text-blue-700 border border-blue-200/60",
  ASSIGNED:
    "bg-violet-50 text-violet-700 border border-violet-200/60",
  INPROCESS:
    "bg-amber-50 text-amber-700 border border-amber-200/60",
  FORWARDED:
    "bg-cyan-50 text-cyan-700 border border-cyan-200/60",
  ESCALATED:
    "bg-orange-50 text-orange-700 border border-orange-200/60",
  RESOLVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
};

export interface TicketTableProps {
  tickets: Ticket[];

  role: UserRole;

  onDispatch?: (ticket: Ticket) => void;
  onForward?: (ticket: Ticket) => void;
  onEscalate?: (ticket: Ticket) => void;
}

const TicketTable = ({
  tickets,
  role,
  onDispatch,
  onForward,
  onEscalate,
}: TicketTableProps) => {
  const categories = getCategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(
      (category) => category.id === categoryId
    );

    return category?.name ?? "-";
  };

  const columns: Column<Ticket>[] = [
    {
      header: "Ticket ID",
      className: "font-mono text-xs text-slate-500",
      cell: (ticket) => (
        <Link
          to={`/tickets/${ticket.id}`}
          className="hover:text-slate-900 transition-colors"
        >
          #{ticket.id}
        </Link>
      ),
    },

    {
      header: "Title",
      className: "font-medium text-slate-900",
      cell: (ticket) => (
        <Link
          to={`/tickets/${ticket.id}`}
          className="hover:text-blue-600 transition-colors"
        >
          {ticket.title}
        </Link>
      ),
    },

    {
      header: "Category",
      className: "text-slate-700",
      cell: (ticket) => (
        <span className="text-sm">
          {getCategoryName(ticket.category)}
        </span>
      ),
    },

    {
      header: "Priority",
      cell: (ticket) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityBadgeStyles[ticket.priority]
            }`}
        >
          {ticket.priority}
        </span>
      ),
    },

    {
      header: "Level",
      cell: (ticket) =>
        ticket.level ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/50">
            {ticket.level}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },

    {
      header: "Status",
      cell: (ticket) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeStyles[ticket.status]
            }`}
        >
          {ticket.status}
        </span>
      ),
    },

    {
      header: "Actions",
      className: "text-right",
      cell: (ticket) => {
        // Resolved tickets should not have actions
        if (ticket.status === "RESOLVED") {
          return (
            <span className="text-slate-400 text-xs">
              -
            </span>
          );
        }

        // Dispatcher
        if (role === "DISPATCHER") {
          return onDispatch ? (
            <div className="flex items-center justify-end">
              <button
                onClick={() => onDispatch(ticket)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
                title="Dispatch Ticket"
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                Dispatch
              </button>
            </div>
          ) : (
            <span className="text-slate-400 text-xs">
              -
            </span>
          );
        }

        // Agent
        if (role === "AGENT") {
          return (
            <div className="flex items-center justify-end gap-2">
              {onForward && (
                <button
                  onClick={() => onForward(ticket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
                  title="Forward Ticket"
                >
                  <Forward className="w-3.5 h-3.5 text-slate-500" />
                  Forward
                </button>
              )}

              {onEscalate && (
                <button
                  onClick={() => onEscalate(ticket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
                  title="Escalate Ticket"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                  Escalate
                </button>
              )}
            </div>
          );
        }

        // STAFF / ADMIN
        return (
          <span className="text-slate-400 text-xs">
            -
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      data={tickets}
      columns={columns}
      keyExtractor={(ticket) => ticket.id}
      itemsPerPage={4}
      emptyMessage="No tickets found matching your criteria."
    />
  );
};

export default TicketTable;
