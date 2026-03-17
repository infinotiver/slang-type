import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CircleUserIcon, Settings } from "lucide-react";
import { Trophy, LogIn, User } from "lucide-react";
import { useState, useRef } from "react";

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
          <div className="px-4 py-2 w-full flex items-center gap-2 text-sm font-mono rounded-[inherit]">
            <Trophy size={18} />
            <span>best:</span>
            <span className="text-highlight font-bold">{highScore}</span>
          </div>
          <Link
            to={user ? "/profile" : "/login"}
            className="px-4 py-2 w-full flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-highlight hover:bg-highlight/20 transition-colors rounded-[inherit]"
          >
            {user ? <User size={18} /> : <LogIn size={18} />}
            <span>{user ? "view profile" : "sign in"}</span>
          </Link>
          <button
            onClick={onSettingsOpen}
            className="px-4 py-2 w-full flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-highlight hover:bg-highlight/20 transition-colors border-none bg-transparent rounded-[inherit]"
            aria-label="settings"
            title="settings"
          >
            <Settings size={18} />
            <span>settings</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
