import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = 'primary', className, isLoading, ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold font-body transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed text-center h-[52px] flex items-center justify-center relative overflow-hidden';
  
  const variants = {
    primary: 'bg-violet-rose text-white hover:opacity-90',
    secondary: 'bg-primary-light text-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface',
    outline: 'bg-transparent text-accent border border-accent hover:bg-accent/5',
    accent: 'bg-accent text-white hover:opacity-90',
    glass: 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20',
    gradient: 'bg-violet-rose text-white shadow-lg hover:shadow-primary/20',
  };

  return (
    <button 
      className={twMerge(baseStyles, variants[variant], className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Please wait...</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;


