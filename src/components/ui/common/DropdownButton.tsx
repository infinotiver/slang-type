import { ReactNode } from "react";
import Button from "./Button";

interface DropdownButtonProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export default function DropdownButton({
  icon,
  children,
  onClick,
  ariaLabel,
  className = "",
}: DropdownButtonProps) {
  return (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-full flex items-center gap-2 text-sm py-2 font-semibold text-foreground/80 hover:text-highlight hover:bg-highlight/20 transition-colors border-none bg-transparent rounded-[inherit] ${className}`}
    >
      {icon}
      <span>{children}</span>
    </Button>
  );
}
