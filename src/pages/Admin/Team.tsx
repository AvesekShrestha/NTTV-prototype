import { useState } from "react";
import { Users, Shield, Layers } from "lucide-react";
import Searchbar from "@/components/custom/Searchbar";
import DashboardCard from "@/components/custom/DashboardCard";
import type { Team } from "@/types/team";
import { getCategories, getCurrentUser, getTeams, removeTeam } from "@/lib/storage";
import AddTeamDialog from "@/components/custom/AddTeamDialog";
import TeamTable from "@/components/custom/TeamTable";

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>(() => getTeams());
  const [categories] = useState(() => getCategories());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const handleTeamDeleted = (teamId: string) => {
    removeTeam(teamId);
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => [...prev, newTeam]);
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesLevel = filterLevel === "all" || team.level === filterLevel;

    // Compares team.categoryId against filterCategory (which holds category.id)
    const matchesCategory =
      filterCategory === "all" || team.categoryId === filterCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const totalMembers = teams.reduce(
    (sum, team) => sum + (team.members?.length ?? 0),
    0
  );

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

        {
          getCurrentUser()?.role == "admin" &&
          <AddTeamDialog
            categories={categories}
            onTeamCreated={handleTeamCreated}
          />

        }
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

      {/* Search and Filters */}
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
            {
              key: "category",
              value: filterCategory,
              onChange: setFilterCategory,
              options: [
                { label: "Categories", value: "all" },
                // Display category name in dropdown label, pass category id as value
                ...categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                })),
              ],
            },
          ]}
        />
      </section>

      <TeamTable onTeamDeleted={handleTeamDeleted} teams={filteredTeams} />
    </div>
  );
}
