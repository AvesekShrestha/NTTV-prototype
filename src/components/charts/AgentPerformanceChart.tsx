import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { Ticket } from "@/types/ticket";
import type { User } from "@/types/user";

interface AgentPerformanceChartProps {
  tickets: Ticket[];
  agents: User[];
  kpi?: number;
}

const AgentPerformanceChart = ({ tickets, agents, kpi = 10 }: AgentPerformanceChartProps) => {
  // A ticket belongs to an agent if:
  //   • ticket.assignedTo === agent.id  (directly assigned to this agent), OR
  //   • agent appears in any dispatch's recipients (team dispatch)
  const agentTickets = (agentId: string) =>
    tickets.filter(
      (t) =>
        t.assignedTo === agentId ||
        t.dispatches?.some((d) =>
          d.recipients?.some((r) => r.agentId === agentId)
        )
    );

  const data = agents
    .map((agent) => {
      const all = agentTickets(agent.id);
      const resolved = all.filter((t) => t.status === "RESOLVED").length;
      return { name: agent.username, Assigned: all.length, Resolved: resolved };
    })
    .sort((a, b) => b.Resolved - a.Resolved || b.Assigned - a.Assigned);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-slate-400">No agents found.</p>
        <p className="text-xs text-slate-300">Add users with the Agent role to see performance data.</p>
      </div>
    );
  }

  const hasAnyData = data.some((d) => d.Assigned > 0 || d.Resolved > 0);

  if (!hasAnyData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-slate-400">No tickets assigned to agents yet.</p>
        <p className="text-xs text-slate-300">Dispatch tickets to agents to see performance here.</p>
      </div>
    );
  }

  const chartHeight = Math.max(240, data.length * 44);

  return (
    <div>
      {/* Legend row */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#93c5fd]" />
          Assigned
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#003b7a]" />
          Resolved
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          KPI target ({kpi})
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap="30%"
          barGap={3}
          margin={{ left: 4, right: 36, top: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            cursor={{ fill: "#f8fafc" }}
          />
          <ReferenceLine
            x={kpi}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: `KPI ${kpi}`,
              position: "insideTopRight",
              fontSize: 9,
              fill: "#f59e0b",
              offset: 6,
            }}
          />
          <Bar dataKey="Assigned" fill="#93c5fd" radius={[0, 4, 4, 0]} maxBarSize={18} />
          <Bar dataKey="Resolved" fill="#003b7a" radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgentPerformanceChart;
