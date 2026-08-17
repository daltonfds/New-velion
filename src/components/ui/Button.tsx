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
  ...props 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    outline: "bg-white text-dark border border-border hover:bg-secondary",
    ghost: "bg-transparent text-muted hover:text-dark hover:bg-secondary/50",
  };
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
