export type UserRole = "admin" | "staff" | "dispatcher" | "agent"
export type AgentLevel = "L1" | "L2" | "L3"

export type User = {
  id: string,
  username: string,
  password: string,
  level?: AgentLevel,
  role: UserRole,
  team?: string
}
