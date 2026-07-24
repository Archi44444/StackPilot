import { useState } from 'react';
import { LogOut, Menu, Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { cn } from '../utils/cn.js';
import { useAuth } from '../hooks/useAuth.js';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-base text-text-primary">
      {mobileOpen && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn('min-h-screen transition-[margin] duration-300', collapsed ? 'lg:ml-[84px]' : 'lg:ml-[272px]')}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.07] bg-base/75 px-4 backdrop-blur-xl sm:px-7">
          <Button variant="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></Button>
          <div className="hidden text-sm text-text-secondary sm:block">Focused tools for better software.</div>
          <div className="flex items-center gap-2"><div className="hidden text-right sm:block"><p className="max-w-40 truncate text-xs font-medium text-text-primary">{user?.displayName ?? 'Developer'}</p><p className="max-w-40 truncate text-xs text-text-muted">{user?.email}</p></div><Button variant="icon" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></Button><Link to="/chat"><Button size="sm"><Plus size={16} />New chat</Button></Link></div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-7"><Outlet /></main>
      </div>
    </div>
  );
}
