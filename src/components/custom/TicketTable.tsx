import { useState } from "react";
import { Link } from "react-router-dom";
import { Forward } from "lucide-react";
import Searchbar from "./Searchbar";
import { DataTable, type Column } from "./DataTable";

type Ticket = {
  id: number;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  assignedTo: string;
};

const tickets: Ticket[] = [{
  id: 1001,
  title: "Internet connection not working",
  category: "Internet",
  priority: "High",
  assignedTo: "Ram Shrestha",
},
{
  id: 1002,
  title: "IPTV channels unavailable after update",
  category: "IPTV",
  priority: "Critical",
  assignedTo: "Unassigned",
},
{
  id: 1003,
  title: "Slow internet speed during peak hours",
  category: "Internet",
  priority: "Medium",
  assignedTo: "Sita Thapa",
},
{
  id: 1004,
  title: "Dual-band router setup assistance",
  category: "Internet",
  priority: "Low",
  assignedTo: "Unassigned",
},
{
  id: 1005,
  title: "Set-top box audio distortion on HD channels",
  category: "IPTV",
  priority: "High",
  assignedTo: "Hari Gurung",
},
{
  id: 1006,
  title: "Optical Fiber cable cut reported in Subidhanagar",
  category: "Infrastructure",
  priority: "Critical",
  assignedTo: "Subash Tamang",
},
{
  id: 1007,
  title: "IPTV remote replacement request",
  category: "IPTV",
  priority: "Medium",
  assignedTo: "Sita Thapa",
},
{
  id: 1008,
  title: "ONU Device replacement request",
  category: "Hardware",
  priority: "Low",
  assignedTo: "Unassigned",
},
{
  id: 1009,
  title: "Billing dispute for static IP package",
  category: "Billing",
  priority: "Medium",
  assignedTo: "Aayush Maharjan",
},
{
  id: 1010,
  title: "Frequent Wi-Fi packet loss & latency spikes",
  category: "Internet",
  priority: "High",
  assignedTo: "Ram Shrestha",
},
{
  id: 1011,
  title: "Customer portal login authentication failure",
  category: "Account",
  priority: "Low",
  assignedTo: "Unassigned",
},
{
  id: 1012,
  title: "Corporate leased line downtime",
  category: "Infrastructure",
  priority: "Critical",
  assignedTo: "Hari Gurung",
},
{
  id: 1013,
  title: "Static IP configuration request for CCTV DVR",
  category: "Network",
  priority: "Medium",
  assignedTo: "Subash Tamang",
},
{
  id: 1014,
  title: "Secondary IPTV connection activation",
  category: "IPTV",
  priority: "Low",
  assignedTo: "Unassigned",
},
{
  id: 1015,
  title: "Payment gateway timeout on online renewal",
  category: "Billing",
  priority: "High",
  assignedTo: "Aayush Maharjan",
},
];

const priorityOrder: Record<Ticket["priority"], number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

const priorityBadgeStyles: Record<Ticket["priority"], string> = {
  Critical: "bg-rose-50 text-rose-700 border border-rose-200/60",
  High: "bg-amber-50 text-amber-700 border border-amber-200/60",
  Medium: "bg-blue-50 text-blue-700 border border-blue-200/60",
  Low: "bg-slate-100 text-slate-600 border border-slate-200/60",
};

const TicketTable = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" ||
      ticket.priority.toLowerCase() === priorityFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      ticket.category.toLowerCase() === categoryFilter;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priorityDifference =
      priorityOrder[a.priority] - priorityOrder[b.priority];
    return priorityDifference !== 0
      ? priorityDifference
      : a.category.localeCompare(b.category);
  });

  const handleForward = (
    event: React.MouseEvent<HTMLButtonElement>,
    ticketId: number
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Forward ticket:", ticketId);
  };

  // Define Column Specifications
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
      cell: (ticket) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/50">
          {ticket.category}
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
      header: "Assigned",
      cell: (ticket) =>
        ticket.assignedTo === "Unassigned" ? (
          <span className="text-slate-400 text-xs font-normal">Unassigned</span>
        ) : (
          ticket.assignedTo
        ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (ticket) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => handleForward(e, ticket.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
            title="Forward Ticket"
          >
            <Forward className="w-3.5 h-3.5 text-slate-500" />
            Forward
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={sortedTickets}
      columns={columns}
      keyExtractor={(ticket) => ticket.id}
      itemsPerPage={4}
      emptyMessage="No tickets found matching your criteria."
      toolbar={
        <Searchbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search Tickets..."
          filters={[
            {
              key: "priority",
              value: priorityFilter,
              onChange: setPriorityFilter,
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
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "Category", value: "all" },
                { label: "IPTV", value: "iptv" },
                { label: "Internet", value: "internet" },
              ],
            },
          ]}
        />
      }
    />
  );
};

export default TicketTable;
