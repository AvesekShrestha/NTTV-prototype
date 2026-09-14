import type { TicketActivity } from "@/types/activities";
import type { Category, CategoryStatus } from "@/types/category";
import type { DispatchTarget, TicketDispatch } from "@/types/dispatch";
import type { TicketRecipient } from "@/types/recipient";
import type { Team } from "@/types/team";
import type { Ticket, TicketStatus } from "@/types/ticket";
import type { User } from "@/types/user";


export const getUsers = (): User[] => {
  const data = localStorage.getItem("users");

  if (!data) return [];
  return JSON.parse(data);
}

export const saveUsers = (users: User[]) => {
  localStorage.setItem("users", JSON.stringify(users));
}

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem("currentUser");
  if (!data) return null;

  return JSON.parse(data);
}

export const setCurrentUser = (user: User) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export const removeCurrentUser = () => {
  localStorage.removeItem("currentUser")
}

export const removeUser = (userId: string) => {
  const users = getUsers()

  const updatedUsers = users.filter((user) => user.id != userId)
  saveUsers(updatedUsers);
}


// category 

export const getCategories = (): Category[] => {
  const data = localStorage.getItem("category");

  if (!data) return [];

  return JSON.parse(data);
}


export const saveCategories = (categories: Category[]) => {
  localStorage.setItem("category", JSON.stringify(categories));
}

export const addCategory = (category: Category) => {
  const categories = getCategories();
  categories.push(category)

  saveCategories(categories);
}

export const removeCategory = (categoryId: string) => {
  const categories = getCategories();
  const updatedCategories = categories.filter((category) => category.id !== categoryId);
  saveCategories(updatedCategories);
}

export const updateCategoryStatus = (
  categoryId: string,
  newStatus: CategoryStatus
) => {
  const categories = getCategories();
  const updated = categories.map((cat) =>
    cat.id === categoryId ? { ...cat, status: newStatus } : cat
  );
  localStorage.setItem('categories', JSON.stringify(updated));
};


// team 

export const getTeams = (): Team[] => {
  const data = localStorage.getItem("teams");
  if (!data) return []
  return JSON.parse(data);
}

export const saveTeams = (teams: Team[]) => {
  localStorage.setItem("teams", JSON.stringify(teams))
}

export const addTeam = (team: Team) => {
  const teams = getTeams();
  teams.push({ ...team, members: team.members ?? [] })

  saveTeams(teams);
}

export const removeTeam = (teamId: string) => {
  const teams = getTeams()
  const updatedTeams = teams.filter((team) => team.id !== teamId)

  saveTeams(updatedTeams)
}

export const assignMember = (
  teamId: string,
  memberId: string
) => {
  const teams = getTeams();

  const updatedTeams = teams.map((team) => {
    if (team.id !== teamId) {
      return team;
    }

    const members = team.members ?? [];

    if (members.includes(memberId)) {
      return team;
    }

    return {
      ...team,
      members: [...members, memberId],
    };
  });

  saveTeams(updatedTeams);
};

export const unassignMember = (
  teamId: string,
  memberId: string
) => {
  const teams = getTeams();

  const updatedTeams = teams.map((team) => {
    if (team.id !== teamId) {
      return team;
    }

    const members = team.members ?? [];

    return {
      ...team,
      members: members.filter(
        (memberIdFromTeam) => memberIdFromTeam !== memberId
      ),
    };
  });

  saveTeams(updatedTeams);
};


// Ticket

export const getTickets = (): Ticket[] => {
  const data = localStorage.getItem("tickets");

  if (!data) return [];

  return JSON.parse(data);
};

export const saveTickets = (tickets: Ticket[]) => {
  localStorage.setItem("tickets", JSON.stringify(tickets));
};

export const getTicket = (
  ticketId: string
): Ticket | undefined => {
  const tickets = getTickets();

  return tickets.find((ticket) => ticket.id === ticketId);
};

export const addTicket = (ticket: Ticket) => {
  const tickets = getTickets();

  tickets.push(ticket);

  saveTickets(tickets);
};

