import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, user, loading } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoggingIn(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      alert(err);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = (formData.get("username") as string).trim() || undefined;

    try {
      await signup({ email, password, username });
      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(error.response?.data?.error || "Signup failed");
      }
    }
  };

  const formBaseClass =
    "w-full max-w-md rounded bg-background/80 p-6 transition-opacity duration-300 flex flex-col h-full";

  return (
    <main className="h-auto bg-background flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className={formBaseClass}>
            <h2 className="text-xl font-semibold tracking-wide mb-4">login</h2>
            <div className="space-y-3 grow">
              <p className="py-2 text-foreground/80 text-sm rounded bg-secondary px-3 mb-2">
                Log in to unlock AI-powered features and save your results
              </p>
              <div>
                <label className="block text-sm text-foreground/70 mb-1">
                  email
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-3 py-2 bg-secondary/20 border-none rounded outline-none focus:ring-1 focus:ring-highlight"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/70 mb-1">
                  password
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full px-3 py-2 bg-secondary/20 border-none rounded outline-none focus:ring-1 focus:ring-highlight"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || loggingIn}
              className="w-full px-4 py-2 border border-highlight text-highlight rounded hover:bg-highlight/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loggingIn ? "logging in..." : "login"}
            </button>
          </form>

          {/* SIGNUP FORM */}
          <form onSubmit={handleSignup} className={formBaseClass}>
            <h2 className="text-xl font-semibold tracking-wide mb-4">
              sign up
            </h2>
            <div className="space-y-3 grow">
              <div>
                <label className="block text-sm text-foreground/70 mb-1">
                  username (optional)
                </label>
                <input
                  name="username"
                  type="text"
                  className="w-full px-3 py-2 bg-secondary/20 border-none rounded outline-none focus:ring-1 focus:ring-highlight"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/70 mb-1">
                  email
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-3 py-2 bg-secondary/20 border-none rounded outline-none focus:ring-1 focus:ring-highlight"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/70 mb-1">
                  password
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full px-3 py-2 bg-secondary/20 border-none rounded outline-none focus:ring-1 focus:ring-highlight"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-3 py-2 border border-highlight text-highlight rounded hover:bg-highlight/10 transition-colors"
            >
              create account
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
