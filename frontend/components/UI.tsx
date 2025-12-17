import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-display font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-blytz-neon text-black hover:bg-white hover:shadow-[0_0_20px_rgba(190,242,100,0.5)] border-2 border-transparent",
    secondary: "bg-blytz-dark text-white border-2 border-blytz-dark hover:border-blytz-neon hover:text-blytz-neon",
    outline: "bg-transparent text-blytz-neon border-2 border-blytz-neon hover:bg-blytz-neon hover:text-black",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'hot' | 'flash' | 'new' }> = ({ children, variant = 'new' }) => {
  const styles = {
    hot: "bg-orange-500 text-white",
    flash: "bg-blytz-neon text-black animate-pulse",
    new: "bg-blytz-accent text-white"
  };

  return (
    <span className={`${styles[variant]} px-2 py-1 text-[10px] font-bold uppercase tracking-widest skew-x-[-10deg]`}>
      {children}
    </span>
  );
};
