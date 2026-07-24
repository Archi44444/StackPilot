import { BookmarkPlus, Pencil, Save, Sparkles, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { Input } from '../components/ui/Input.jsx';
import { usePrompts } from '../hooks/usePrompts.js';

const emptyDraft = { title: '', category: 'general', content: '' };
const errorMessage = (error) => error?.response?.data?.error?.message ?? 'Unable to save this prompt. Please try again.';

export function Prompts() {
  const { prompts, loading, error, createPrompt, updatePrompt, deletePrompt } = usePrompts();
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const update = (event) => setDraft((current) => ({ ...current, [event.target.name]: event.target.value }));
  const closeEditor = () => { setDraft(null); setActionError(null); };
  const save = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError(null);
    try {
      if (draft.id) await updatePrompt(draft.id, { title: draft.title, category: draft.category, content: draft.content });
      else await createPrompt(draft);
      closeEditor();
    } catch (nextError) {
      setActionError(errorMessage(nextError));
    } finally { setIsSaving(false); }
  };
  const remove = async (promptId) => {
    if (!window.confirm('Delete this saved prompt?')) return;
    try { await deletePrompt(promptId); } catch (nextError) { setActionError(errorMessage(nextError)); }
  };

  return <div><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-text-secondary">Reusable workflows</p><h1 className="page-title mt-1">Prompt library</h1><p className="mt-2 text-sm text-text-secondary">Save instructions that make your workflow faster.</p></div><Button size="sm" onClick={() => setDraft(emptyDraft)}><BookmarkPlus size={16} />New prompt</Button></div>{(error || actionError) && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{actionError ?? 'Unable to load prompts. Check your Firestore rules and try again.'}</p>}{draft && <GlowCard className="mt-6"><form onSubmit={save}><div className="flex items-center justify-between"><h2 className="font-semibold">{draft.id ? 'Edit prompt' : 'New prompt'}</h2><Button variant="icon" onClick={closeEditor} aria-label="Close editor"><X size={18} /></Button></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]"><Input name="title" value={draft.title} onChange={update} placeholder="Prompt title" required /><Input name="category" value={draft.category} onChange={update} placeholder="Category" required /></div><textarea name="content" value={draft.content} onChange={update} className="mt-3 min-h-36 w-full rounded-xl border border-white/10 bg-base/60 p-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand/70" placeholder="Write reusable instructions…" required /><div className="mt-3 flex justify-end gap-2"><Button variant="ghost" onClick={closeEditor}>Cancel</Button><Button type="submit" disabled={isSaving}><Save size={16} />{isSaving ? 'Saving…' : 'Save prompt'}</Button></div></form></GlowCard>}<div className="mt-7 grid gap-4 lg:grid-cols-2">{loading && <p className="text-sm text-text-secondary">Loading saved prompts…</p>}{!loading && prompts.length === 0 && <GlowCard className="grid min-h-72 place-items-center text-center lg:col-span-2"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand-light"><Sparkles size={22} /></span><h2 className="mt-4 font-semibold">Build your reusable toolkit</h2><p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">Save prompts for reviews, debugging, tests, and the workflows you use every day.</p></div></GlowCard>}{prompts.map((prompt) => <GlowCard key={prompt.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand-light">{prompt.category}</span><h2 className="mt-3 truncate font-semibold">{prompt.title}</h2></div><div className="flex gap-1"><Button variant="icon" onClick={() => setDraft(prompt)} aria-label={`Edit ${prompt.title}`}><Pencil size={16} /></Button><Button variant="icon" onClick={() => remove(prompt.id)} aria-label={`Delete ${prompt.title}`}><Trash2 size={16} /></Button></div></div><p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{prompt.content}</p></GlowCard>)}</div></div>;
}
