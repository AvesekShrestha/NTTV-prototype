import type { Category, CategoryStatus } from "@/types/category";
import type { Team } from "@/types/team";
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

export const removeUser = (userId: string) => {
  const users = getUsers()

  const updatedUsers = users.filter((user) => user.id != userId)
  saveUsers(updatedUsers);
}


// category 

export const getCategories = (): Category[] => {
  const data = localStorage.getItem("category");

  if (!data) return [];

  return JSON.parse(data);
}


export const saveCategories = (categories: Category[]) => {
  localStorage.setItem("category", JSON.stringify(categories));
}

export const addCategory = (category: Category) => {
  const categories = getCategories();
  categories.push(category)

  saveCategories(categories);
}

export const removeCategory = (categoryId: string) => {
  const categories = getCategories();
  const updatedCategories = categories.filter((category) => category.id !== categoryId);
  saveCategories(updatedCategories);
}

export const updateCategoryStatus = (
  categoryId: string,
  newStatus: CategoryStatus
) => {
  const categories = getCategories();
  const updated = categories.map((cat) =>
    cat.id === categoryId ? { ...cat, status: newStatus } : cat
  );
  localStorage.setItem('categories', JSON.stringify(updated));
};


// team 

export const getTeams = (): Team[] => {
  const data = localStorage.getItem("teams");
  if (!data) return []
  return JSON.parse(data);
}

export const saveTeams = (teams: Team[]) => {
  localStorage.setItem("teams", JSON.stringify(teams))
}

export const addTeam = (team: Team) => {
  const teams = getTeams();
  teams.push(team)

  saveTeams(teams);
}

export const removeTeam = (teamId: string) => {
  const teams = getTeams()
  const updatedTeams = teams.filter((team) => team.id !== teamId)

  saveTeams(updatedTeams)
}

export const assignMember = (teamId: string, memberId: string) => {
  const teams = getTeams();
  const updated = teams.map((t) => {
    if (t.id === teamId && !t.members.includes(memberId)) {
      return { ...t, members: [...t.members, memberId] };
    }
    return t;
  });
  saveTeams(updated);
};

export const unassignMember = (teamId: string, memberId: string) => {
  const teams = getTeams();
  const updated = teams.map((t) => {
    if (t.id === teamId) {
      return { ...t, members: t.members.filter((m) => m !== memberId) };
    }
    return t;
  });
  saveTeams(updated);
};
