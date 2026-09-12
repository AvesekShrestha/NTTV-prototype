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

