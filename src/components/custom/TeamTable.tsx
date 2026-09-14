import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Team, TeamLevel } from "@/types/team";
import { getCategories } from "@/lib/storage";

const levelBadgeStyles: Record<TeamLevel, string> = {
  L1: "bg-blue-50 text-blue-700 border-blue-200/60",
  L2: "bg-amber-50 text-amber-700 border-amber-200/60",
  L3: "bg-purple-50 text-purple-700 border-purple-200/60",
};

export interface TeamTableProps {
  teams: Team[];
  onTeamDeleted(teamId: string): void;
}

const TeamTable = ({ teams, onTeamDeleted }: TeamTableProps) => {
  const categories = getCategories();

  const columns: Column<Team>[] = [
    {
      header: "Team Name",
      className: "font-semibold text-slate-900",
      cell: (team) => (
        <Link
          to={`/teams/${team.id}`}
          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-colors"
        >
          {team.name}
        </Link>
      ),
    },
    {
      header: "Category",
      cell: (team) => {
        const category = categories.find((c) => c.id === team.categoryId);
        return (
          <span className="text-xs text-slate-600 font-medium">
            {category ? category.name : team.categoryId || "Unassigned"}
          </span>
        );
      },
    },
    {
      header: "Level",
      cell: (team) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${levelBadgeStyles[team.level]
            }`}
        >
          {team.level}
        </span>
      ),
    },
    {
      header: "Members Count",
      cell: (team) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
          {team.members?.length ?? 0} member
          {(team.members?.length ?? 0) !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (team) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => onTeamDeleted(team.id)}
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-900 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition-colors"
            title="Delete Team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={teams}
      columns={columns}
      keyExtractor={(team) => team.id}
      itemsPerPage={5}
      emptyMessage="No teams found matching your criteria."
    />
  );
};

export default TeamTable;
