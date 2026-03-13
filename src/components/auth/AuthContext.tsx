import { useCallback, useEffect, useMemo, useState } from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  me as meRequest,
  signup as signupRequest,
  type LoginPayload,
  type SignupPayload,
} from "@/api/auth/routes";
import { AuthContext } from "./context";
import type { AuthContextType } from "./context";
import type { AuthUser } from "@/api/auth/routes";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await meRequest();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        await refreshMe();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initAuth();

    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginRequest(payload);
    if (!data?.user) {
      throw new Error("login_failed");
    }
    setUser(data.user);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const data = await signupRequest(payload);
    if (!data?.user) {
      throw new Error("signup_failed");
    }
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, loading, login, signup, logout, refreshMe }),
    [user, loading, login, signup, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
