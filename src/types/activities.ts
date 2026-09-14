import type { TeamLevel } from "./team";

export type TicketActivityType =
  | "CREATED"
  | "DISPATCHED"
  | "FORWARDED"
  | "ESCALATED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REOPENED";

export type TicketActivity = {
  id: string;
  type: TicketActivityType;
  performedBy: string;
  timestamp: Date;

  // Useful when an activity moves the ticket
  fromLevel?: TeamLevel;
  toLevel?: TeamLevel;

  fromTeamId?: string;
  toTeamId?: string;

  fromUserId?: string;
  toUserId?: string;

  // Optional additional information
  note?: string;
};
