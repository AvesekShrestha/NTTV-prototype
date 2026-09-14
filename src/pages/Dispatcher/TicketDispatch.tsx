import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  Forward,
  Search,
  Send,
  UserRound,
  Users,
  CircleCheck,
  CircleDot,
  AlertCircle,
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
  dispatchTicket,
  getCategories,
  getCurrentUser,
  getTeams,
  getTicket,
  getUsers,
} from "@/lib/storage";

import type { TicketActivity } from "@/types/activities";

type DispatchMode = "TEAM" | "AGENT";

const activityConfig: Record<
  TicketActivity["type"],
  {
    label: string;
    icon: typeof FileText;
    className: string;
  }
> = {
  CREATED: {
    label: "Ticket Created",
    icon: FileText,
    className: "bg-slate-100 text-slate-700",
  },

  DISPATCHED: {
    label: "Ticket Dispatched",
    icon: Send,
    className: "bg-blue-100 text-blue-700",
  },

  FORWARDED: {
    label: "Ticket Forwarded",
    icon: Forward,
    className: "bg-orange-100 text-orange-700",
  },

  ESCALATED: {
    label: "Ticket Escalated",
    icon: AlertCircle,
    className: "bg-red-100 text-red-700",
  },

  IN_PROGRESS: {
    label: "Work Started",
    icon: CircleDot,
    className: "bg-yellow-100 text-yellow-700",
  },

  RESOLVED: {
    label: "Ticket Resolved",
    icon: CircleCheck,
    className: "bg-green-100 text-green-700",
  },

  REOPENED: {
    label: "Ticket Reopened",
    icon: Clock3,
    className: "bg-purple-100 text-purple-700",
  },
};

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  INPROCESS: "bg-yellow-100 text-yellow-700",
  FORWARDED: "bg-orange-100 text-orange-700",
  ESCALATED: "bg-red-100 text-red-700",
  RESOLVED: "bg-green-100 text-green-700",
};

