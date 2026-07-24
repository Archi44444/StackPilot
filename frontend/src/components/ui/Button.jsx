import { cn } from '../../utils/cn.js';

const variants = {
  primary: 'bg-brand-gradient text-white shadow-glow-sm hover:brightness-110',
  secondary: 'border border-white/10 bg-elevated text-text-primary hover:border-brand/50 hover:bg-white/[0.07]',
  ghost: 'text-text-secondary hover:bg-white/[0.06] hover:text-text-primary',
  danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25',
  icon: 'text-text-secondary hover:bg-white/[0.06] hover:text-text-primary',
};

export function Button({ className, variant = 'primary', size = 'md', type = 'button', children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-11 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        variant === 'icon' && 'h-10 w-10 p-0',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
