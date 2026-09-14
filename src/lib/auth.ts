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

export type RegisterInput = {
  username: string,
  password: string,
  fullName: string,
  email: string,
  phone: string,
}

export type RegisterResult =
  | { user: User; error?: undefined }
  | { user: null; error: string }

export const register = (input: RegisterInput): RegisterResult => {
  const username = input.username.trim();

  if (!username || !input.password) {
    return { user: null, error: "Username and password are required." };
  }

  const users = getUsers();

  const usernameTaken =
    username.toLowerCase() === admin.username.toLowerCase() ||
    users.some((user) => user.username.toLowerCase() === username.toLowerCase());

  if (usernameTaken) {
    return { user: null, error: "That username is already taken." };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    password: input.password,
    role: "customer",
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
  };

  addUser(newUser);
  setCurrentUser(newUser);

  return { user: newUser };
}
