import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FolderTree,
  Forward,
  Layers,
  User,
  Users,
  ChevronDown,
  Activity,
  Send,
  ArrowUp,
  Play,
  RotateCcw,
  FileText,
} from "lucide-react";

import DashboardCard from "@/components/custom/DashboardCard";
import ForwardTicketDialog from "@/components/custom/ForwardTicketDialog";
import EscalateTicketDialog from "@/components/custom/EscalateTicketDialog";

import {
  getCategories,
  getTeams,
  getTicket,
  getUsers,
  getCurrentUser,
  startTicket,
  forwardTicket,
  escalateTicket,
  resolveTicket,
} from "@/lib/storage";

import type { Ticket } from "@/types/ticket";
import type { TicketActivity } from "@/types/activities";
import type { User as UserType } from "@/types/user";

const statusStyles: Record<
  Ticket["status"],
  {
    label: string;
    className: string;
  }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  INPROCESS: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  FORWARDED: {
    label: "Forwarded",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  ESCALATED: {
    label: "Escalated",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const priorityStyles: Record<Ticket["priority"], string> = {
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  LOW: "bg-slate-50 text-slate-600 border-slate-200",
};

const activityConfig: Record<
  TicketActivity["type"],
  {
    label: string;
    icon: typeof Activity;
    className: string;
  }
> = {
  CREATED: {
    label: "Ticket Created",
    icon: FileText,
    className: "bg-blue-50 text-blue-700",
  },
  DISPATCHED: {
    label: "Ticket Dispatched",
    icon: Send,
    className: "bg-blue-50 text-blue-700",
  },
  FORWARDED: {
    label: "Ticket Forwarded",
    icon: Forward,
    className: "bg-orange-50 text-orange-700",
  },
  ESCALATED: {
    label: "Ticket Escalated",
    icon: ArrowUp,
    className: "bg-red-50 text-red-700",
  },
  IN_PROGRESS: {
    label: "Work Started",
    icon: Play,
    className: "bg-amber-50 text-amber-700",
  },
  RESOLVED: {
    label: "Ticket Resolved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  REOPENED: {
    label: "Ticket Reopened",
    icon: RotateCcw,
    className: "bg-purple-50 text-purple-700",
  },
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatRelativeDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | undefined>(() =>
    ticketId ? getTicket(ticketId) : undefined
  );

  const [expandedActivity, setExpandedActivity] = useState<string | null>(
    null
  );

  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-slate-500 font-medium">
          Ticket not found or removed.
        </p>

        <button
          onClick={() => navigate("/tickets")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </button>
      </div>
    );
  }

  const categories = getCategories();
  const teams = getTeams();
  const users: UserType[] = getUsers();

  const currentUser = getCurrentUser();

  const category = categories.find(
    (item) => item.id === ticket.category
  );

  const assignedTeam = ticket.assignedTeamId
    ? teams.find((team) => team.id === ticket.assignedTeamId)
    : undefined;

  const assignedUser = ticket.assignedTo
    ? users.find((user) => user.id === ticket.assignedTo)
    : undefined;

  const createdBy = users.find(
    (user) => user.id === ticket.createdBy
  );

  const status = statusStyles[ticket.status];

  const activities = [...(ticket.activities ?? [])].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
  );

  const getUserName = (userId?: string) => {
    if (!userId) return "-";

    const user = users.find((item) => item.id === userId);

    return user?.username ?? userId;
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return "-";

    const team = teams.find((item) => item.id === teamId);

    return team?.name ?? teamId;
  };

  const toggleActivity = (activityId: string) => {
    setExpandedActivity((current) =>
      current === activityId ? null : activityId
    );
  };

  /*
   * ---------------------------------------------------------
   * Agent assignment
   * ---------------------------------------------------------
   *
   * A ticket can be assigned in two ways:
   *
   * 1. Directly to an agent:
   *      ticket.assignedTo === currentUser.id
   *
   * 2. To a team:
   *      ticket.assignedTeamId === team.id
   *      AND currentUser.id exists inside team.members
   *
   * Therefore, assignedTo alone must NOT be used to determine
   * whether the current agent can work on the ticket.
   */

  const isDirectlyAssignedAgent =
    currentUser?.role === "agent" &&
    ticket.assignedTo === currentUser.id;

  const isTeamMember =
    currentUser?.role === "agent" &&
    !!assignedTeam &&
    !!currentUser &&
    assignedTeam.members?.includes(currentUser.id) === true;


  const isTicketCreator =
    currentUser?.id === ticket.createdBy && currentUser.role == "staff";

  const isAssignedAgent =
    isDirectlyAssignedAgent || isTeamMember;

  /*
   * ---------------------------------------------------------
   * Ticket action permissions
   * ---------------------------------------------------------
   *
   * ASSIGNED:
   *   Newly dispatched ticket.
   *
   * FORWARDED:
   *   Ticket received after another agent/team forwarded it.
   *
   * ESCALATED:
   *   Ticket received from a lower support level.
   *
   * INPROCESS:
   *   Agent has started working.
   *
   * RESOLVED:
   *   No further actions.
   */

  const canStart =
    (isAssignedAgent || isTicketCreator) &&
    ["ASSIGNED", "FORWARDED", "ESCALATED"].includes(
      ticket.status
    );

  const canForward =
    isAssignedAgent &&
    ["ASSIGNED", "INPROCESS", "FORWARDED", "ESCALATED"].includes(
      ticket.status
    );

  /*
   * Escalation:
   *
   * L1 -> L2
   * L2 -> L3
   *
   * L3 cannot escalate any further.
   */
  const canEscalate =
    isAssignedAgent &&
    ["ASSIGNED", "INPROCESS", "FORWARDED", "ESCALATED"].includes(
      ticket.status
    ) &&
    ticket.level !== "L3";

  /*
   * Resolve:
   *
   * Agent must start working before resolving.
   */
  const canResolve =
    (isAssignedAgent || isTicketCreator) &&
    ticket.status === "INPROCESS";

  /*
   * ---------------------------------------------------------
   * Refresh ticket
   * ---------------------------------------------------------
   */

  const refreshTicket = () => {
    const updatedTicket = getTicket(ticket.id);

    if (updatedTicket) {
      setTicket(updatedTicket);
    }
  };

  /*
   * ---------------------------------------------------------
   * Agent actions
   * ---------------------------------------------------------
   */

  const handleStart = () => {
    if (!currentUser) return;

    startTicket(
      ticket.id,
      currentUser.id
    );

    refreshTicket();
  };

  const handleForward = (
    teamId: string,
    agentId?: string
  ) => {
    if (!currentUser) return;

    forwardTicket(
      ticket.id,
      [
        agentId
          ? {
            type: "AGENT",
            agentId,
          }
          : {
            type: "TEAM",
            teamId,
          },
      ],
      currentUser.id,
      teamId,
      agentId
    );

    setForwardDialogOpen(false);

    refreshTicket();
  };

  const handleEscalate = (
    teamId: string,
    agentId?: string
  ) => {
    if (!currentUser) return;

    escalateTicket(
      ticket.id,
      teamId,
      agentId,
      currentUser.id
    );

    setEscalateDialogOpen(false);

    refreshTicket();
  };

  const handleResolve = () => {
    if (!currentUser) return;

    resolveTicket(
      ticket.id,
      currentUser.id
    );

    refreshTicket();
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">

      {/* =====================================================
          Header
      ====================================================== */}

      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tickets
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {ticket.title}
              </h1>

              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <p className="text-xs font-mono text-slate-500 mt-1">
              ID: #{ticket.id}
            </p>
          </div>

          <div
            className={`inline-flex items-center w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${priorityStyles[ticket.priority]}`}
          >
            {ticket.priority} Priority
          </div>
        </div>
      </div>

      {/* =====================================================
          Overview
      ====================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Category"
          value={category?.name ?? ticket.category ?? "-"}
          icon={FolderTree}
        />

        <DashboardCard
          title="Current Level"
          value={ticket.level ?? "-"}
          icon={Layers}
        />

        <DashboardCard
          title="Assigned Team"
          value={assignedTeam?.name ?? "-"}
          icon={Users}
        />

        <DashboardCard
          title="Assigned To"
          value={assignedUser?.username ?? "-"}
          icon={User}
        />
      </section>

      {/* =====================================================
          Agent Actions
      ====================================================== */}

      {(isAssignedAgent || isTicketCreator) && (
        <section className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">

          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Agent Actions
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Manage this ticket based on your current assignment.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-[11px] font-semibold text-slate-600">
                  {ticket.level ?? "Unassigned"} Level
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* =================================================
                Start
            ================================================== */}

            {canStart && (
              <button
                type="button"
                onClick={handleStart}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-amber-300 hover:bg-amber-50/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-100">
                  <Play className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Start
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Start working on this ticket
                  </p>
                </div>
              </button>
            )}

            {/* =================================================
                Forward
            ================================================== */}

            {canForward && (
              <button
                type="button"
                onClick={() => setForwardDialogOpen(true)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-orange-300 hover:bg-orange-50/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700 transition-colors group-hover:bg-orange-100">
                  <Forward className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Forward
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Send to another team or agent
                  </p>
                </div>
              </button>
            )}

            {/* =================================================
                Escalate
            ================================================== */}

            {canEscalate && (
              <button
                type="button"
                onClick={() => setEscalateDialogOpen(true)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-red-300 hover:bg-red-50/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 transition-colors group-hover:bg-red-100">
                  <ArrowUp className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Escalate
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Move to the next support level
                  </p>
                </div>
              </button>
            )}

            {/* =================================================
                Resolve
            ================================================== */}

            {canResolve && (
              <button
                type="button"
                onClick={handleResolve}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Resolve
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Mark this ticket as resolved
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* =================================================
              No actions
          ================================================== */}

          {!canStart &&
            !canForward &&
            !canEscalate &&
            !canResolve && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm text-slate-500">
                  No actions are currently available for this ticket.
                </p>
              </div>
            )}
        </section>
      )}

      {/* =====================================================
          Ticket Information
      ====================================================== */}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Description */}

        <div className="lg:col-span-2 flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              Ticket Information
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Details about the submitted issue.
            </p>
          </div>

          <div className="flex flex-col gap-5">

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Title
              </p>

              <p className="text-sm font-semibold text-slate-900">
                {ticket.title}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Description
              </p>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                  {ticket.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Created By
                </p>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                    {(
                      createdBy?.username ??
                      ticket.createdBy
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span className="text-sm font-medium text-slate-800">
                    {createdBy?.username ?? ticket.createdBy}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Created At
                </p>

                <p className="text-sm text-slate-700">
                  {formatDate(new Date(ticket.createdAt))}
                </p>
              </div>

            </div>

            {ticket.resolvedAt && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Resolved At
                </p>

                <p className="text-sm text-emerald-700 font-medium">
                  {formatDate(new Date(ticket.resolvedAt))}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Current Status */}

        <div className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">

          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              Current Status
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Current state of this ticket.
            </p>
          </div>

          <div className="flex flex-col gap-4">

            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                Status
              </p>

              <p className="text-lg font-bold text-slate-900 mt-1">
                {status.label}
              </p>
            </div>

            <div className="flex flex-col gap-3">

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Priority
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${priorityStyles[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Level
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {ticket.level ?? "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Team
                </span>

                <span className="text-xs font-semibold text-slate-900 text-right">
                  {assignedTeam?.name ?? "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Assigned To
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {assignedUser?.username ?? "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Last Updated
                </span>

                <span className="text-xs font-medium text-slate-700">
                  {formatRelativeDate(
                    new Date(ticket.updatedAt)
                  )}
                </span>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* =====================================================
          Activity Timeline
      ====================================================== */}

      <section className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Ticket Activity
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              History of actions and status changes made to this ticket.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            <Activity className="w-3.5 h-3.5" />

            {activities.length}{" "}
            {activities.length === 1
              ? "Activity"
              : "Activities"}
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-8 h-8 text-slate-300 mb-3" />

            <p className="text-sm font-medium text-slate-500">
              No activities yet.
            </p>
          </div>
        ) : (
          <div className="relative">

            <div className="absolute left-4.5 top-5 bottom-5 w-px bg-slate-200" />

            <div className="flex flex-col gap-3">

              {activities.map((activity) => {
                const config =
                  activityConfig[activity.type];

                const Icon =
                  config?.icon ?? Activity;

                const isExpanded =
                  expandedActivity === activity.id;

                return (
                  <div
                    key={activity.id}
                    className="relative"
                  >
                    <div className="flex items-start gap-4">

                      <div
                        className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${config?.className ??
                          "bg-slate-100 text-slate-600"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">

                        <button
                          type="button"
                          onClick={() =>
                            toggleActivity(activity.id)
                          }
                          className="w-full text-left rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4 p-4">

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {config?.label ??
                                  activity.type}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {formatDate(
                                  new Date(
                                    activity.timestamp
                                  )
                                )}
                              </p>
                            </div>

                            <ChevronDown
                              className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isExpanded
                                ? "rotate-180"
                                : ""
                                }`}
                            />

                          </div>

                          {isExpanded && (
                            <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50">

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <ActivityDetail
                                  label="Performed By"
                                  value={getUserName(
                                    activity.performedBy
                                  )}
                                />

                                <ActivityDetail
                                  label="Activity"
                                  value={
                                    config?.label ??
                                    activity.type
                                  }
                                />

                                {activity.fromLevel && (
                                  <ActivityDetail
                                    label="Previous Level"
                                    value={
                                      activity.fromLevel
                                    }
                                  />
                                )}

                                {activity.toLevel && (
                                  <ActivityDetail
                                    label="New Level"
                                    value={
                                      activity.toLevel
                                    }
                                  />
                                )}

                                {activity.fromTeamId && (
                                  <ActivityDetail
                                    label="Previous Team"
                                    value={getTeamName(
                                      activity.fromTeamId
                                    )}
                                  />
                                )}

                                {activity.toTeamId && (
                                  <ActivityDetail
                                    label="New Team"
                                    value={getTeamName(
                                      activity.toTeamId
                                    )}
                                  />
                                )}

                                {activity.fromUserId && (
                                  <ActivityDetail
                                    label="Previous Assignee"
                                    value={getUserName(
                                      activity.fromUserId
                                    )}
                                  />
                                )}

                                {activity.toUserId && (
                                  <ActivityDetail
                                    label="New Assignee"
                                    value={getUserName(
                                      activity.toUserId
                                    )}
                                  />
                                )}

                                <ActivityDetail
                                  label="Timestamp"
                                  value={formatDate(
                                    new Date(
                                      activity.timestamp
                                    )
                                  )}
                                />

                              </div>
                            </div>
                          )}
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

      </section>

      {/* =====================================================
          Dispatch History
      ====================================================== */}

      {ticket.dispatches?.length > 0 && (
        <section className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">

          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              Dispatch History
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Teams and users that have received this ticket.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">

            {ticket.dispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col gap-3">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Dispatch
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(
                          new Date(dispatch.dispatchedAt)
                        )}
                      </p>
                    </div>

                    <div className="text-xs text-slate-500">
                      By{" "}
                      <span className="font-semibold text-slate-700">
                        {getUserName(
                          dispatch.dispatchedBy
                        )}
                      </span>
                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {dispatch.targets.map(
                      (target, index) => (
                        <span
                          key={`${dispatch.id}-${index}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                        >
                          {target.type === "TEAM" ? (
                            <>
                              <Users className="w-3 h-3" />

                              {getTeamName(
                                target.teamId
                              )}
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3" />

                              {getUserName(
                                target.agentId
                              )}
                            </>
                          )}
                        </span>
                      )
                    )}

                  </div>

                </div>
              </div>
            ))}

          </div>
        </section>
      )}

      {/* =====================================================
          Forward Dialog
      ====================================================== */}

      {isAssignedAgent && (
        <ForwardTicketDialog
          open={forwardDialogOpen}
          onOpenChange={setForwardDialogOpen}
          ticket={ticket}
          teams={teams}
          users={users}
          onForward={handleForward}
        />
      )}

      {/* =====================================================
          Escalate Dialog
      ====================================================== */}

      {isAssignedAgent && (
        <EscalateTicketDialog
          open={escalateDialogOpen}
          onOpenChange={setEscalateDialogOpen}
          ticket={ticket}
          teams={teams}
          users={users}
          onEscalate={handleEscalate}
        />
      )}

    </div>
  );
}

function ActivityDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
        {label}
      </p>

      <p className="text-xs font-medium text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}
