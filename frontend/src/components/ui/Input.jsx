import { cn } from '../../utils/cn.js';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn('h-11 w-full rounded-xl border border-white/10 bg-base/60 px-3 text-sm text-text-primary placeholder:text-text-muted transition focus:border-brand/70 focus:outline-none', className)}
      {...props}
    />
  );
}
