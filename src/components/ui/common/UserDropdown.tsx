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
          className="absolute right-0 top-full z-50 mt-2 w-48 bg-secondary/50 rounded-lg text-foreground flex flex-col divide-y divide-secondary items-start"
        >
          <div className="px-4 py-2 w-full flex items-center gap-2 text-sm  font-mono rounded-[inherit]">
            <Trophy size={18} />
            <span>best:</span>
            <span className="text-highlight font-bold">{highScore}</span>
          </div>
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
        </motion.div>
      )}
    </div>
  );
}
