import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Ticket } from "@/types/ticket";
import type { Category } from "@/types/category";

interface CategoryDistributionChartProps {
  tickets: Ticket[];
  categories: Category[];
}

const PALETTE = [
  "#003b7a",
  "#1d6eb5",
  "#4a9edd",
  "#93c5fd",
  "#bfdbfe",
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
];

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomLabelProps) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CategoryDistributionChart = ({ tickets, categories }: CategoryDistributionChartProps) => {
  // Build data: group by category name
  const countMap: Record<string, number> = {};
  tickets.forEach((t) => {
    const cat = categories.find((c) => c.id === t.category || c.name === t.category);
    const label = cat ? cat.name : t.category || "Uncategorized";
    countMap[label] = (countMap[label] ?? 0) + 1;
  });

  const data = Object.entries(countMap).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No ticket data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={95}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
          formatter={(value, name) => [`${value} tickets`, String(name)]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryDistributionChart;
