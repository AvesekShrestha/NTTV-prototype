import AddUserDialog from "@/components/custom/AddUserDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers, removeUser } from "@/lib/storage";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Users, ShieldCheck, UserX } from "lucide-react";
import { useState } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(() => getUsers());

  const handleDelete = (userId: string) => {
    removeUser(userId);
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleUserCreated = (user: User) => {
    setUsers((currentUsers) => [...currentUsers, user]);
  };

  // Helper function to extract initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system access, user roles, and assigned teams.
          </p>
        </div>
        <div>
          <AddUserDialog onUserCreated={handleUserCreated} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admins
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {users.filter((u) => u.role?.toLowerCase() === "admin").length}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Teams Assigned
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {new Set(users.map((u) => u.team).filter(Boolean)).size}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      {users.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="p-3 bg-muted rounded-full mb-3">
            <UserX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Users Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            There are currently no users in the database. Click the button below to add your first user.
          </p>
          <div className="mt-4">
            <AddUserDialog onUserCreated={handleUserCreated} />
          </div>
        </Card>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-25">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {user.id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {user.username}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        user.role?.toLowerCase() === "admin"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {user.level ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        {user.level}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {user.team ? (
                      <span className="text-sm font-medium">{user.team}</span>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleDelete(user.id)}
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
