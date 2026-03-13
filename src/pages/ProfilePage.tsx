import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="h-full w-full flex items-center justify-center py-4">
      <div className="w-full max-w-md rounded border border-secondary p-6 bg-background/70 space-y-6">
        <h1 className="text-2xl font-bold text-highlight lowercase">profile</h1>

        <div className="space-y-2 text-sm font-mono">
          {user?.username ? (
            <div className="flex gap-3">
              <span className="text-foreground/50 w-20">username</span>
              <span className="text-foreground">{user.username}</span>
            </div>
          ) : null}
          <div className="flex gap-3">
            <span className="text-foreground/50 w-20">email</span>
            <span className="text-foreground">{user?.email}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 border border-secondary text-foreground/70 rounded hover:border-highlight/50 hover:text-highlight transition-colors text-sm"
        >
          log out
        </button>
      </div>
    </main>
  );
}
