import { cn } from '../../utils/cn.js';

export function GlowCard({ className, children, ...rest }) {
  return <section className={cn('glass-panel relative overflow-hidden rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]', className)} {...rest}>{children}</section>;
}
