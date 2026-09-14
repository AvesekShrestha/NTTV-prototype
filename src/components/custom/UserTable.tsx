import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "./DataTable";
import type { User } from "@/types/user";

export interface UserTableProps {
  users: User[];
  onUserDeleted(userId: string): void;
}

const levelBadgeStyles: Record<string, string> = {
  L1: "bg-slate-100 text-slate-700 border-slate-200/60",
  L2: "bg-blue-50 text-blue-700 border-blue-200/60",
  L3: "bg-violet-50 text-violet-700 border-violet-200/60",
};

const UserTable = ({
  users,
  onUserDeleted,
}: UserTableProps) => {
  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const columns: Column<User>[] = [
    {
      header: "User ID",
      className: "font-mono text-xs text-slate-500",
      cell: (user) => (
        <span className="font-mono text-xs text-slate-500">
          #{user.id}
        </span>
      ),
    },

    {
      header: "User",
      className: "font-medium text-slate-900",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {getInitials(user.username)}
          </div>

          <div className="min-w-0">
            <span className="block truncate font-semibold text-slate-900">
              {user.username}
            </span>
          </div>
        </div>
      ),
    },

    {
      header: "Role",
      cell: (user) => (
        <span className="inline-flex items-center rounded-full border border-slate-200/60 bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
          {user.role}
        </span>
      ),
    },

    {
      header: "Level",
      cell: (user) => {
        if (!user.level) {
          return (
            <span className="text-xs text-slate-400">
              —
            </span>
          );
        }

        const badgeStyle =
          levelBadgeStyles[user.level] ??
          "bg-slate-100 text-slate-600 border-slate-200/60";

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyle}`}
          >
            {user.level}
          </span>
        );
      },
    },

    {
      header: "Team",
      cell: (user) =>
        user.team ? (
          <span className="text-sm font-medium text-slate-700">
            {user.team}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            —
          </span>
        ),
    },

    {
      header: "Actions",
      className: "text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onUserDeleted(user.id)}
            className="inline-flex items-center justify-center rounded-md border border-transparent p-2 text-slate-900 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      keyExtractor={(user) => user.id}
      itemsPerPage={5}
      emptyMessage="No users found matching your criteria."
    />
  );
};

export default UserTable;
