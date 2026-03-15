import type { AuthUser } from "@/api/auth/routes";

interface ProfileAccountCardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function ProfileAccountCard({
  user,
  onLogout,
}: ProfileAccountCardProps) {
  return (
    <div className="flex items-center justify-between border border-secondary/30 rounded-lg px-4 py-3 bg-secondary/5">
      <div className="text-sm font-mono space-y-0.5">
        {user.username ? (
          <div className="text-foreground/80">{user.username}</div>
        ) : null}
        <div className="text-foreground/50 text-xs">{user.email}</div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="text-xs px-3 py-1.5 border border-secondary rounded hover:border-highlight/50 hover:text-highlight transition-colors text-foreground/60"
      >
        log out
      </button>
    </div>
  );
}
