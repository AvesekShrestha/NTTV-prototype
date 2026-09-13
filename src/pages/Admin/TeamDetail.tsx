import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, UserX, Shield, Layers, FolderTree } from "lucide-react";
import type { Team } from "@/types/team";
import { getTeams, assignMember, unassignMember } from "@/lib/storage";
import { getCategories } from "@/lib/storage";
import DashboardCard from "@/components/custom/DashboardCard";

export default function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [newMember, setNewMember] = useState("");

  useEffect(() => {
    const teams = getTeams();
    const found = teams.find((t) => t.id === teamId);
    if (found) {
      setTeam(found);
    }
  }, [teamId]);

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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.trim() || team.members.includes(newMember.trim())) return;

    assignMember(team.id, newMember.trim());
    setTeam((prev) =>
      prev ? { ...prev, members: [...prev.members, newMember.trim()] } : null
    );
    setNewMember("");
  };

  const handleRemoveMember = (memberId: string) => {
    unassignMember(team.id, memberId);
    setTeam((prev) =>
      prev ? { ...prev, members: prev.members.filter((m) => m !== memberId) } : null
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
          value={team.members.length}
          icon={Shield}
        />
      </section>

      {/* Main Members Section */}
      <section className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
            <p className="text-xs text-slate-500">
              Manage assigned agents and escalation personnel for this team.
            </p>
          </div>

          <form onSubmit={handleAddMember} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Enter email or member ID..."
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:w-64"
            />
            <button
              type="submit"
              disabled={!newMember.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* Member List Table */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
          {team.members.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active members assigned to this team yet.
            </div>
          ) : (
            team.members.map((member) => (
              <div
                key={member}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {member}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove member"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
