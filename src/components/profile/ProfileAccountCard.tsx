import type { AuthUser } from "@/api/auth/routes";
import { UserIcon } from "lucide-react";
interface ProfileAccountCardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function ProfileAccountCard({
  user,
  onLogout,
}: ProfileAccountCardProps) {
  return (
    <div className="flex items-center justify-between border border-secondary rounded-lg px-4 py-4 bg-secondary/5">
      <div className="text-sm font-mono flex flex-col space-y-0.5">
        <div className="flex space-x-0.5 items-center">
          <UserIcon />
          {user.username ? (
            <div className="text-foreground/80">{user.username}</div>
          ) : null}
        </div>
        <div className="text-foreground/60 text-xs">{user.email}</div>
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
