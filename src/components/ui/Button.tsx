import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
}

export default function Button({ children, variant = "primary", className = "", onClick }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-200 text-sm";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    outline: "bg-white text-dark border border-border hover:bg-secondary",
    ghost: "bg-transparent text-muted hover:text-dark hover:bg-secondary/50",
  };
  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
