import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Ticket } from "@/types/ticket";
import type { User } from "@/types/user";

interface AgentPerformanceChartProps {
  tickets: Ticket[];
  agents: User[];
  kpi?: number;
}

const AgentPerformanceChart = ({ tickets, agents, kpi = 10 }: AgentPerformanceChartProps) => {
  const data = agents
    .map((agent) => {
      const resolved = tickets.filter(
        (t) => t.assignedTo === agent.id && t.status === "RESOLVED"
      ).length;
      return { name: agent.username, resolved };
    })
    .sort((a, b) => b.resolved - a.resolved);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No agent data available.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#003b7a]" />
          Resolved tickets
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block w-4 h-0.5 bg-amber-400" style={{ borderTop: "2px dashed #f59e0b" }} />
          KPI target ({kpi})
        </div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 38)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
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
            width={90}
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
            formatter={(value) => [`${value ?? 0} resolved`, "Tickets"]}
          />
          <ReferenceLine
            x={kpi}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: `KPI ${kpi}`, position: "top", fontSize: 10, fill: "#f59e0b" }}
          />
          <Bar dataKey="resolved" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.resolved >= kpi ? "#003b7a" : "#93c5fd"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgentPerformanceChart;
