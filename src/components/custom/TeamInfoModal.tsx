import { useState } from "react";
import { X, UserPlus, UserX, Shield, Layers, FolderTree } from "lucide-react";
import type { Team } from "@/types/team";
import { assignMember, unassignMember } from "@/lib/storage";
import { getCategories } from "@/lib/storage";

interface TeamInfoModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated: (updatedTeam: Team) => void;
}

export function TeamInfoModal({
  team,
  isOpen,
  onClose,
  onTeamUpdated,
}: TeamInfoModalProps) {
  const [newMember, setNewMember] = useState("");

  if (!isOpen || !team) return null;

  const categories = getCategories();
  const category = categories.find((c) => c.id === team.categoryId);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.trim() || team.members.includes(newMember.trim())) return;

    assignMember(team.id, newMember.trim());
    const updatedTeam = { ...team, members: [...team.members, newMember.trim()] };
    onTeamUpdated(updatedTeam);
    setNewMember("");
  };

  const handleRemoveMember = (memberId: string) => {
    unassignMember(team.id, memberId);
    const updatedTeam = {
      ...team,
      members: team.members.filter((m) => m !== memberId),
    };
    onTeamUpdated(updatedTeam);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-2xl p-6 space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
            <p className="text-xs font-mono text-slate-500 mt-0.5">ID: #{team.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <FolderTree className="w-3.5 h-3.5" /> Category
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {category ? category.name : team.categoryId || "Unassigned"}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Layers className="w-3.5 h-3.5" /> Support Level
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
              {team.level}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Shield className="w-3.5 h-3.5" /> Total Members
            </div>
            <p className="text-sm font-semibold text-slate-900">{team.members.length}</p>
          </div>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex gap-2">
          <input
            type="text"
            placeholder="Add agent email or ID..."
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={!newMember.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </form>

        {/* Members List */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Assigned Team Members ({team.members.length})
          </h3>
          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {team.members.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No members assigned to this team yet.
              </div>
            ) : (
              team.members.map((member) => (
                <div
                  key={member}
                  className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-800">{member}</span>
                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Remove member"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
