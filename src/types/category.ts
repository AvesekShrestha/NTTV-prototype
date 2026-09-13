export type CategoryStatus = "active" | "inactive"

export type Category = {
  id: string,
  name: string,
  description: string,
  status: CategoryStatus
}
