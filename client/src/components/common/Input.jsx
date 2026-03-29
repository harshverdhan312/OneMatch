import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ label, error, variant = 'default', className, ...props }) => {
  const variantStyles = {
    default: "bg-bg-surface border-transparent text-text-primary placeholder:text-text-muted focus:border-primary/30",
    glass: "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 backdrop-blur-sm"
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className={twMerge(
          "text-sm font-medium ml-1 transition-colors",
          variant === 'glass' ? "text-white/50" : "text-text-secondary"
        )}>
          {label}
        </label>
      )}
      <input
        className={twMerge(
          "w-full border rounded-lg px-4 py-3 transition-all focus:outline-none h-[52px]",
          variantStyles[variant],
          error && "border-accent/50 focus:border-accent",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-accent mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
};

export default Input;


