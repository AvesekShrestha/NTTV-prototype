import { useState, useMemo } from "react";
import DashboardCard from "@/components/custom/DashboardCard";
import TicketTable from "@/components/custom/TicketTable";
import TeamPerformanceChart from "@/components/charts/TeamPerformanceChart";
import CategoryDistributionChart from "@/components/charts/CategoryDistributionChart";
import AgentPerformanceChart from "@/components/charts/AgentPerformanceChart";
import { Users, Ticket, CheckCircle, Clock } from "lucide-react";
import { getTickets, getUsers, getTeams, getCategories } from "@/lib/storage";

function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Admin = () => {
  const [tickets] = useState(() => getTickets());
  const users = useMemo(() => getUsers(), []);
  const teams = useMemo(() => getTeams(), []);
  const categories = useMemo(() => getCategories(), []);
  const agents = useMemo(() => users.filter((u) => u.role === "agent"), [users]);

  // ── metrics ───────────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const activeTickets = tickets.filter(
    (t) => t.status !== "RESOLVED"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  const avgResolutionMs = useMemo(() => {
    const resolved = tickets.filter((t) => t.status === "RESOLVED" && t.resolvedAt);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce(
      (sum, t) =>
        sum + (new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime()),
      0
    );
    return total / resolved.length;
  }, [tickets]);

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

      {/* Metric Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Users" value={totalUsers} icon={Users} />
        <DashboardCard title="Active Tickets" value={activeTickets} icon={Ticket} />
        <DashboardCard title="Resolved" value={resolvedCount} icon={CheckCircle} />
        <DashboardCard
          title="Avg. Resolution Time"
          value={formatDuration(avgResolutionMs)}
          icon={Clock}
          subtitle="Mean time to resolve"
          accent
        />
      </section>

      {/* Charts Row 1 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ChartCard
            title="Team Performance"
            subtitle="Total tickets received vs resolved per team"
          >
            <TeamPerformanceChart tickets={tickets} teams={teams} />
          </ChartCard>
        </div>
        <div className="lg:col-span-2">
          <ChartCard
            title="Category Distribution"
            subtitle="Ticket volume by category"
          >
            <CategoryDistributionChart tickets={tickets} categories={categories} />
          </ChartCard>
        </div>
      </section>

      {/* Charts Row 2 */}
      <section>
        <ChartCard
          title="Agent Performance vs KPI"
          subtitle="Resolved tickets per agent, ranked highest to lowest — dashed line = KPI target (10)"
        >
          <AgentPerformanceChart tickets={tickets} agents={agents} kpi={10} />
        </ChartCard>
      </section>

      {/* Recent Tickets */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Recent Tickets
          </h2>
        </div>
        <TicketTable tickets={tickets} role="ADMIN" />
      </section>
    </div>
  );
};

export default Admin;
