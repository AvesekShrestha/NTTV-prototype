import type { TicketActivity } from "./activities"
import type { TicketDispatch } from "./dispatch"
import type { TeamLevel } from "./team"

export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
export type TicketStatus = "INPROCESS" | "NEW" | "ASSIGNED" | "FORWARDED" | "ESCALATED" | "RESOLVED"

export type Ticket = {
  id: string,
  title: string,
  description: string,
  priority: TicketPriority,
  status: TicketStatus,
  category: string,

  createdBy: string
  level?: TeamLevel,
  assignedTeamId?: string,
  assignedTo?: string,

  activities: TicketActivity[],
  dispatches: TicketDispatch[];

  createdAt: Date,
  updatedAt: Date,
  resolvedAt?: Date
}