export const updateTicket = (
  ticketId: string,
  updates: Partial<Ticket>
) => {
  const tickets = getTickets();

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        ...updates,
        updatedAt: new Date(),
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

export const removeTicket = (ticketId: string) => {
  const tickets = getTickets();

  const updatedTickets = tickets.filter(
    (ticket) => ticket.id !== ticketId
  );

  saveTickets(updatedTickets);
};

// Activities

export const addTicketActivity = (
  ticketId: string,
  activity: TicketActivity
) => {
  const tickets = getTickets();

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        activities: [
          ...ticket.activities,
          activity,
        ],
        updatedAt: new Date(),
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

export const getTicketActivities = (
  ticketId: string
): TicketActivity[] => {
  const ticket = getTicket(ticketId);

  return ticket?.activities ?? [];
};

// Dispatch

export const dispatchTicket = (
  ticketId: string,
  targets: DispatchTarget[],
  dispatchedBy: string
) => {
  const tickets = getTickets();

  const ticket = tickets.find(
    (ticket) => ticket.id === ticketId
  );

  if (!ticket) return;

  const now = new Date();

  // Resolve selected teams into individual agents
  const teams = getTeams();

  const agentIds = new Set<string>();

  targets.forEach((target) => {
    if (target.type === "AGENT") {
      agentIds.add(target.agentId);
      return;
    }

    const team = teams.find(
      (team) => team.id === target.teamId
    );

    team?.members?.forEach((memberId) => {
      agentIds.add(memberId);
    });
  });

  const recipients: TicketRecipient[] = Array.from(
    agentIds
  ).map((agentId) => ({
    id: crypto.randomUUID(),
    agentId,
    receivedAt: now,
  }));

  const dispatch: TicketDispatch = {
    id: crypto.randomUUID(),
    targets,
    dispatchedBy,
    dispatchedAt: now,
    recipients,
  };

  const activity: TicketActivity = {
    id: crypto.randomUUID(),
    type: "DISPATCHED",
    performedBy: dispatchedBy,
    timestamp: now,
  };

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        status: "ASSIGNED" as TicketStatus,
        dispatches: [
          ...ticket.dispatches,
          dispatch,
        ],
        activities: [
          ...ticket.activities,
          activity,
        ],
        updatedAt: now,
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

// Forward

export const forwardTicket = (
  ticketId: string,
  targets: DispatchTarget[],
  forwardedBy: string,
  toTeamId?: string,
  toUserId?: string
) => {
  const tickets = getTickets();

  const ticket = tickets.find(
    (ticket) => ticket.id === ticketId
  );

  if (!ticket) return;

  const now = new Date();

  const teams = getTeams();

  const agentIds = new Set<string>();

  targets.forEach((target) => {
    if (target.type === "AGENT") {
      agentIds.add(target.agentId);
      return;
    }

    const team = teams.find(
      (team) => team.id === target.teamId
    );

    team?.members?.forEach((memberId) => {
      agentIds.add(memberId);
    });
  });

  const recipients: TicketRecipient[] =
    Array.from(agentIds).map((agentId) => ({
      id: crypto.randomUUID(),
      agentId,
      receivedAt: now,
    }));

  const dispatch: TicketDispatch = {
    id: crypto.randomUUID(),
    targets,
    dispatchedBy: forwardedBy,
    dispatchedAt: now,
    recipients,
  };

  const activity: TicketActivity = {
    id: crypto.randomUUID(),
    type: "FORWARDED",
    performedBy: forwardedBy,
    timestamp: now,

    fromLevel: ticket.level,
    toLevel: ticket.level,

    fromTeamId: ticket.assignedTeamId,
    toTeamId,

    fromUserId: ticket.assignedTo,
    toUserId,
  };

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        status: "FORWARDED" as TicketStatus,
        assignedTeamId: toTeamId,
        assignedTo: toUserId,

        dispatches: [
          ...ticket.dispatches,
          dispatch,
        ],

        activities: [
          ...ticket.activities,
          activity,
        ],

        updatedAt: now,
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

// Escalate

export const escalateTicket = (
  ticketId: string,
  toTeamId: string,
  toUserId: string | undefined,
  escalatedBy: string
) => {
  const tickets = getTickets();

  const ticket = tickets.find(
    (ticket) => ticket.id === ticketId
  );

  if (!ticket) return;

  const teams = getTeams();

  const targetTeam = teams.find(
    (team) => team.id === toTeamId
  );

  if (!targetTeam) return;

  const now = new Date();

  const targets: DispatchTarget[] = toUserId
    ? [
      {
        type: "AGENT",
        agentId: toUserId,
      },
    ]
    : [
      {
        type: "TEAM",
        teamId: toTeamId,
      },
    ];

  const recipients: TicketRecipient[] = targetTeam.members
    ?.filter((memberId) =>
      toUserId ? memberId === toUserId : true
    )
    .map((agentId) => ({
      id: crypto.randomUUID(),
      agentId,
      receivedAt: now,
    })) ?? [];

  const dispatch: TicketDispatch = {
    id: crypto.randomUUID(),
    targets,
    dispatchedBy: escalatedBy,
    dispatchedAt: now,
    recipients,
  };

  const activity: TicketActivity = {
    id: crypto.randomUUID(),
    type: "ESCALATED",
    performedBy: escalatedBy,
    timestamp: now,

    fromLevel: ticket.level,
    toLevel: targetTeam.level,

    fromTeamId: ticket.assignedTeamId,
    toTeamId,

    fromUserId: ticket.assignedTo,
    toUserId,
  };

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,

        status: "ESCALATED" as TicketStatus,
        level: targetTeam.level,

        assignedTeamId: toTeamId,
        assignedTo: toUserId,

        dispatches: [
          ...ticket.dispatches,
          dispatch,
        ],

        activities: [
          ...ticket.activities,
          activity,
        ],

        updatedAt: now,
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

// Start Ticket

export const startTicket = (
  ticketId: string,
  startedBy: string
) => {
  const tickets = getTickets();

  const ticket = tickets.find(
    (ticket) => ticket.id === ticketId
  );

  if (!ticket) return;

  const now = new Date();

  const activity: TicketActivity = {
    id: crypto.randomUUID(),
    type: "IN_PROGRESS",
    performedBy: startedBy,
    timestamp: now,
  };

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        status: "INPROCESS" as TicketStatus,
        activities: [
          ...ticket.activities,
          activity,
        ],
        updatedAt: now,
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

// Resolve Ticket

export const resolveTicket = (
  ticketId: string,
  resolvedBy: string
) => {
  const tickets = getTickets();

  const ticket = tickets.find(
    (ticket) => ticket.id === ticketId
  );

  if (!ticket) return;

  const now = new Date();

  const activity: TicketActivity = {
    id: crypto.randomUUID(),
    type: "RESOLVED",
    performedBy: resolvedBy,
    timestamp: now,
  };

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        status: "RESOLVED" as TicketStatus,
        resolvedAt: now,

        activities: [
          ...ticket.activities,
          activity,
        ],

        updatedAt: now,
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

// Reopen Ticket

export const reopenTicket = (
  ticketId: string,
  reopenedBy: string
) => {
  const tickets = getTickets();

  const ticket = tickets.find(
    (ticket) => ticket.id === ticketId
  );

  if (!ticket) return;

  const now = new Date();

  const activity: TicketActivity = {
    id: crypto.randomUUID(),
    type: "REOPENED",
    performedBy: reopenedBy,
    timestamp: now,
  };

  const updatedTickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
        ...ticket,
        status: "NEW" as TicketStatus,
        resolvedAt: undefined as unknown as Date,

        activities: [
          ...ticket.activities,
          activity,
        ],

        updatedAt: now,
      }
      : ticket
  );

  saveTickets(updatedTickets);
};

export const getMyTickets = (): Ticket[] => {
  const currentUser = getCurrentUser();

  if (!currentUser) return [];

  const tickets = getTickets();

  return tickets.filter(
    (ticket) =>
      ticket.createdBy === currentUser.id ||
      ticket.assignedTo === currentUser.id
  );
};
