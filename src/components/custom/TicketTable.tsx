import { Link } from "react-router-dom";
import { Forward } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Ticket } from "@/types/ticket";

const priorityBadgeStyles: Record<Ticket["priority"], string> = {
  CRITICAL: "bg-rose-50 text-rose-700 border border-rose-200/60",
  HIGH: "bg-amber-50 text-amber-700 border border-amber-200/60",
  MEDIUM: "bg-blue-50 text-blue-700 border border-blue-200/60",
  LOW: "bg-slate-100 text-slate-600 border border-slate-200/60",
};

export interface TicketTableProps {
  tickets: Ticket[];
  onForward?: (ticket: Ticket) => void;
}

const TicketTable = ({
  tickets,
  onForward,
}: TicketTableProps) => {
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
      cell: (ticket) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/50">
          {ticket.level}
        </span>
      ),
    },

    {
      header: "Status",
      cell: (ticket) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/50">
          {ticket.status}
        </span>
      ),
    },

    {
      header: "Assigned",
      cell: (ticket) =>
        ticket.assignedTo ? (
          ticket.assignedTo
        ) : (
          <span className="text-slate-400 text-xs">
            Unassigned
          </span>
        ),
    },

    {
      header: "Actions",
      className: "text-right",
      cell: (ticket) => (
        <div className="flex items-center justify-end gap-2">
          {ticket.status !== "RESOLVED" && onForward && (
            <button
              onClick={() => onForward(ticket)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
              title="Forward Ticket"
            >
              <Forward className="w-3.5 h-3.5 text-slate-500" />
              Forward
            </button>
          )}
        </div>
      ),
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
