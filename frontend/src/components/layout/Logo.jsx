import { Braces } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 text-text-primary" aria-label="StackPilot home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-glow-sm"><Braces size={19} strokeWidth={2.4} /></span>
      {!compact && <span className="text-sm font-semibold tracking-tight">StackPilot</span>}
    </Link>
  );
}
