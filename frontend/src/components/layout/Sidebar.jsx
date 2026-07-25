import { BookOpen, ChevronLeft, FileText, Github, LayoutDashboard, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Settings, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Logo } from './Logo.jsx';
import { Button } from '../ui/Button.jsx';
import { useConversations } from '../../hooks/useConversations.js';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/chat', label: 'New chat', icon: MessageSquarePlus },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/knowledge', label: 'Import knowledge', icon: Github },
  { to: '/prompts', label: 'Prompt library', icon: BookOpen },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  const { conversations, loading } = useConversations();
  return (
    <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-white/[0.07] bg-elevated/90 p-3 backdrop-blur-xl transition-transform lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full', collapsed && 'lg:w-[84px]')}>
      <div className="mb-6 flex h-10 items-center justify-between px-1">
        <Logo compact={collapsed} />
        <Button variant="icon" className="lg:hidden" onClick={onClose} aria-label="Close navigation"><ChevronLeft size={18} /></Button>
        <Button variant="icon" className="hidden lg:inline-flex" onClick={onToggle} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</Button>
      </div>

      <nav className="space-y-1" aria-label="Application">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => cn('flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition hover:bg-white/[0.06] hover:text-text-primary', isActive && 'bg-brand/15 text-text-primary ring-1 ring-brand/25', collapsed && 'lg:justify-center lg:px-0')}>
            <Icon size={18} strokeWidth={1.9} />
            <span className={cn(collapsed && 'lg:hidden')}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {!collapsed && <section className="mt-7 hidden lg:block"><p className="px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Recent chats</p><div className="mt-2 space-y-1">{loading && <p className="px-3 py-2 text-xs text-text-muted">Loading history…</p>}{!loading && conversations.length === 0 && <p className="px-3 py-2 text-xs text-text-muted">No conversations yet.</p>}{conversations.slice(0, 5).map((conversation) => <NavLink key={conversation.id} to={`/chat/${conversation.id}`} onClick={onClose} className={({ isActive }) => cn('block truncate rounded-lg px-3 py-2 text-xs text-text-secondary transition hover:bg-white/[0.06] hover:text-text-primary', isActive && 'bg-brand/15 text-text-primary')}>{conversation.title || 'Untitled conversation'}</NavLink>)}</div></section>}

      {!collapsed && <div className="mt-8 hidden rounded-xl border border-brand/15 bg-brand/[0.07] p-3 lg:block"><div className="flex items-center gap-2 text-sm font-medium text-text-primary"><Sparkles size={15} className="text-accent-cyan" />AI-ready workspace</div><p className="mt-1 text-xs leading-5 text-text-secondary">Connect your account in the next phase to start a secure session.</p></div>}

      <NavLink to="/settings" onClick={onClose} className={({ isActive }) => cn('mt-auto flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition hover:bg-white/[0.06] hover:text-text-primary', isActive && 'bg-brand/15 text-text-primary', collapsed && 'lg:justify-center lg:px-0')}><Settings size={18} /><span className={cn(collapsed && 'lg:hidden')}>Settings</span></NavLink>
    </aside>
  );
}
