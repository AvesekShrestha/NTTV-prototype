import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  UserCheck,
  UserMinus,
  Users,
  ShieldCheck,
  Headphones,
  Radio,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type UserRole = "Staff" | "Agent" | "Dispatcher" | "Admin";
type UserStatus = "Active" | "Inactive";

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  level?: "L1" | "L2" | "L3";
  createdAt: string;
};

const users: User[] = [
  {
    id: 1,
    name: "Ram Shrestha",
    email: "ram.shrestha@ntc.net.np",
    role: "Agent",
    status: "Active",
    level: "L1",
    createdAt: "2026-08-12",
  },
  {
    id: 2,
    name: "Sita Thapa",
    email: "sita.thapa@ntc.net.np",
    role: "Agent",
    status: "Active",
    level: "L2",
    createdAt: "2026-08-10",
  },
  {
    id: 3,
    name: "Hari Gurung",
    email: "hari.gurung@ntc.net.np",
    role: "Agent",
    status: "Inactive",
    level: "L3",
    createdAt: "2026-07-28",
  },
  {
    id: 4,
    name: "Bikash Karki",
    email: "bikash.karki@ntc.net.np",
    role: "Dispatcher",
    status: "Active",
    createdAt: "2026-07-20",
  },
  {
    id: 5,
    name: "Anita Rai",
    email: "anita.rai@ntc.net.np",
    role: "Staff",
    status: "Active",
    createdAt: "2026-07-15",
  },
  {
    id: 6,
    name: "Prakash Adhikari",
    email: "prakash.adhikari@ntc.net.np",
    role: "Admin",
    status: "Active",
    createdAt: "2026-07-01",
  },
];

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /*
   * Read users from localStorage.
   *
   * Expected localStorage structure:
   *
   * localStorage.setItem(
   *   "users",
   *   JSON.stringify(users)
   * );
   */
  const storedUsers = useMemo<User[]>(() => {
    try {
      const stored = localStorage.getItem("users");

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const totalUsers = storedUsers.length;

  const agentCount = storedUsers.filter(
    (user) => user.role === "Agent"
  ).length;

  const adminCount = storedUsers.filter(
    (user) => user.role === "Admin"
  ).length;

  const dispatcherCount = storedUsers.filter(
    (user) => user.role === "Dispatcher"
  ).length;

  const filteredUsers = storedUsers.filter((user) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const matchesRole =
      roleFilter === "all" ||
      user.role.toLowerCase() === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      user.status.toLowerCase() === statusFilter;

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return <Badge>Admin</Badge>;

      case "Agent":
        return (
          <Badge variant="secondary">
            Agent
          </Badge>
        );

      case "Dispatcher":
        return (
          <Badge variant="outline">
            Dispatcher
          </Badge>
        );

      case "Staff":
        return (
          <Badge variant="outline">
            Staff
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Users
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage staff, agents, dispatchers, and administrators.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>

            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers}
            </div>

            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        {/* Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Agents
            </CardTitle>

            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {agentCount}
            </div>

            <p className="text-xs text-muted-foreground">
              Support agents
            </p>
          </CardContent>
        </Card>

        {/* Dispatchers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Dispatchers
            </CardTitle>

            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {dispatcherCount}
            </div>

            <p className="text-xs text-muted-foreground">
              Ticket dispatchers
            </p>
          </CardContent>
        </Card>

        {/* Administrators */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>

            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {adminCount}
            </div>

            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="pl-9"
              />
            </div>

            {/* Role */}
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value ?? "all")
              }
            >
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All roles
                </SelectItem>

                <SelectItem value="staff">
                  Staff
                </SelectItem>

                <SelectItem value="agent">
                  Agent
                </SelectItem>

                <SelectItem value="dispatcher">
                  Dispatcher
                </SelectItem>

                <SelectItem value="admin">
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value ?? "all")
              }
            >
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All statuses
                </SelectItem>

                <SelectItem value="active">
                  Active
                </SelectItem>

                <SelectItem value="inactive">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Users
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.name}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>

                      <TableCell>
                        {user.role === "Agent" ? (
                          <Badge variant="outline">
                            {user.level}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {user.status === "Active" ? (
                          <Badge>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {user.createdAt}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              View details
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              Edit user
                            </DropdownMenuItem>

                            {user.status === "Active" ? (
                              <DropdownMenuItem>
                                <UserMinus className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}

                            {user.role === "Agent" && (
                              <DropdownMenuItem>
                                <Radio className="mr-2 h-4 w-4" />
                                Manage team
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-destructive">
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
