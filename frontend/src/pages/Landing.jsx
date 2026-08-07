import { ArrowRight, BookOpen, Bot, Bug, CheckCircle, Code, Github, Sparkles, TerminalSquare, Zap, Bookmark, Shield, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button.jsx';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { GradientText } from '../components/ui/GradientText.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { MeshBackground } from '../components/layout/MeshBackground.jsx';
import { fadeUp, staggerContainer } from '../utils/motionVariants.js';

const highlights = [
  { icon: Bot, title: 'AI chat with context', description: 'Talk to your workspace with grounded, source-aware answers.' },
  { icon: BookOpen, title: 'Knowledge imports', description: 'Bring repositories and documentation into the same retrieval layer.' },
  { icon: Bug, title: 'Debugging mode', description: 'Paste errors and get cause, explanation, and a fix-oriented response.' },
  { icon: Code, title: 'Code explainer', description: 'Understand code paths, complexity, and implementation details faster.' },
  { icon: Zap, title: 'Code generator', description: 'Create React, Express, API, auth, and database scaffolding quickly.' },
  { icon: Bookmark, title: 'Prompt library', description: 'Save reusable prompts for debugging, explanation, and generation.' },
  { icon: FileSearch, title: 'Document assistant', description: 'Query PDFs, Markdown, DOCX, and text uploads with RAG.' },
  { icon: Github, title: 'Repository AI analysis', description: 'Generate summaries, architecture notes, tech stack breakdowns, security and performance insights, and missing README sections.' },
  { icon: Shield, title: 'Secure auth', description: 'Firebase Authentication keeps each workspace scoped to the signed-in user.' },
];

export function Landing() {
  return (
    <main className="relative overflow-hidden bg-base text-text-primary">
      <MeshBackground />
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/register"><Button size="sm">Get started <ArrowRight size={15} /></Button></Link>
        </div>
      </header>

      <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-4xl px-5 pb-24 pt-10 text-center sm:px-8 sm:pt-16">
        <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/[0.08] px-3 py-1.5 text-xs font-medium text-brand-light"><Sparkles size={14} />Your AI-native development workspace</motion.div>
        <motion.h1 variants={fadeUp} className="mx-auto mt-7 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Build with a <GradientText>clearer flow.</GradientText></motion.h1>
        <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">StackPilot is a deliberate workspace for developer chat, document Q&A, repository analysis, and AI-assisted coding. Import your knowledge, keep your conversations organized, and move from question to implementation without losing context.</motion.p>
        <motion.div variants={fadeUp} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/register"><Button size="lg">Get Started</Button></Link>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-panel relative mx-auto mt-16 max-w-3xl rounded-2xl p-3 text-left shadow-glow-md">
          <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-3 pb-3">
            <span className="h-2 w-2 rounded-full bg-red-400/80" />
            <span className="h-2 w-2 rounded-full bg-amber-300/80" />
            <span className="h-2 w-2 rounded-full bg-accent-emerald/80" />
            <span className="ml-2 text-xs text-text-muted">copilot / analyze</span>
          </div>
          <div className="p-4 font-mono text-sm leading-7">
            <p className="text-text-secondary">User prompt: "Explain this repository and flag risks."</p>
            <p className="mt-5 text-accent-cyan">AI response: repository summary, architecture overview, tech stack, security issues, and improvement suggestions.</p>
            <pre className="mt-2 rounded bg-black/30 p-2 text-text-muted"><code>{`# Example output\n- Repository summary\n- Architecture overview\n- Tech stack\n- Security issues\n- Performance suggestions`}</code></pre>
          </div>
        </motion.div>
      </motion.section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-24 sm:grid-cols-3 sm:px-8">
        {highlights.map(({ icon: Icon, title, description }) => (
          <GlowCard key={title}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-brand-light"><Icon size={19} /></span>
            <h2 className="mt-5 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </GlowCard>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold">What StackPilot does</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            'Chat with streamed AI responses',
            'Import repositories and docs for RAG',
            'Explain, debug, and generate code',
            'Manage history, prompts, and settings',
          ].map((item) => (
            <GlowCard key={item}>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 text-brand-light" size={18} />
                <p className="text-sm leading-6 text-text-secondary">{item}</p>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 text-center sm:px-8">
        <h2 className="text-3xl font-bold">Ready to work with context?</h2>
        <p className="mt-4 text-text-secondary">Use StackPilot to build, analyze, and debug with your own project knowledge attached.</p>
        <Link to="/register"><Button size="lg" className="mt-8">Start Building</Button></Link>
      </section>

      <footer className="border-t border-white/[0.07] px-5 py-12 sm:px-8">
        <div className="mx-auto mb-8 grid max-w-6xl grid-cols-2 gap-8 text-sm text-text-muted md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Product</h3>
            <ul className="space-y-2">
              <li><span>Features</span></li>
              <li><span>Documentation</span></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Code</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Github size={14} /> GitHub</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">System</h3>
            <ul className="space-y-2">
              <li>Health check</li>
              <li>Workspace settings</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Support</h3>
            <ul className="space-y-2">
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.05] pt-8 text-center text-sm text-text-muted">
          <span className="inline-flex items-center gap-2"><TerminalSquare size={15} />StackPilot <span className="text-white/20">•</span> Built for focused work</span>
        </div>
      </footer>
    </main>
  );
}
