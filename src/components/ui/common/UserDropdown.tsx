import { motion } from "framer-motion";
import { CircleUserIcon, Settings, LogOutIcon } from "lucide-react";
import { Trophy, LogIn, User } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DropdownButton from "./DropdownButton";
interface UserDropdownProps {
  user: { username?: string; email?: string } | null;
  highScore: number;
  onSettingsOpen: () => void;
}

export default function UserDropdown({
  user,
  highScore,
  onSettingsOpen,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Open on mouse enter, hide after delay on mouse leave
  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setOpen(true);
  };
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setOpen(false), 300);
    setHideTimeout(timeout);
  };
  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };
  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      tabIndex={0}
      aria-haspopup="true"
      aria-expanded={open}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="flex items-center gap-2 p-1.5 rounded-full bg-background text-foreground cursor-pointer"
        aria-label={user ? "open account menu" : "open login menu"}
      >
        <CircleUserIcon size={20} />
        <span className="text-sm font-semibold">
          {user ? (user.username ?? user.email) : "login"}
        </span>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute right-0 top-full z-50 mt-2 w-48 text-foreground flex flex-col items-stretch"
        >
          <div className="mb-3 w-full rounded-lg border border-secondary/40 bg-secondary px-4 py-2 flex items-center gap-2 text-sm font-mono text-foreground/80">
            <Trophy size={18} className="text-highlight shrink-0" />
            <span className="shrink-0">best:</span>
            <span className="text-highlight font-bold">{highScore}</span>
          </div>
          <div className="w-full rounded-lg border border-secondary/40 overflow-hidden divide-y divide-secondary/40 bg-transparent">
            <DropdownButton
              icon={user ? <User size={18} /> : <LogIn size={18} />}
              onClick={() => navigate(user ? "/profile" : "/login")}
              ariaLabel={user ? "view profile" : "sign in"}
            >
              {user ? "view profile" : "sign in"}
            </DropdownButton>
            <DropdownButton
              icon={<Settings size={18} />}
              onClick={onSettingsOpen}
              ariaLabel="settings"
            >
              settings
            </DropdownButton>
            {user && (
              <DropdownButton
                icon={<LogOutIcon size={18} />}
                onClick={handleLogout}
                ariaLabel="log out"
              >
                log out
              </DropdownButton>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
