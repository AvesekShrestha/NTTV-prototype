import type { TicketRecipient } from "./recipient";

export type DispatchTarget =
  | {
    type: "TEAM";
    teamId: string;
  }
  | {
    type: "AGENT";
    agentId: string;
  };

export type TicketDispatch = {
  id: string;

  targets: DispatchTarget[];

  dispatchedBy: string;
  dispatchedAt: Date;

  recipients: TicketRecipient[];
};
