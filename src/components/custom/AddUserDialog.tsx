import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addUser } from "@/lib/storage";
import type { User } from "@/types/user";
import { Plus } from "lucide-react";

interface AddUserDialogProps {
  onUserCreated: (user: User) => void;
}

const AddUserDialog = ({ onUserCreated }: AddUserDialogProps) => {
  const [open, setOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [role, setRole] = useState<User["role"]>("agent");
  const [level, setLevel] = useState<User["level"]>();
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setUsername("");
    setRole("agent");
    setLevel(undefined);
    setPassword("");
  };



  const handleRoleChange = (value: User["role"]) => {
    setRole(value);

    if (value !== "agent") {
      setLevel(undefined);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password,
      role,
      level: role === "agent" ? level : undefined,
    };

    addUser(newUser);
    onUserCreated(newUser);

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger>
        <div
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add User
        </div>

      </DialogTrigger>

      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign their role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>

            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Role
            </label>

            <Select
              value={role}
              onValueChange={(value) =>
                handleRoleChange(value as User["role"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="dispatcher">
                  Dispatcher
                </SelectItem>

                <SelectItem value="agent">
                  Agent
                </SelectItem>

                <SelectItem value="staff">
                  Staff
                </SelectItem>

              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Level
            </label>

            <Select
              value={level}
              onValueChange={(value) =>
                setLevel(value as User["level"])
              }
              disabled={role !== "agent"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="L1">
                  L1
                </SelectItem>

                <SelectItem value="L2">
                  L2
                </SelectItem>

                <SelectItem value="L3">
                  L3
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
