import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch {
      setError("Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="h-full w-full flex items-center justify-center py-4">
      <div className="w-full max-w-md rounded border border-secondary p-6 bg-background/70">
        <h1 className="text-2xl font-bold text-highlight mb-6 lowercase">
          login
        </h1>
        <div className="py-4 text-sm text-foreground">
          <p>login to access ai features and to save your history</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground/70 mb-1">
              email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 bg-secondary/20 border border-secondary rounded outline-none focus:border-highlight"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-foreground/70 mb-1">
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 bg-secondary/20 border border-secondary rounded outline-none focus:border-highlight"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 border border-highlight text-highlight rounded hover:bg-highlight/10 transition-colors disabled:opacity-50"
          >
            {submitting ? "logging in..." : "login"}
          </button>
        </form>

        <p className="text-sm text-foreground/70 mt-4">
          no account?{" "}
          <Link to="/signup" className="text-highlight hover:underline">
            sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
