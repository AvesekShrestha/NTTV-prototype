import { MapPin } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Ticket } from "@/types/ticket";

const SERVICE_TYPE_LABELS: Record<string, string> = {
    IPTV: "IPTV",
    NTTV: "NTTV",
    SIM: "SIM",
    FTTH: "FTTH",
    BROADBAND: "Broadband",
    LANDLINE: "Landline",
    OTHER: "Other",
};

const priorityBadgeStyles: Record<Ticket["priority"], string> = {
    CRITICAL: "bg-rose-50 text-rose-700 border border-rose-200/60",
    HIGH: "bg-amber-50 text-amber-700 border border-amber-200/60",
    MEDIUM: "bg-blue-50 text-blue-700 border border-blue-200/60",
    LOW: "bg-slate-100 text-slate-600 border border-slate-200/60",
};

const statusBadgeStyles: Record<Ticket["status"], string> = {
    NEW: "bg-blue-50 text-blue-700 border border-blue-200/60",
    ASSIGNED: "bg-violet-50 text-violet-700 border border-violet-200/60",
    INPROCESS: "bg-amber-50 text-amber-700 border border-amber-200/60",
    FORWARDED: "bg-cyan-50 text-cyan-700 border border-cyan-200/60",
    ESCALATED: "bg-orange-50 text-orange-700 border border-orange-200/60",
    RESOLVED: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
};

export interface ComplaintTableProps {
    tickets: Ticket[];
}

const ComplaintTable = ({ tickets }: ComplaintTableProps) => {
    const columns: Column<Ticket>[] = [
        {
            header: "Complaint ID",
            className: "font-mono text-xs text-slate-500",
            cell: (ticket) => <span>#{ticket.id.slice(0, 8)}</span>,
        },
        {
            header: "Subject",
            className: "font-medium text-slate-900",
            cell: (ticket) => <span>{ticket.title}</span>,
        },
        {
            header: "Service",
            className: "text-slate-700",
            cell: (ticket) => (
                <span className="text-sm">
                    {ticket.serviceType ? SERVICE_TYPE_LABELS[ticket.serviceType] ?? ticket.serviceType : "-"}
                </span>
            ),
        },
        {
            header: "Priority",
            cell: (ticket) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityBadgeStyles[ticket.priority]}`}
                >
                    {ticket.priority}
                </span>
            ),
        },
        {
            header: "Status",
            cell: (ticket) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeStyles[ticket.status]}`}
                >
                    {ticket.status}
                </span>
            ),
        },
        {
            header: "Visit Location",
            cell: (ticket) =>
                ticket.location ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <MapPin className="w-3.5 h-3.5" />
                        Attached
                    </span>
                ) : (
                    <span className="text-slate-400 text-xs">-</span>
                ),
        },
        {
            header: "Submitted",
            className: "text-slate-500 text-xs",
            cell: (ticket) => <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>,
        },
    ];

    return (
        <DataTable
            data={tickets}
            columns={columns}
            keyExtractor={(ticket) => ticket.id}
            itemsPerPage={5}
            emptyMessage="You haven't submitted any complaints yet."
        />
    );
};

export default ComplaintTable;