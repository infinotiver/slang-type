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
  variant = "primary",
  className = "",
  disabled = false,
  children,
  onClick,
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "px-3 py-2 font-mono text-sm rounded-full transition-colors border";

  const variantStyles = {
    primary: "border-highlight text-background bg-highlight",
    secondary:
      "border-secondary text-foreground bg-secondary hover:text-highlight",
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
