import { cn } from '../../utils/cn.js';

export function GradientText({ className, children }) {
  return <span className={cn('bg-brand-gradient bg-clip-text text-transparent', className)}>{children}</span>;
}
