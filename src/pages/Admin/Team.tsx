import { useState } from "react";
import { Users, Shield, Layers, Plus } from "lucide-react";
import Searchbar from "@/components/custom/Searchbar";
import DashboardCard from "@/components/custom/DashboardCard";
import type { Team } from "@/types/team";
import { getTeams, removeTeam } from "@/lib/storage";
import { CreateTeamModal } from "@/components/custom/CreateTeamModal";
import { TeamInfoModal } from "@/components/custom/TeamInfoModal";
import TeamTable from "@/components/custom/TeamTable";

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>(() => getTeams());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // Modal State Control
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamForInfo, setSelectedTeamForInfo] = useState<Team | null>(null);

  const handleTeamDeleted = (teamId: string) => {
    removeTeam(teamId);
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => [...prev, newTeam]);
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
    );
    if (selectedTeamForInfo?.id === updatedTeam.id) {
      setSelectedTeamForInfo(updatedTeam);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesLevel = filterLevel === "all" || team.level === filterLevel;

    return matchesSearch && matchesLevel;
  });

  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Teams
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Organize support teams, category assignments, and level escalations.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-slate-50 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Total Teams" value={teams.length} icon={Users} />
        <DashboardCard title="Total Members" value={totalMembers} icon={Shield} />
        <DashboardCard
          title="L3 Support Teams"
          value={teams.filter((t) => t.level === "L3").length}
          icon={Layers}
        />
      </section>

      {/* Main Content Section */}
      <section className="flex flex-col gap-4">
        <Searchbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search teams..."
          filters={[
            {
              key: "level",
              value: filterLevel,
              onChange: setFilterLevel,
              options: [
                { label: "All Levels", value: "all" },
                { label: "L1 Support", value: "L1" },
                { label: "L2 Support", value: "L2" },
                { label: "L3 Support", value: "L3" },
              ],
            },
          ]}
        />
        <TeamTable
          teams={filteredTeams}
          onTeamDeleted={handleTeamDeleted}
          onTeamUpdated={handleTeamUpdated}
          onViewTeamInfo={(team) => setSelectedTeamForInfo(team)}
        />
      </section>

      {/* Separate Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />

      <TeamInfoModal
        team={selectedTeamForInfo}
        isOpen={!!selectedTeamForInfo}
        onClose={() => setSelectedTeamForInfo(null)}
        onTeamUpdated={handleTeamUpdated}
      />
    </div>
  );
}
