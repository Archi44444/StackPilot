import { ArrowUpRight, Bot, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useConversations } from '../hooks/useConversations.js';
import { usePrompts } from '../hooks/usePrompts.js';
import { useDocuments } from '../hooks/useDocuments.js';
import { fadeUp, staggerContainer } from '../utils/motionVariants.js';

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const { conversations } = useConversations();
  const { prompts } = usePrompts();
  const { documents } = useDocuments();

  const stats = [
    { label: 'Conversations', value: conversations?.length ?? 0, icon: MessageSquare, tint: 'text-brand-light' },
    { label: 'Documents', value: documents?.length ?? 0, icon: FileText, tint: 'text-accent-cyan' },
    { label: 'Saved prompts', value: prompts?.length ?? 0, icon: Sparkles, tint: 'text-accent-emerald' },
  ];

  return <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6"><motion.div variants={fadeUp}><p className="text-sm text-text-secondary">Workspace</p><h1 className="page-title mt-1">Good to see you, {firstName}.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Your secure session is active. Ready to build.</p></motion.div><motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, tint }) => <GlowCard key={label}><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">{label}</span><Icon className={tint} size={18} /></div><p className="mt-5 text-3xl font-semibold">{value}</p></GlowCard>)}</motion.div><motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"><GlowCard className="min-h-[270px]"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Start a focused session</h2><p className="mt-1 text-sm text-text-secondary">Ask, explore, or reason through an implementation.</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand-light"><Bot size={21} /></span></div><div className="mt-12 rounded-xl border border-dashed border-white/10 bg-base/40 p-5"><p className="text-sm text-text-secondary">Open a new chat to begin working with the AI.</p><Link to="/chat" className="mt-4 inline-block"><Button size="sm">Open chat <ArrowUpRight size={15} /></Button></Link></div></GlowCard><GlowCard><h2 className="font-semibold">Quick actions</h2><div className="mt-4 space-y-2">{['Explain a code snippet', 'Debug an error', 'Generate a test plan'].map((item) => <button key={item} className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-base/40 px-3 py-3 text-left text-sm text-text-secondary transition hover:border-brand/30 hover:text-text-primary"><span>{item}</span><ArrowUpRight size={15} /></button>)}</div></GlowCard></motion.div></motion.div>;
}
