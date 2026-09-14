import AddUserDialog from "@/components/custom/AddUserDialog";
import UserTable from "@/components/custom/UserTable";
import Searchbar from "@/components/custom/Searchbar";
import { getUsers, removeUser } from "@/lib/storage";
import type { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(() => getUsers());

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const handleDelete = (userId: string) => {
    removeUser(userId);

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId)
    );
  };

  const handleUserCreated = (user: User) => {
    setUsers((currentUsers) => [...currentUsers, user]);
  };

  const adminCount = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const teamsAssigned = new Set(
    users.map((user) => user.team).filter(Boolean)
  ).size;

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.level?.toLowerCase().includes(query) ||
        user.team?.toLowerCase().includes(query);

      const matchesRole =
        filterRole === "all" ||
        user.role?.toLowerCase() === filterRole.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system access, user roles, and assigned teams.
          </p>
        </div>

        <AddUserDialog onUserCreated={handleUserCreated} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Users
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {users.length}
              </h3>
            </div>

            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Admins
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {adminCount}
              </h3>
            </div>

            <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Teams Assigned
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {teamsAssigned}
              </h3>
            </div>

            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <section>
        <Searchbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search users..."
          filters={[
            {
              key: "role",
              value: filterRole,
              onChange: setFilterRole,
              options: [
                { label: "All Roles", value: "all" },
                { label: "Admin", value: "admin" },
                { label: "Staff", value: "staff" },
                { label: "Dispatcher", value: "dispatcher" },
                { label: "Agent", value: "agent" },
              ],
            },
          ]}
        />
      </section>

      {/* Users */}
      {filteredUsers.length === 0 ? (
        <Card className="border-dashed border-slate-300 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3">
              <UserX className="h-8 w-8 text-slate-400" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              No Users Found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              No users match your current search or role filter.
            </p>

            {(searchQuery || filterRole !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterRole("all");
                }}
                className="mt-4 text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
              >
                Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <UserTable
          users={filteredUsers}
          onUserDeleted={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminUsers;
