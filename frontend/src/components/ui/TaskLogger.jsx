import { useState, useEffect, useRef } from 'react';
import { X, Play, Square, Clock, CheckCircle, LoaderCircle } from 'lucide-react';
import { logTask } from '../../services/taskService.js';
import { Button } from './Button.jsx';
import { cn } from '../../utils/cn.js';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Other'];
const TASK_TYPES = [
  { value: 'bug_fix', label: 'Bug Fix' },
  { value: 'feature', label: 'New Feature' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'docs', label: 'Documentation' },
  { value: 'other', label: 'Other' },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function TaskLogger({ onClose, onLogged }) {
  const [aiAssisted, setAiAssisted] = useState(1);
  const [difficulty, setDifficulty] = useState(3);
  const [experience, setExperience] = useState(5);
  const [language, setLanguage] = useState('JavaScript');
  const [taskType, setTaskType] = useState('bug_fix');
  const [manualMinutes, setManualMinutes] = useState('');
  const [useStopwatch, setUseStopwatch] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const toggleStopwatch = () => {
    if (!useStopwatch) { setUseStopwatch(true); setElapsed(0); setRunning(false); return; }
    setRunning((r) => !r);
  };
  const resetStopwatch = () => { setRunning(false); setElapsed(0); };

  const completionTime = useStopwatch
    ? Math.round((elapsed / 60) * 10) / 10
    : parseFloat(manualMinutes);

  const canSubmit = completionTime > 0 && completionTime <= 480 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await logTask({
        ai_assisted: aiAssisted,
        task_difficulty: difficulty,
        developer_experience: experience,
        language,
        task_type: taskType,
        completion_time: completionTime,
      });
      setSuccess(true);
      setTimeout(() => { onLogged?.(); onClose(); }, 1200);
    } catch {
      setError('Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyLabels = ['', 'Trivial', 'Easy', 'Medium', 'Hard', 'Expert'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md glass-panel rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 className="font-semibold text-text-primary">Log a Task</h2>
            <p className="text-xs text-text-muted mt-0.5">Each entry improves your causal analysis</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-5">
            <CheckCircle className="text-emerald-400" size={40} />
            <p className="font-semibold text-text-primary">Task logged!</p>
            <p className="text-sm text-text-secondary text-center">Your causal analysis is being updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* AI Assisted toggle */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Did you use AI assistance?</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ label: '✓  Used AI (T = 1)', val: 1 }, { label: '✗  No AI (T = 0)', val: 0 }].map(({ label, val }) => (
                  <button key={val} type="button"
                    onClick={() => setAiAssisted(val)}
                    className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      aiAssisted === val
                        ? val === 1 ? 'border-brand/50 bg-brand/15 text-brand-light' : 'border-white/20 bg-white/10 text-text-primary'
                        : 'border-white/[0.06] bg-base/30 text-text-muted hover:border-white/20')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Type + Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Task Type</label>
                <select value={taskType} onChange={(e) => setTaskType(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.07] bg-elevated/60 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand/40">
                  {TASK_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.07] bg-elevated/60 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand/40">
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-muted uppercase tracking-wider">Difficulty</span>
                <span className="font-medium text-text-secondary">{difficulty} — {difficultyLabels[difficulty]}</span>
              </div>
              <input type="range" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-brand-light cursor-pointer" />
            </div>

            {/* Experience */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-muted uppercase tracking-wider">Your Experience</span>
                <span className="font-medium text-text-secondary">{experience} yr{experience !== 1 ? 's' : ''}</span>
              </div>
              <input type="range" min={1} max={10} value={experience} onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full accent-brand-light cursor-pointer" />
            </div>

            {/* Completion Time */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Completion Time</p>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => { setUseStopwatch(false); resetStopwatch(); }}
                  className={cn('flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5',
                    !useStopwatch ? 'border-brand/40 bg-brand/10 text-brand-light' : 'border-white/[0.06] bg-base/30 text-text-muted hover:border-white/10')}>
                  <Clock size={13} /> Manual
                </button>
                <button type="button" onClick={toggleStopwatch}
                  className={cn('flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5',
                    useStopwatch ? 'border-brand/40 bg-brand/10 text-brand-light' : 'border-white/[0.06] bg-base/30 text-text-muted hover:border-white/10')}>
                  <Play size={13} /> Stopwatch
                </button>
              </div>

              {!useStopwatch ? (
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={480} step={0.5} placeholder="e.g. 25"
                    value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)}
                    className="flex-1 rounded-xl border border-white/[0.07] bg-elevated/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40" />
                  <span className="text-sm text-text-muted whitespace-nowrap">minutes</span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-elevated/60 px-4 py-3">
                  <span className="font-mono text-2xl font-semibold text-text-primary tracking-widest">{formatTime(elapsed)}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRunning((r) => !r)}
                      className="rounded-lg p-2 bg-brand/15 text-brand-light hover:bg-brand/25 transition">
                      {running ? <Square size={15} /> : <Play size={15} />}
                    </button>
                    <button type="button" onClick={resetStopwatch}
                      className="rounded-lg p-2 text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition">
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {submitting && <LoaderCircle size={15} className="animate-spin" />}
              {submitting ? 'Saving…' : 'Log Task'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
