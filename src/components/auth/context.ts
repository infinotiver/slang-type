import { createContext } from "react";
import type { AuthUser, LoginPayload, SignupPayload } from "@/api/auth/routes";

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
