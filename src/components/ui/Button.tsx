import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}

export default function Button({ 
  children, 
  variant = "primary", 
  className = "", 
  disabled = false,
  ...props 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-200 text-sm";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    outline: "bg-white text-dark border border-light-border hover:bg-secondary",
    ghost: "bg-transparent text-light-muted hover:text-light-text hover:bg-secondary/50",
  };
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
