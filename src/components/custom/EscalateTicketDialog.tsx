import { useMemo, useState } from "react";
import { ArrowUp, UserRound, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import type { Ticket } from "@/types/ticket";
import type { Team } from "@/types/team";
import type { User } from "@/types/user";

type EscalateTicketDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  teams: Team[];
  users: User[];
  onEscalate: (teamId: string, agentId?: string) => void;
};

function getNextLevel(
  level: Ticket["level"]
): "L2" | "L3" | null {
  if (level === "L1") return "L2";
  if (level === "L2") return "L3";

  return null;
}

export default function EscalateTicketDialog({
  open,
  onOpenChange,
  ticket,
  teams,
  users,
  onEscalate,
}: EscalateTicketDialogProps) {
  const [teamId, setTeamId] = useState("");
  const [agentId, setAgentId] = useState("");

  const currentLevel = ticket.level ?? "L1";
  const nextLevel = getNextLevel(currentLevel);

  const availableTeams = useMemo(() => {
    if (!nextLevel) return [];

    return teams.filter(
      (team) =>
        team.categoryId === ticket.category &&
        team.level === nextLevel
    );
  }, [teams, ticket.category, nextLevel]);

  const availableAgents = useMemo(() => {
    if (!teamId) return [];

    const team = teams.find(
      (team) => team.id === teamId
    );

    if (!team) return [];

    return users.filter(
      (user) =>
        user.role === "agent" &&
        user.level === team.level &&
        team.members?.includes(user.id)
    );
  }, [teamId, teams, users]);

  const handleTeamChange = (value: string | null) => {
    const newTeamId = value ?? "";

    setTeamId(newTeamId);
    setAgentId("");
  };

  const handleAgentChange = (value: string | null) => {
    setAgentId(value ?? "");
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setTeamId("");
      setAgentId("");
    }

    onOpenChange(value);
  };

  const handleSubmit = () => {
    if (!teamId || !nextLevel) return;

    onEscalate(
      teamId,
      agentId || undefined
    );

    setTeamId("");
    setAgentId("");
    onOpenChange(false);
  };

  if (!nextLevel) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5" />
            Escalate Ticket
          </DialogTitle>

          <DialogDescription>
            Move this ticket to the next support level for
            further investigation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Level transition */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-3 text-sm font-medium">
              Support Level
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="rounded-lg border bg-background px-5 py-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Current
                </div>

                <div className="mt-1 text-lg font-semibold">
                  {currentLevel}
                </div>
              </div>

              <ArrowUp className="h-5 w-5 text-muted-foreground" />

              <div className="rounded-lg border bg-background px-5 py-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Escalate To
                </div>

                <div className="mt-1 text-lg font-semibold">
                  {nextLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Target team */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {nextLevel} Team
            </label>

            <Select
              value={teamId}
              onValueChange={handleTeamChange}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={`Select ${nextLevel} team`}
                />
              </SelectTrigger>

              <SelectContent>
                {availableTeams.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No {nextLevel} teams available
                  </div>
                ) : (
                  availableTeams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {team.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Agent */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Agent{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>

            <Select
              value={agentId}
              onValueChange={handleAgentChange}
              disabled={!teamId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    teamId
                      ? "Select an agent or leave unassigned"
                      : "Select a team first"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {availableAgents.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No agents available
                  </div>
                ) : (
                  availableAgents.map((agent) => (
                    <SelectItem
                      key={agent.id}
                      value={agent.id}
                    >
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        {agent.username}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
            This action will move the ticket from{" "}
            <span className="font-semibold text-foreground">
              {currentLevel}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {nextLevel}
            </span>
            .
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={!teamId}
            onClick={handleSubmit}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Escalate to {nextLevel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
