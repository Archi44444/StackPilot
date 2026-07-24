import { useEffect, useState } from 'react';
import { Check, ChevronRight, LoaderCircle, Moon, Shield, SlidersHorizontal, Sun } from 'lucide-react';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { getSettings, updateSettings } from '../services/settingsService.js';
import { useAuth } from '../hooks/useAuth.js';

const modelOptions = [
  { value: 'gemini-flash-latest', label: 'Gemini Flash' },
  { value: 'gemini-pro-latest', label: 'Gemini Pro' },
  { value: 'openrouter/free', label: 'OpenRouter (free)' },
];

export function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ theme: 'dark', model: 'gemini-flash-latest', temperature: 0.3 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    getSettings()
      .then((data) => setSettings(data))
      .catch(() => { /* use defaults */ })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (partial) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    if (partial.theme) document.documentElement.dataset.theme = partial.theme;
    setSaving(true);
    try {
      await updateSettings(partial);
      setSuccessMsg('Saved');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {
      setSuccessMsg('Failed to save');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <p className="text-sm text-text-secondary">Workspace configuration</p>
        <h1 className="page-title mt-1">Settings</h1>
        <p className="mt-8 text-center text-sm text-text-muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Workspace configuration</p>
          <h1 className="page-title mt-1">Settings</h1>
        </div>
        {successMsg && (
          <span className="rounded-full bg-accent-emerald/15 px-3 py-1 text-xs font-medium text-accent-emerald">
            {successMsg}
          </span>
        )}
      </div>

      <div className="mt-7 max-w-3xl space-y-3">
        {/* Appearance */}
        <GlowCard
          className="cursor-pointer p-0"
          onClick={() => setActiveSection(activeSection === 'appearance' ? null : 'appearance')}
        >
          <div className="flex items-center gap-4 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-text-secondary">
              <Moon size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium">Appearance</h2>
              <p className="mt-1 text-sm text-text-secondary">Choose between dark and light theme.</p>
            </div>
            <ChevronRight
              size={18}
              className={`text-text-muted transition-transform ${activeSection === 'appearance' ? 'rotate-90' : ''}`}
            />
          </div>
          {activeSection === 'appearance' && (
            <div className="border-t border-white/[0.07] px-4 pb-5 pt-4">
              <div className="flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave({ theme: 'dark' }); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm transition ${
                    settings.theme === 'dark'
                      ? 'border-brand/50 bg-brand/15 text-brand-light'
                      : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:border-white/20'
                  }`}
                >
                  <Moon size={16} />
                  Dark
                  {settings.theme === 'dark' && <Check size={14} className="text-brand-light" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave({ theme: 'light' }); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm transition ${
                    settings.theme === 'light'
                      ? 'border-brand/50 bg-brand/15 text-brand-light'
                      : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:border-white/20'
                  }`}
                >
                  <Sun size={16} />
                  Light
                  {settings.theme === 'light' && <Check size={14} className="text-brand-light" />}
                </button>
              </div>
            </div>
          )}
        </GlowCard>

        {/* AI preferences */}
        <GlowCard
          className="cursor-pointer p-0"
          onClick={() => setActiveSection(activeSection === 'ai' ? null : 'ai')}
        >
          <div className="flex items-center gap-4 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-text-secondary">
              <SlidersHorizontal size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium">AI preferences</h2>
              <p className="mt-1 text-sm text-text-secondary">Model and temperature controls.</p>
            </div>
            <ChevronRight
              size={18}
              className={`text-text-muted transition-transform ${activeSection === 'ai' ? 'rotate-90' : ''}`}
            />
          </div>
          {activeSection === 'ai' && (
            <div className="border-t border-white/[0.07] px-4 pb-5 pt-4">
              <div className="space-y-4">
                {/* Model selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Model</label>
                  <div className="flex flex-wrap gap-2">
                    {modelOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={(e) => { e.stopPropagation(); handleSave({ model: opt.value }); }}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                          settings.model === opt.value
                            ? 'border-brand/50 bg-brand/15 text-brand-light'
                            : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Temperature slider */}
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
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings((prev) => ({ ...prev, temperature: val }));
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      handleSave({ temperature: settings.temperature });
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleSave({ temperature: settings.temperature });
                    }}
                    className="w-full accent-brand-light"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlowCard>

        {/* Account & privacy */}
        <GlowCard
          className="cursor-pointer p-0"
          onClick={() => setActiveSection(activeSection === 'account' ? null : 'account')}
        >
          <div className="flex items-center gap-4 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-text-secondary">
              <Shield size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium">Account & privacy</h2>
              <p className="mt-1 text-sm text-text-secondary">Manage your account and data.</p>
            </div>
            <ChevronRight
              size={18}
              className={`text-text-muted transition-transform ${activeSection === 'account' ? 'rotate-90' : ''}`}
            />
          </div>
          {activeSection === 'account' && (
            <div className="border-t border-white/[0.07] px-4 pb-5 pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2.5">
                  <span className="text-sm text-text-secondary">Email</span>
                  <span className="text-sm text-text-primary">{user?.email ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2.5">
                  <span className="text-sm text-text-secondary">Display name</span>
                  <span className="text-sm text-text-primary">{user?.displayName ?? '—'}</span>
                </div>
                <p className="text-xs text-text-muted">
                  Account management features will be expanded in a future update.
                </p>
              </div>
            </div>
          )}
        </GlowCard>
      </div>

      {saving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-brand/20 px-4 py-2 text-sm text-brand-light shadow-glow-sm backdrop-blur-xl">
          <LoaderCircle size={16} className="animate-spin" />
          Saving…
        </div>
      )}
    </div>
  );
}
