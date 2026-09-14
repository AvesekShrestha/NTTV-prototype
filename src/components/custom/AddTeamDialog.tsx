import { useState } from "react";
import type { FormEvent } from "react";
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
import { addTeam } from "@/lib/storage";
import { Plus } from "lucide-react";
import type { Team, TeamLevel } from "@/types/team";
import type { Category } from "@/types/category";

interface AddTeamDialogProps {
  categories: Category[];
  onTeamCreated: (team: Team) => void;
}

const AddTeamDialog = ({ categories, onTeamCreated }: AddTeamDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [level, setLevel] = useState<TeamLevel>("L1");

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setLevel("L1");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!categoryId) return;

    const newTeam: Team = {
      id: crypto.randomUUID(),
      name,
      categoryId,
      level,
    };

    addTeam(newTeam);
    onTeamCreated(newTeam);

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
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          Add Team
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new team</DialogTitle>
          <DialogDescription>
            Enter the details to add a new team to a category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="space-y-2 w-full">
            <label htmlFor="name" className="text-sm font-medium block">
              Team Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2 w-full">
            <label htmlFor="category" className="text-sm font-medium block">
              Category
            </label>
            <Select
              value={categoryId}
              onValueChange={(val) => setCategoryId(val ?? "")}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full">
            <label htmlFor="level" className="text-sm font-medium block">
              Level
            </label>
            <Select
              value={level}
              onValueChange={(val) => {
                if (val) setLevel(val as TeamLevel);
              }}
            >
              <SelectTrigger id="level" className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L1">Level 1 (L1)</SelectItem>
                <SelectItem value="L2">Level 2 (L2)</SelectItem>
                <SelectItem value="L3">Level 3 (L3)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamDialog;
