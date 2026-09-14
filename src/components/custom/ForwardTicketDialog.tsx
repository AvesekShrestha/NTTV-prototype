import { useMemo, useState } from "react";
import { Forward, UserRound, Users } from "lucide-react";

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

type ForwardTicketDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  teams: Team[];
  users: User[];
  onForward: (teamId: string, agentId?: string) => void;
};

export default function ForwardTicketDialog({
  open,
  onOpenChange,
  ticket,
  teams,
  users,
  onForward,
}: ForwardTicketDialogProps) {
  const [teamId, setTeamId] = useState("");
  const [agentId, setAgentId] = useState("");

  const currentLevel = ticket.level ?? "L1";

  /**
   * Forwarding keeps the ticket at its current level.
   * Only teams belonging to the ticket's category and level
   * are available.
   */
  const availableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        team.categoryId === ticket.category &&
        team.level === currentLevel
    );
  }, [teams, ticket.category, currentLevel]);

  /**
   * Agents are loaded from the selected team.
   */
  const availableAgents = useMemo(() => {
    if (!teamId) return [];

    const team = teams.find((team) => team.id === teamId);

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
    if (!teamId) return;

    onForward(
      teamId,
      agentId || undefined
    );

    setTeamId("");
    setAgentId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-5 w-5" />
            Forward Ticket
          </DialogTitle>

          <DialogDescription>
            Forward this ticket to another team or a specific agent
            within the current support level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Current level */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-sm font-medium">
              Current Support Level
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              This ticket will remain at{" "}
              <span className="font-semibold text-foreground">
                {currentLevel}
              </span>
              .
            </div>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Team
            </label>

            <Select
              value={teamId}
              onValueChange={handleTeamChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>

              <SelectContent>
                {availableTeams.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No teams available at {currentLevel}
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

          {/* Information */}
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {agentId ? (
              <>
                The ticket will be forwarded directly to the
                selected agent.
              </>
            ) : (
              <>
                The ticket will be forwarded to the selected team.
                All members of that team will receive the ticket.
              </>
            )}
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
            <Forward className="mr-2 h-4 w-4" />
            Forward Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
