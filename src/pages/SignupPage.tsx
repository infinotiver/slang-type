import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isAxiosError } from "axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      await signup({
        email,
        password,
        username: username.trim() ? username.trim() : undefined,
      });
      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.error;
        setError(typeof message === "string" ? message : "Signup failed.");
      } else {
        setError("Signup failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="h-full w-full flex items-center justify-center py-4">
      <div className="w-full max-w-md rounded border border-secondary p-6 bg-background/70">
        <h1 className="text-2xl font-bold text-highlight mb-6 lowercase">
          sign up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground mb-1">
              username (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full px-3 py-2 bg-secondary/20 border border-secondary rounded outline-none focus:border-highlight"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1">email</label>
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
            <label className="block text-sm text-foreground mb-1">
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 bg-secondary/20 border border-secondary rounded outline-none focus:border-highlight"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 border border-highlight text-highlight rounded hover:bg-highlight/10 transition-colors disabled:opacity-50"
          >
            {submitting ? "creating account..." : "create account"}
          </button>
        </form>

        <p className="text-sm text-foreground mt-4">
          already have an account?{" "}
          <Link to="/login" className="text-highlight hover:underline">
            login
          </Link>
        </p>
      </div>
    </main>
  );
}
