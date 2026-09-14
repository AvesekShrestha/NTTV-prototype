import { useMemo, useState } from "react";
import {
  CornerDownLeft,
  Forward,
  UserRound,
  Users,
} from "lucide-react";

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
  const [forwardToCreator, setForwardToCreator] = useState(false);

  const currentLevel = ticket.level ?? "L1";

  const creator = useMemo(() => {
    return users.find((user) => user.id === ticket.createdBy);
  }, [users, ticket.createdBy]);

  const availableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        team.categoryId === ticket.category &&
        team.level === currentLevel
    );
  }, [teams, ticket.category, currentLevel]);

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
    setForwardToCreator(false);
  };

  const handleAgentChange = (value: string | null) => {
    setAgentId(value ?? "");
    setForwardToCreator(false);
  };

  const handleCreatorChange = (value: string | null) => {
    if (value === "creator") {
      setForwardToCreator(true);
      setTeamId("");
      setAgentId("");
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setTeamId("");
      setAgentId("");
      setForwardToCreator(false);
    }

    onOpenChange(value);
  };

  const handleSubmit = () => {
    if (forwardToCreator) {
      if (!creator) return;

      onForward("", creator.id);
    } else {
      if (!teamId) return;

      onForward(teamId, agentId || undefined);
    }

    setTeamId("");
    setAgentId("");
    setForwardToCreator(false);
    onOpenChange(false);
  };

  const canSubmit =
    (forwardToCreator && !!creator) ||
    !!teamId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-5 w-5" />
            Forward Ticket
          </DialogTitle>

          <DialogDescription>
            Forward this ticket to another team, a specific agent,
            or back to the ticket creator.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-5 py-4">
          {/* Current Level */}
          <div className="w-full rounded-lg border bg-muted/30 p-4">
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

          {/* Forward To */}
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">
              Forward To
            </label>

            <Select
              value={
                forwardToCreator
                  ? "creator"
                  : teamId
                    ? teamId
                    : ""
              }
              onValueChange={(value) => {
                if (value === "creator") {
                  handleCreatorChange(value);
                } else {
                  handleTeamChange(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select forwarding destination" />
              </SelectTrigger>

              <SelectContent>
                {/* Ticket Creator */}
                {creator && (
                  <SelectItem value="creator">
                    <div className="flex items-center gap-2">
                      <CornerDownLeft className="h-4 w-4" />

                      <div className="flex flex-col">
                        <span>{creator.username}</span>
                        <span className="text-xs text-muted-foreground">
                          Ticket Creator
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                )}

                {/* Teams */}
                {availableTeams.map((team) => (
                  <SelectItem
                    key={team.id}
                    value={team.id}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}

                {availableTeams.length === 0 && !creator && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No forwarding destinations available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Agent */}
          {!forwardToCreator && (
            <div className="w-full space-y-2">
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
                <SelectTrigger className="w-full">
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
          )}

          {/* Information */}
          <div className="w-full rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {forwardToCreator ? (
              <>
                This ticket will be forwarded back to{" "}
                <span className="font-medium text-foreground">
                  {creator?.username}
                </span>
                , the original ticket creator.
              </>
            ) : agentId ? (
              <>
                The ticket will be forwarded directly to the
                selected agent.
              </>
            ) : teamId ? (
              <>
                The ticket will be forwarded to the selected team.
                All members of that team will receive the ticket.
              </>
            ) : (
              <>
                Select a team or forward the ticket back to its
                original creator.
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
            disabled={!canSubmit}
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
