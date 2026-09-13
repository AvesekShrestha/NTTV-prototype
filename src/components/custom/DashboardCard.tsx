import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string,
  value: number,
  icon: LucideIcon
}

const DashboardCard = ({ title, value, icon: Icon }: DashboardCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

export default DashboardCard;