export default function TicketDispatch() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [mode, setMode] = useState<DispatchMode>("TEAM");
  const [search, setSearch] = useState("");

  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
    []
  );

  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    []
  );

  const ticket = ticketId ? getTicket(ticketId) : undefined;
  const currentUser = getCurrentUser();

  const categories = getCategories();
  const teams = getTeams();
  const users = getUsers();

  /*
   * Hooks must always execute before conditional returns.
   */

  const category = useMemo(() => {
    if (!ticket) return undefined;

    return categories.find(
      (item) => item.id === ticket.category
    );
  }, [ticket, categories]);

  /*
   * Dispatcher starts tickets at L1.
   *
   * Only teams belonging to the ticket category and
   * currently at L1 are available for initial dispatch.
   */
  const eligibleTeams = useMemo(() => {
    if (!ticket) return [];

    return teams.filter(
      (team) =>
        team.categoryId === ticket.category &&
        team.level === "L1"
    );
  }, [ticket, teams]);

  /*
   * Get all agent IDs belonging to eligible teams.
   */
  const eligibleAgentIds = useMemo(() => {
    return new Set(
      eligibleTeams.flatMap(
        (team) => team.members ?? []
      )
    );
  }, [eligibleTeams]);

  /*
   * Only L1 agents belonging to the ticket's category teams.
   */
  const eligibleAgents = useMemo(() => {
    return users.filter(
      (user) =>
        eligibleAgentIds.has(user.id) &&
        user.role === "agent" &&
        user.level === "L1"
    );
  }, [users, eligibleAgentIds]);

  /*
   * Search teams.
   */
  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return eligibleTeams;
    }

    return eligibleTeams.filter((team) =>
      team.name.toLowerCase().includes(query)
    );
  }, [eligibleTeams, search]);

  /*
   * Search agents.
   */
  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return eligibleAgents;
    }

    return eligibleAgents.filter((agent) =>
      agent.username.toLowerCase().includes(query)
    );
  }, [eligibleAgents, search]);

  /*
   * Latest activity first.
   */
  const activities = useMemo(() => {
    if (!ticket) return [];

    return [...ticket.activities].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );
  }, [ticket]);

  /*
   * Selected target count.
   */
  const selectedCount =
    mode === "TEAM"
      ? selectedTeamIds.length
      : selectedAgentIds.length;

  /*
   * Conditional returns happen only AFTER all hooks.
   */

  if (!ticket) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Ticket not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            The ticket you are trying to dispatch does not exist.
          </p>

          <Button
            className="mt-4"
            onClick={() => navigate("/tickets")}
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Authentication required
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Please log in before dispatching a ticket.
          </p>
        </div>
      </div>
    );
  }

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((current) =>
      current.includes(teamId)
        ? current.filter((id) => id !== teamId)
        : [...current, teamId]
    );
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((current) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId]
    );
  };

  const changeMode = (newMode: DispatchMode) => {
    setMode(newMode);
    setSearch("");

    /*
     * Do not allow team + agent targets to be
     * selected at the same time.
     */
    if (newMode === "TEAM") {
      setSelectedAgentIds([]);
    } else {
      setSelectedTeamIds([]);
    }
  };

  const handleDispatch = () => {
    if (!ticketId) return;

    if (mode === "TEAM") {
      if (selectedTeamIds.length === 0) return;

      dispatchTicket(
        ticketId,
        selectedTeamIds.map((teamId) => ({
          type: "TEAM",
          teamId,
        })),
        currentUser.id
      );
    }

    if (mode === "AGENT") {
      if (selectedAgentIds.length === 0) return;

      dispatchTicket(
        ticketId,
        selectedAgentIds.map((agentId) => ({
          type: "AGENT",
          agentId,
        })),
        currentUser.id
      );
    }

    /*
     * dispatchTicket() updates:
     *
     * - ticket status
     * - dispatch history
     * - recipients
     * - DISPATCHED activity
     *
     * Then return to the ticket details page.
     */
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8 lg:p-10">

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button
            variant="ghost"
            className="-ml-3 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">
            Dispatch Ticket
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review the ticket status and select where it should
            be dispatched.
          </p>
        </div>

        {/* Current Status */}
        <div
          className={`w-fit rounded-full px-3 py-1.5 text-sm font-medium ${statusStyles[ticket.status] ??
            "bg-slate-100 text-slate-700"
            }`}
        >
          {ticket.status}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TICKET SUMMARY */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Ticket
            </p>

            <p className="mt-1 text-lg font-semibold">
              #{ticket.id}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Category
            </p>

            <p className="mt-1 text-lg font-semibold">
              {category?.name ?? "Unknown"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Current Level
            </p>

            <p className="mt-1 text-lg font-semibold">
              {ticket.level ?? "Not Assigned"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

        {/* ======================================================= */}
        {/* LEFT - DISPATCH FORM */}
        {/* ======================================================= */}

        <Card>
          <CardHeader>
            <CardTitle>
              Dispatch To
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Select either one or more teams or individual agents.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* MODE SELECTOR */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

              <button
                type="button"
                onClick={() => changeMode("TEAM")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${mode === "TEAM"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                  }`}
              >
                <div className="rounded-md bg-muted p-2">
                  <Users className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    Teams
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Dispatch to one or more teams
                  </p>
                </div>

                {mode === "TEAM" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => changeMode("AGENT")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${mode === "AGENT"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                  }`}
              >
                <div className="rounded-md bg-muted p-2">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    Individual Agents
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Dispatch directly to agents
                  </p>
                </div>

                {mode === "AGENT" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>

            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={
                  mode === "TEAM"
                    ? "Search teams..."
                    : "Search agents..."
                }
                className="pl-9"
              />
            </div>

            {/* =================================================== */}
            {/* TEAM SELECTION */}
            {/* =================================================== */}

            {mode === "TEAM" && (
              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Available Teams
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Level 1 teams for this ticket category
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {selectedTeamIds.length} selected
                  </span>
                </div>

                {filteredTeams.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-2 font-medium">
                      No teams available
                    </p>

                    <p className="text-sm text-muted-foreground">
                      There are no Level 1 teams configured
                      for this category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {filteredTeams.map((team) => {
                      const selected =
                        selectedTeamIds.includes(team.id);

                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() =>
                            toggleTeam(team.id)
                          }
                          className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                            }`}
                        >
                          <div className="rounded-md bg-muted p-2">
                            <Users className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium">
                              {team.name}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {team.members?.length ?? 0} members
                              {" · "}
                              {team.level}
                            </p>
                          </div>

                          {selected && (
                            <div className="rounded-full bg-primary p-1 text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =================================================== */}
            {/* AGENT SELECTION */}
            {/* =================================================== */}

            {mode === "AGENT" && (
              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Available Agents
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Level 1 agents for this ticket category
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {selectedAgentIds.length} selected
                  </span>
                </div>

                {filteredAgents.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <UserRound className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-2 font-medium">
                      No agents available
                    </p>

                    <p className="text-sm text-muted-foreground">
                      There are no Level 1 agents available
                      for this category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {filteredAgents.map((agent) => {
                      const selected =
                        selectedAgentIds.includes(agent.id);

                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() =>
                            toggleAgent(agent.id)
                          }
                          className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                            }`}
                        >
                          <div className="rounded-full bg-muted p-2">
                            <UserRound className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium">
                              {agent.username}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              Level {agent.level}
                            </p>
                          </div>

                          {selected && (
                            <div className="rounded-full bg-primary p-1 text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =================================================== */}
            {/* DISPATCH ACTION */}
            {/* =================================================== */}

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-medium">
                  {selectedCount > 0
                    ? `${selectedCount} ${mode === "TEAM"
                      ? "team"
                      : "agent"
                    }${selectedCount > 1 ? "s" : ""
                    } selected`
                    : "No recipient selected"}
                </p>

                <p className="text-sm text-muted-foreground">
                  Dispatching will update the ticket status.
                </p>
              </div>

              <Button
                disabled={selectedCount === 0}
                onClick={handleDispatch}
              >
                <Send className="mr-2 h-4 w-4" />
                Dispatch Ticket
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* ======================================================= */}
        {/* RIGHT - STATUS + ACTIVITY */}
        {/* ======================================================= */}

        <div className="space-y-6">

          {/* CURRENT STATUS */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div>
                <p className="text-sm text-muted-foreground">
                  Status
                </p>

                <div
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusStyles[ticket.status] ??
                    "bg-slate-100 text-slate-700"
                    }`}
                >
                  {ticket.status}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Title
                </p>

                <p className="mt-1 font-medium">
                  {ticket.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6">
                  {ticket.description}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* ACTIVITY */}
          <Card>
            <CardHeader>
              <CardTitle>
                Ticket Activity
              </CardTitle>
            </CardHeader>

            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity recorded.
                </p>
              ) : (
                <div className="space-y-5">

                  {activities.map((activity, index) => {
                    const config =
                      activityConfig[activity.type];

                    const Icon = config.icon;

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-3"
                      >
                        {index <
                          activities.length - 1 && (
                            <div className="absolute left-4.75 top-9 h-[calc(100%+1rem)] w-px bg-border" />
                          )}

                        <div
                          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.className}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {config.label}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(
                              activity.timestamp
                            ).toLocaleString()}
                          </p>

                          {activity.note && (
                            <p className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                              {activity.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
