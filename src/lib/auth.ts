import type { User } from "@/types/user";
import { addUser, getUsers, removeCurrentUser, setCurrentUser } from "./storage";

const admin: User = {
  id: "admin-001",
  username: "admin",
  password: "admin123",
  role: "admin"
}


export const login = (username: string, password: string): User | null => {
  const users = getUsers()

  const existingUser = users.find((user) => user.username == username && user.password == password);
  if (existingUser) {
    setCurrentUser(existingUser);
    return existingUser;
  }

  if (username == admin.username && password == admin.password) {
    addUser(admin);
    setCurrentUser(admin);
    return admin;
  }

  return null;
}

export const logout = () => {

  removeCurrentUser();
}


