export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export type Ticket = {
  id: string,
  title: string,
  description: string,
  priority: TicketPriority,
  assignedTo?: string[],
  createdAt: Date,
}
