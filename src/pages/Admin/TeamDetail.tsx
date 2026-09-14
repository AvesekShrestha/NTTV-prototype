import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  Layers,
  FolderTree,
  Search,
  Users,
  Trash2,
} from "lucide-react";
import type { Team } from "@/types/team";
import type { User } from "@/types/user";
import {
  getTeams,
  assignMember,
  unassignMember,
  getCategories,
  getUsers,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/custom/DashboardCard";

export default function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(() => {
    const teams = getTeams();
    return teams.find((t) => t.id === teamId) ?? null;
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-slate-500 font-medium">Team not found or removed.</p>
        <button
          onClick={() => navigate("/teams")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </button>
      </div>
    );
  }

  const categories = getCategories();
  const category = categories.find((c) => c.id === team.categoryId);
  const members = team.members ?? [];

  // Fetch all users and filter by matching team level & not already in members array
  const allUsers: User[] = getUsers();
  const availableUsers = allUsers.filter(
    (user) => user.level === team.level && !members.includes(user.id)
  );

  // Filter available users by search query
  const filteredAvailableUsers = availableUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMemberDirect = (userId: string) => {
    assignMember(team.id, userId);
    setTeam((prev) =>
      prev
        ? { ...prev, members: [...(prev.members ?? []), userId] }
        : null
    );
  };

  const handleRemoveMember = (userId: string) => {
    unassignMember(team.id, userId);
    setTeam((prev) =>
      prev
        ? {
          ...prev,
          members: (prev.members ?? []).filter((id) => id !== userId),
        }
        : null
    );
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Navigation & Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5">
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Teams
        </Link>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {team.name}
            </h1>
            <p className="text-xs font-mono text-slate-500 mt-1">ID: #{team.id}</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Category"
          value={category ? category.name : team.categoryId || "Unassigned"}
          icon={FolderTree}
        />
        <DashboardCard title="Support Level" value={team.level} icon={Layers} />
        <DashboardCard
          title="Active Members"
          value={members.length}
          icon={Shield}
        />
      </section>

      {/* Active Members Section */}
      <section className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Active Team Members ({members.length})</h2>
          <p className="text-xs text-slate-500">
            Currently assigned personnel assigned to this team.
          </p>
        </div>

        {/* Member List Table */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
          {members.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active members assigned to this team yet.
            </div>
          ) : (
            members.map((memberId) => {
              const userInfo = allUsers.find((u) => u.id === memberId);
              const displayName = userInfo ? userInfo.username : memberId;

              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {displayName}
                      </span>
                      {userInfo && (
                        <span className="text-xs text-slate-400 capitalize">
                          {userInfo.role} • {userInfo.level ?? "No Level"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(memberId)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Available Agents Grid Section */}
      <section className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available {team.level} Agents ({availableUsers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Click to instantly assign eligible agents matching the {team.level} support level.
            </p>
          </div>

          {availableUsers.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search available agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all"
              />
            </div>
          )}
        </div>

        {filteredAvailableUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-slate-300" />
            {availableUsers.length === 0
              ? `No unassigned ${team.level} agents available.`
              : `No agents found matching "${searchQuery}".`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAvailableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {user.username}
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddMemberDirect(user.id)}
                  className="gap-1.5 shrink-0 h-8 text-xs bg-white hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
