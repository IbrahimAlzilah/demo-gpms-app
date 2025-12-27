import { create } from "zustand";
import type { User } from "../../../types/user.types";

interface AdminState {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
