export type TeamLevel = "L1" | "L2" | "L3";

export type Team = {
  id: string,
  name: string,
  members?: string[]
  categoryId: string
  level: TeamLevel
}
