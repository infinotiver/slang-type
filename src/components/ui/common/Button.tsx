import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  variant = "secondary",
  className = "",
  disabled = false,
  children,
  onClick,
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "px-2 py-1 font-mono text-sm rounded transition-colors border";

  const variantStyles = {
    primary:
      "border-highlight text-highlight bg-secondary hover:bg-highlight/20 hover:text-highlight",
    secondary:
      "border-secondary text-foreground bg-secondary hover:border-highlight/10 hover:text-highlight",
  };

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;

  return (
    <motion.button
      className={finalClassName}
      disabled={disabled}
      onClick={onClick}
      type={type}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
