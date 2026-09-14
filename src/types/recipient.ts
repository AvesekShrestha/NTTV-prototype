export type TicketRecipient = {
  id: string;
  agentId: string;
  receivedAt: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
};
