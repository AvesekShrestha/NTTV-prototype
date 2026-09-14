import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Ticket } from "@/types/ticket";
import type { Team } from "@/types/team";

interface TeamPerformanceChartProps {
  tickets: Ticket[];
  teams: Team[];
}

const TeamPerformanceChart = ({ tickets, teams }: TeamPerformanceChartProps) => {
  // Build per-team data; also bucket unassigned tickets under a synthetic "Unassigned" entry
  const teamData = teams.map((team) => {
    const teamTickets = tickets.filter((t) => t.assignedTeamId === team.id);
    const resolved = teamTickets.filter((t) => t.status === "RESOLVED").length;
    return {
      name: team.name.length > 14 ? team.name.slice(0, 13) + "…" : team.name,
      Received: teamTickets.length,
      Resolved: resolved,
    };
  });

  const hasAnyData = teamData.some((d) => d.Received > 0 || d.Resolved > 0);

  if (teamData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-slate-400">No teams created yet.</p>
        <p className="text-xs text-slate-300">Add teams to see performance data.</p>
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-slate-400">No tickets assigned to any team yet.</p>
        <p className="text-xs text-slate-300">Dispatch tickets to teams to see chart data.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={teamData} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
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
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 12 }}
        />
        <Bar dataKey="Received" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Resolved" fill="#003b7a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TeamPerformanceChart;
