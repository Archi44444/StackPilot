import { ArrowUpRight, Bot, FileText, Github, MessageSquare, Sparkles, BookOpen, Activity, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { TaskLogger } from '../components/ui/TaskLogger.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useConversations } from '../hooks/useConversations.js';
import { usePrompts } from '../hooks/usePrompts.js';
import { useDocuments } from '../hooks/useDocuments.js';
import { fadeUp, staggerContainer } from '../utils/motionVariants.js';
import { getDashboard, getCausalAnalytics } from '../services/knowledgeService.js';

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const { conversations } = useConversations();
  const { prompts } = usePrompts();
  const { documents } = useDocuments();
  const [workspace, setWorkspace] = useState(null);
  const [causalData, setCausalData] = useState(null);
  const [showLogger, setShowLogger] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => getDashboard().then((data) => { if (active) setWorkspace(data); }).catch(() => {});
    load();
    const interval = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const loadCausal = useCallback(() => {
    getCausalAnalytics().then(setCausalData).catch(() => {});
  }, []);

  useEffect(() => { loadCausal(); }, [loadCausal]);

  const isLive = causalData?.data_source === 'real';
  const tasksLogged = causalData?.tasks_logged ?? 0;
  const tasksRequired = causalData?.tasks_required ?? 10;
  const progressPct = Math.min(100, Math.round((tasksLogged / tasksRequired) * 100));

  const stats = [
    { label: 'Conversations', value: conversations?.length ?? 0, icon: MessageSquare, tint: 'text-brand-light' },
    { label: 'Repositories', value: workspace?.repositories ?? 0, icon: Github, tint: 'text-brand-light' },
    { label: 'Documentation', value: workspace?.documentation ?? 0, icon: BookOpen, tint: 'text-accent-cyan' },
    { label: 'Uploads', value: workspace?.documents ?? documents?.length ?? 0, icon: FileText, tint: 'text-accent-cyan' },
    { label: 'Saved prompts', value: prompts?.length ?? 0, icon: Sparkles, tint: 'text-accent-emerald' },
  ];

  return (
    <>
      {showLogger && (
        <TaskLogger
          onClose={() => setShowLogger(false)}
          onLogged={() => { setShowLogger(false); loadCausal(); }}
        />
      )}

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp}>
          <p className="text-sm text-text-secondary">Workspace</p>
          <h1 className="page-title mt-1">Good to see you, {firstName}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Everything you import is available to source-aware chat.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, icon: Icon, tint }) => (
            <GlowCard key={label}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{label}</span>
                <Icon className={tint} size={18} />
              </div>
              <p className="mt-5 text-3xl font-semibold">{value}</p>
            </GlowCard>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <GlowCard className="min-h-[270px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Start a focused session</h2>
                <p className="mt-1 text-sm text-text-secondary">Ask across your repositories, docs, and files.</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand-light">
                <Bot size={21} />
              </span>
            </div>
            <div className="mt-12 rounded-xl border border-dashed border-white/10 bg-base/40 p-5">
              <p className="text-sm text-text-secondary">Import project context or open a new chat.</p>
              <div className="mt-4 flex gap-2">
                <Link to="/chat"><Button size="sm">Open chat <ArrowUpRight size={15} /></Button></Link>
                <Link to="/knowledge"><Button size="sm" variant="secondary">Import sources</Button></Link>
              </div>
            </div>
          </GlowCard>

          <GlowCard>
            <h2 className="font-semibold">Recent activity</h2>
            <div className="mt-4 space-y-2">
              {workspace?.recentActivity?.length
                ? workspace.recentActivity.map((item) => (
                    <p key={item.id} className="rounded-xl border border-white/[0.07] bg-base/40 px-3 py-3 text-sm text-text-secondary">{item.title}</p>
                  ))
                : <p className="text-sm text-text-muted">Your imports will appear here.</p>}
            </div>
          </GlowCard>
        </motion.div>

        {/* ── Causal Analytics Card ── */}
        <motion.div variants={fadeUp}>
          <GlowCard>
            <div className="flex flex-col gap-6 lg:flex-row justify-between">
              {/* Left — description */}
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
                      <CheckCircle2 size={11} /> Live Experiment
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-light border border-brand/20">
                      Collecting Data
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-cyan/10 px-2.5 py-0.5 text-xs font-medium text-accent-cyan border border-accent-cyan/20">
                    Propensity Score Matching (1:1 NN)
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-text-primary flex items-center gap-2">
                    <Activity className="text-brand-light" size={20} />
                    Causal Analytics: Developer Productivity
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {isLive
                      ? `Showing results from your ${causalData.sample_size} logged tasks. Naive comparisons are confounded by task difficulty — matching corrects for this.`
                      : 'Log your own tasks to unlock live results. Junior developers tend to use AI on harder tasks, creating confounding bias that propensity-score matching removes.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-1">
                  <div className="rounded-xl border border-white/[0.05] bg-base/30 p-3">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Treatment Variable</span>
                    <span className="text-sm font-medium text-text-primary mt-0.5 block">AI assistance used (T = 1) vs. control (T = 0)</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-base/30 p-3">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Outcome Variable</span>
                    <span className="text-sm font-medium text-text-primary mt-0.5 block">Task completion time (minutes)</span>
                  </div>
                </div>

                <div className="text-xs text-text-secondary space-y-1.5 bg-base/20 rounded-xl p-3 border border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                    <span><strong>Confounders:</strong> Task difficulty (1–5), Developer experience (1–10 yrs), Language, Task type.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-light shrink-0" />
                    <span><strong>Method:</strong> 1:1 nearest-neighbour matching without replacement (0.05 caliper).</span>
                  </div>
                </div>

                <Button size="sm" onClick={() => setShowLogger(true)} className="w-fit">
                  <Plus size={14} /> Log a Task
                </Button>
              </div>

              {/* Right — metrics panel */}
              <div className="w-full lg:w-80 shrink-0 rounded-xl border border-white/[0.07] bg-base/40 p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    {isLive ? 'Live Results' : 'Experiment Summary'}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {isLive
                      ? `${causalData.sample_size} real tasks · ${causalData.treated_count} AI / ${causalData.control_count} control`
                      : `${causalData?.sample_size ?? 200} synthetic observations (85 AI / 115 control)`}
                  </p>
                </div>

                {/* Progress bar — only when collecting */}
                {!isLive && (
                  <div>
                    <div className="flex justify-between text-[10px] text-text-muted mb-1.5">
                      <span>Tasks logged</span>
                      <span>{tasksLogged} / {tasksRequired} to unlock live results</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-brand/60 rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Naive Difference</span>
                      <span className="font-semibold text-red-400">
                        {causalData ? `${causalData.naive_difference_minutes > 0 ? '+' : ''}${causalData.naive_difference_minutes} min` : '--'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-red-400/50 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <p className="text-[10px] text-text-muted leading-snug">
                      Confounded — AI users tend to tackle harder tasks.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Propensity-Matched Effect</span>
                      <span className="font-semibold text-emerald-400">
                        {causalData ? `${causalData.matched_effect_minutes} min` : '--'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <p className="text-[10px] text-text-muted leading-snug">
                      {isLive ? 'Estimate from your real task history.' : 'Estimated gain after removing confounding bias.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06]">
                  {isLive ? (
                    <div className="flex gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[10px] text-emerald-400/90 leading-normal">
                      <CheckCircle2 className="shrink-0 mt-0.5" size={13} />
                      <div>
                        <span className="font-semibold block">Live Experiment</span>
                        {causalData.interpretation}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[10px] text-amber-400/90 leading-normal">
                      <AlertTriangle className="shrink-0 text-amber-400 mt-0.5" size={13} />
                      <div>
                        <span className="font-semibold block">Synthetic Baseline</span>
                        Log {tasksRequired - tasksLogged} more task{tasksRequired - tasksLogged !== 1 ? 's' : ''} (with both AI and non-AI sessions) to switch to live results.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </motion.div>
    </>
  );
}
