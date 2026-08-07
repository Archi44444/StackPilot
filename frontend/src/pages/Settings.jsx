import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, LoaderCircle, Moon, Shield, Sparkles, SlidersHorizontal, Sun, Trash2, Download, Server, User, Database, LogOut } from 'lucide-react';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { api } from '../services/api.js';
import { getSettings, updateSettings } from '../services/settingsService.js';
import { clearConversationHistory } from '../services/chatService.js';
import { deleteDocumentation, deleteRepository, listDocumentation, listRepositories, getDashboard } from '../services/knowledgeService.js';
import { deleteAccount } from '../services/authService.js';
import { useAuth } from '../hooks/useAuth.js';
import { signOutUser } from '../firebase/auth.js';

const modelOptions = [
  { value: 'gemini-flash-latest', label: 'Gemini Flash' },
  { value: 'gemini-pro-latest', label: 'Gemini Pro' },
  { value: 'openrouter/free', label: 'OpenRouter (free)' },
];

function SectionCard({ icon: Icon, title, description, active, onToggle, children }) {
  return (
    <GlowCard className="cursor-pointer p-0" onClick={onToggle}>
      <div className="flex items-center gap-4 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-text-secondary">
          <Icon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-medium">{title}</h2>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        <ChevronRight size={18} className={`text-text-muted transition-transform ${active ? 'rotate-90' : ''}`} />
      </div>
      {active && <div className="border-t border-white/[0.07] px-4 pb-5 pt-4" onClick={(e) => e.stopPropagation()}>{children}</div>}
    </GlowCard>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-surface/50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-primary">{value}</p>
    </div>
  );
}

