import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Filter,
  UserCheck,
  AlertCircle,
  FolderTree,
} from "lucide-react";
import type { User } from "@/types/user";
import type { Team } from "@/types/team";
import {
  getUsers,
  getTeams,
  getCategories,
  // Assuming ticket storage utilities exist in your setup
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/custom/DashboardCard";

// Mock ticket type matching standard ticketing structure
interface TicketItem {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo: string;
  createdAt: string;
}

export default function StaffDashboard() {
  // Simulating logged-in staff user (replace with your AuthContext/currentUser state)
  const [currentUser] = useState<User>(() => {
    const users = getUsers();
    return (
      users.find((u) => u.role === "agent" || u.role === "staff") ?? {
        id: "usr-1",
        username: "Alex Morgan",
        role: "agent",
        level: "L2",
      }
    );
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch contextual storage data
  const teams = getTeams();
  const categories = getCategories();

  // Filter teams where currentUser is an active member
  const myTeams = teams.filter((t) => (t.members ?? []).includes(currentUser.id));
  const myCategoryIds = myTeams.map((t) => t.categoryId);

  // Mock Assigned Tickets (Replace with getTickets() from storage)
  const [myTickets, setMyTickets] = useState<TicketItem[]>([
    {
      id: "TCK-8902",
      title: "VPN Authentication Failure on macOS Sequoia",
      category: "Network & Security",
      priority: "urgent",
      status: "in_progress",
      assignedTo: currentUser.id,
      createdAt: "10 mins ago",
    },
    {
      id: "TCK-8891",
      title: "Database connection timeout during batch export",
      category: "Infrastructure",
      priority: "high",
      status: "open",
      assignedTo: currentUser.id,
      createdAt: "1 hour ago",
    },
    {
      id: "TCK-8840",
      title: "License key renewal request for Figma Enterprise",
      category: "Software Access",
      priority: "medium",
      status: "in_progress",
      assignedTo: currentUser.id,
      createdAt: "3 hours ago",
    },
    {
      id: "TCK-8720",
      title: "SSO Redirect loop after password reset",
      category: "Identity Management",
      priority: "low",
      status: "resolved",
      assignedTo: currentUser.id,
      createdAt: "Yesterday",
    },
  ]);

  // Peer members matching current level across teams
  const allUsers = getUsers();
  const teammateIds = Array.from(
    new Set(myTeams.flatMap((t) => t.members ?? []))
  ).filter((id) => id !== currentUser.id);

  const teammates = allUsers.filter((u) => teammateIds.includes(u.id));

  // SLA / Performance counts
  const activeTicketsCount = myTickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;
  const resolvedCount = myTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;
  const urgentCount = myTickets.filter(
    (t) => t.priority === "urgent" && t.status !== "resolved"
  ).length;

  const filteredTickets = myTickets.filter((t) => {
    if (statusFilter === "active") return t.status === "open" || t.status === "in_progress";
    if (statusFilter === "resolved") return t.status === "resolved";
    return true;
  });

  const handleQuickStatusChange = (
    ticketId: string,
    newStatus: TicketItem["status"]
  ) => {
    setMyTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Welcome back, {currentUser.username}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              {currentUser.level ?? "L1"} Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Here is your workload breakdown, active tickets, and team assignments today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild className="gap-2 text-xs">
            <Link to="/teams">
              <Shield className="w-3.5 h-3.5" /> My Teams ({myTeams.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Assigned Active"
          value={activeTicketsCount}
          icon={Ticket}
        />
        <DashboardCard
          title="Urgent Attention"
          value={urgentCount}
          icon={AlertCircle}
        />
        <DashboardCard
          title="Resolved (This Week)"
          value={resolvedCount}
          icon={CheckCircle2}
        />
        <DashboardCard
          title="Assigned Teams"
          value={myTeams.length}
          icon={Layers}
        />
      </section>

      {/* Main Grid Content: Left side (Tickets), Right side (Team/Context) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): My Assigned Tickets */}
        <section className="lg:col-span-2 flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assigned Queue</h2>
              <p className="text-xs text-slate-500">
                Tickets assigned directly to your account requiring action.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${statusFilter === "active"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${statusFilter === "resolved"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Ticket List */}
          <div className="divide-y divide-slate-100">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No tickets found in this view.
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 hover:bg-slate-50/60 transition-colors rounded-lg px-2"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-slate-500">
                        {ticket.id}
                      </span>
                      {ticket.priority === "urgent" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                          Urgent
                        </span>
                      )}
                      {ticket.priority === "high" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                          High
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {ticket.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FolderTree className="w-3 h-3" /> {ticket.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ticket.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status Selection */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleQuickStatusChange(
                          ticket.id,
                          e.target.value as TicketItem["status"]
                        )
                      }
                      className="h-8 text-xs bg-slate-50 border border-slate-200 rounded-md px-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column (1 Col): Team Context & Peers */}
        <section className="flex flex-col gap-6">
          {/* My Teams Widget */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-slate-500" /> My Assigned Teams
            </h3>

            {myTeams.length === 0 ? (
              <p className="text-xs text-slate-400">
                You are not currently assigned to any team.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {myTeams.map((team) => {
                  const teamCat = categories.find((c) => c.id === team.categoryId);
                  return (
                    <Link
                      key={team.id}
                      to={`/teams/${team.id}`}
                      className="p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-all bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {team.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {teamCat?.name ?? "General"} • {team.members?.length ?? 0} Members
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/60 font-semibold text-slate-700">
                        {team.level}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level Peers Roster */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-slate-500" /> Peer Teammates ({teammates.length})
            </h3>

            {teammates.length === 0 ? (
              <p className="text-xs text-slate-400">
                No active teammates found in your assigned groups.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                {teammates.map((teammate) => (
                  <div
                    key={teammate.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {teammate.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800">
                          {teammate.username}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {teammate.role}
                        </span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
