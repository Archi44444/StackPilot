import { ArrowUpRight, Bot, FileText, Github, MessageSquare, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useConversations } from '../hooks/useConversations.js';
import { usePrompts } from '../hooks/usePrompts.js';
import { useDocuments } from '../hooks/useDocuments.js';
import { fadeUp, staggerContainer } from '../utils/motionVariants.js';
import { getDashboard } from '../services/knowledgeService.js';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const { conversations } = useConversations();
  const { prompts } = usePrompts();
  const { documents } = useDocuments();
  const [workspace, setWorkspace] = useState(null);
  useEffect(() => { getDashboard().then(setWorkspace).catch(() => {}); }, []);

  const stats = [
    { label: 'Conversations', value: conversations?.length ?? 0, icon: MessageSquare, tint: 'text-brand-light' },
    { label: 'Repositories', value: workspace?.repositories ?? 0, icon: Github, tint: 'text-brand-light' },
    { label: 'Documentation', value: workspace?.documentation ?? 0, icon: BookOpen, tint: 'text-accent-cyan' },
    { label: 'Uploads', value: workspace?.documents ?? documents?.length ?? 0, icon: FileText, tint: 'text-accent-cyan' },
    { label: 'Saved prompts', value: prompts?.length ?? 0, icon: Sparkles, tint: 'text-accent-emerald' },
  ];

  return <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6"><motion.div variants={fadeUp}><p className="text-sm text-text-secondary">Workspace</p><h1 className="page-title mt-1">Good to see you, {firstName}.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Everything you import is available to source-aware chat.</p></motion.div><motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map(({ label, value, icon: Icon, tint }) => <GlowCard key={label}><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">{label}</span><Icon className={tint} size={18} /></div><p className="mt-5 text-3xl font-semibold">{value}</p></GlowCard>)}</motion.div><motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"><GlowCard className="min-h-[270px]"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Start a focused session</h2><p className="mt-1 text-sm text-text-secondary">Ask across your repositories, docs, and files.</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand-light"><Bot size={21} /></span></div><div className="mt-12 rounded-xl border border-dashed border-white/10 bg-base/40 p-5"><p className="text-sm text-text-secondary">Import project context or open a new chat.</p><div className="mt-4 flex gap-2"><Link to="/chat"><Button size="sm">Open chat <ArrowUpRight size={15} /></Button></Link><Link to="/knowledge"><Button size="sm" variant="secondary">Import sources</Button></Link></div></div></GlowCard><GlowCard><h2 className="font-semibold">Recent activity</h2><div className="mt-4 space-y-2">{workspace?.recentActivity?.length ? workspace.recentActivity.map((item) => <p key={item.id} className="rounded-xl border border-white/[0.07] bg-base/40 px-3 py-3 text-sm text-text-secondary">{item.title}</p>) : <p className="text-sm text-text-muted">Your imports will appear here.</p>}</div></GlowCard></motion.div></motion.div>;
}