export function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ theme: 'dark', model: 'gemini-flash-latest', temperature: 0.3 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [apiStatus, setApiStatus] = useState({ state: 'checking', text: 'Checking...' });
  const [stats, setStats] = useState({ repositories: 0, documentation: 0, documents: 0, prompts: 0, conversations: 0 });
  const [runningAction, setRunningAction] = useState('');

  const apiHealthUrl = useMemo(() => `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000/api/v1'}`.replace(/\/api\/v1\/?$/, '/health'), []);

  useEffect(() => {
    if (!user) return;
    Promise.all([getSettings(), getDashboard()])
      .then(([data, dashboard]) => {
        setSettings(data);
        setStats(dashboard);
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    let active = true;
    fetch(apiHealthUrl)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('unhealthy')))
      .then(() => { if (active) setApiStatus({ state: 'online', text: 'Online' }); })
      .catch(() => { if (active) setApiStatus({ state: 'offline', text: 'Offline' }); });
    return () => { active = false; };
  }, [apiHealthUrl]);

  const showSuccess = (message) => {
    setSuccessMsg(message);
    window.setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleSave = async (partial) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    if (partial.theme) document.documentElement.dataset.theme = partial.theme;
    setSaving(true);
    try {
      await updateSettings(partial);
      showSuccess('Saved');
    } catch {
      showSuccess('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const refreshStats = async () => {
    const dashboard = await getDashboard();
    setStats(dashboard);
  };

  const withAction = async (name, action) => {
    const confirmed = window.confirm(`Are you sure you want to ${name}?`);
    if (!confirmed) return;
    setRunningAction(name);
    try {
      await action();
      await refreshStats();
      showSuccess('Completed');
    } finally {
      setRunningAction('');
    }
  };

  const exportConversations = async () => {
    setRunningAction('export');
    try {
      const data = await api.get('/chat/history').then((response) => response.data);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'stackpilot-conversations.json';
      anchor.click();
      URL.revokeObjectURL(url);
      showSuccess('Export started');
    } finally {
      setRunningAction('');
    }
  };

  if (loading) {
    return (
      <div>
        <p className="text-sm text-text-secondary">Workspace configuration</p>
        <h1 className="page-title mt-1">Settings</h1>
        <p className="mt-8 text-center text-sm text-text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">Workspace configuration</p>
          <h1 className="page-title mt-1">Settings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${apiStatus.state === 'online' ? 'bg-accent-emerald/15 text-accent-emerald' : 'bg-red-500/15 text-red-300'}`}>
            API {apiStatus.text}
          </span>
          {successMsg && <span className="rounded-full bg-accent-emerald/15 px-3 py-1 text-xs font-medium text-accent-emerald">{successMsg}</span>}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatChip label="Repositories" value={stats.repositories ?? 0} />
        <StatChip label="Docs" value={stats.documentation ?? 0} />
        <StatChip label="Uploads" value={stats.documents ?? 0} />
        <StatChip label="Prompts" value={stats.prompts ?? 0} />
        <StatChip label="Chats" value={stats.conversations ?? 0} />
      </div>

      <div className="mt-7 max-w-3xl space-y-3">
        <SectionCard
          icon={User}
          title="Profile"
          description="Review the signed-in account and identity details."
          active={activeSection === 'profile'}
          onToggle={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <StatChip label="Email" value={user?.email ?? '—'} />
            <StatChip label="Display name" value={user?.displayName ?? '—'} />
          </div>
        </SectionCard>

        <SectionCard
          icon={Moon}
          title="Theme"
          description="Choose between light and dark appearance."
          active={activeSection === 'appearance'}
          onToggle={() => setActiveSection(activeSection === 'appearance' ? null : 'appearance')}
        >
          <div className="flex gap-3">
            <button onClick={() => handleSave({ theme: 'dark' })} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm transition ${settings.theme === 'dark' ? 'border-brand/50 bg-brand/15 text-brand-light' : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:border-white/20'}`}>
              <Moon size={16} />
              Dark
              {settings.theme === 'dark' && <Check size={14} className="text-brand-light" />}
            </button>
            <button onClick={() => handleSave({ theme: 'light' })} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm transition ${settings.theme === 'light' ? 'border-brand/50 bg-brand/15 text-brand-light' : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:border-white/20'}`}>
              <Sun size={16} />
              Light
              {settings.theme === 'light' && <Check size={14} className="text-brand-light" />}
            </button>
          </div>
        </SectionCard>

        <SectionCard
          icon={SlidersHorizontal}
          title="AI preferences"
          description="Model and temperature controls."
          active={activeSection === 'ai'}
          onToggle={() => setActiveSection(activeSection === 'ai' ? null : 'ai')}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Model</label>
              <div className="flex flex-wrap gap-2">
                {modelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSave({ model: opt.value })}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${settings.model === opt.value ? 'border-brand/50 bg-brand/15 text-brand-light' : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:border-white/20'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Temperature: <span className="text-text-primary">{settings.temperature.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))}
                onMouseUp={() => handleSave({ temperature: settings.temperature })}
                onTouchEnd={() => handleSave({ temperature: settings.temperature })}
                className="w-full accent-brand-light"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Server}
          title="System"
          description="Check API health and workspace status."
          active={activeSection === 'system'}
          onToggle={() => setActiveSection(activeSection === 'system' ? null : 'system')}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <StatChip label="API health" value={apiStatus.text} />
            <StatChip label="Theme value" value={settings.theme} />
          </div>
        </SectionCard>

        <SectionCard
          icon={Database}
          title="Data controls"
          description="Export or remove chat and knowledge data."
          active={activeSection === 'data'}
          onToggle={() => setActiveSection(activeSection === 'data' ? null : 'data')}
        >
          <div className="grid gap-3">
            <button className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-surface/60 px-4 py-3 text-left text-sm" onClick={(e) => { e.stopPropagation(); exportConversations(); }} disabled={runningAction === 'export'}>
              <span className="flex items-center gap-2"><Download size={16} /> Export conversations</span>
              {runningAction === 'export' && <LoaderCircle size={16} className="animate-spin" />}
            </button>
            <button className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-surface/60 px-4 py-3 text-left text-sm" onClick={(e) => { e.stopPropagation(); withAction('clear all conversations', clearConversationHistory); }} disabled={runningAction === 'clear all conversations'}>
              <span className="flex items-center gap-2"><Trash2 size={16} /> Clear conversations</span>
              {runningAction === 'clear all conversations' && <LoaderCircle size={16} className="animate-spin" />}
            </button>
            <button className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-surface/60 px-4 py-3 text-left text-sm" onClick={async (e) => { e.stopPropagation(); const repos = await listRepositories(); const docs = await listDocumentation(); if (!window.confirm('Delete the entire knowledge base?')) return; setRunningAction('knowledge'); try { await Promise.all([Promise.all(repos.map((item) => deleteRepository(item.id))), Promise.all(docs.map((item) => deleteDocumentation(item.id)))]); await refreshStats(); showSuccess('Knowledge base deleted'); } finally { setRunningAction(''); } }} disabled={runningAction === 'knowledge'}>
              <span className="flex items-center gap-2"><Trash2 size={16} /> Delete knowledge base</span>
              {runningAction === 'knowledge' && <LoaderCircle size={16} className="animate-spin" />}
            </button>
          </div>
        </SectionCard>

        <SectionCard
          icon={Shield}
          title="Account & privacy"
          description="Sign out or delete your account."
          active={activeSection === 'account'}
          onToggle={() => setActiveSection(activeSection === 'account' ? null : 'account')}
        >
          <div className="space-y-3">
            <div className="rounded-lg bg-surface/60 px-3 py-2.5">
              <span className="text-sm text-text-secondary">Email: </span>
              <span className="text-sm text-text-primary">{user?.email ?? '—'}</span>
            </div>
            <div className="rounded-lg bg-surface/60 px-3 py-2.5">
              <span className="text-sm text-text-secondary">UID: </span>
              <span className="text-sm text-text-primary break-all">{user?.uid ?? '—'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-surface/60 px-4 text-sm" onClick={async (e) => { e.stopPropagation(); await signOutUser(); }}>
                <LogOut size={16} />
                Sign out
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm text-red-200" onClick={(e) => { e.stopPropagation(); withAction('delete your account', deleteAccount); }}>
                <Trash2 size={16} />
                Delete account
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      {saving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-brand/20 px-4 py-2 text-sm text-brand-light shadow-glow-sm backdrop-blur-xl">
          <LoaderCircle size={16} className="animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
