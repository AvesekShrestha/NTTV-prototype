import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { Team, TeamLevel } from "@/types/team";
// import { updateTeam } from "@/lib/storage";
import { getCategories } from "@/lib/storage";

const levelBadgeStyles: Record<TeamLevel, string> = {
  L1: "bg-blue-50 text-blue-700 border-blue-200/60",
  L2: "bg-amber-50 text-amber-700 border-amber-200/60",
  L3: "bg-purple-50 text-purple-700 border-purple-200/60",
};

export interface TeamTableProps {
  teams: Team[];
  onTeamDeleted(teamId: string): void;
  onTeamUpdated(updatedTeam: Team): void;
}

const TeamTable = ({
  teams,
  onTeamDeleted,
  onTeamUpdated,
}: TeamTableProps) => {
  const categories = getCategories();

  const handleLevelChange = (team: Team, newLevel: TeamLevel) => {
    const updated = { ...team, level: newLevel };
    // updateTeam(updated);
    onTeamUpdated(updated);
  };

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
        <select
          value={team.level}
          onChange={(e) => handleLevelChange(team, e.target.value as TeamLevel)}
          className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 ${levelBadgeStyles[team.level]
            }`}
        >
          <option value="L1">L1</option>
          <option value="L2">L2</option>
          <option value="L3">L3</option>
        </select>
      ),
    },
    {
      header: "Members Count",
      cell: (team) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
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
