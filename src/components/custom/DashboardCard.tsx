import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  accent?: boolean;
}

const DashboardCard = ({ title, value, icon: Icon, subtitle, accent }: DashboardCardProps) => {
  return (
    <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between ${accent ? "border-[#003b7a]/20" : "border-slate-200"}`}>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${accent ? "text-[#003b7a]" : "text-slate-900"}`}>{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${accent ? "bg-[#003b7a]/10 text-[#003b7a]" : "bg-slate-100 text-slate-600"}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default DashboardCard;
