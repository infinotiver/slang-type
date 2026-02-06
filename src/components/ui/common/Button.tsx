import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export default function Button({
  variant = "secondary",
  className = "",
  disabled = false,
  ...props
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
    <button className={finalClassName} disabled={disabled} {...props}>
      {props.children}
    </button>
  );
}
