import { ArrowRight, Bot, FileSearch, Github, ShieldCheck, Sparkles, TerminalSquare, Code, BookOpen, Bug, Zap, Bookmark, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button.jsx';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { GradientText } from '../components/ui/GradientText.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { MeshBackground } from '../components/layout/MeshBackground.jsx';
import { fadeUp, staggerContainer } from '../utils/motionVariants.js';

const originalFeatures = [
  { icon: Bot, title: 'Code with context', description: 'Move from questions to implementation in one focused conversation.' },
  { icon: FileSearch, title: 'Grounded documentation', description: 'Bring your project knowledge into every answer.' },
  { icon: ShieldCheck, title: 'Private by design', description: 'Firebase identity and scoped data access from the start.' },
];

const newFeatures = [
  { icon: Bot, title: '💬 AI Chat', description: 'Ask coding questions naturally.' },
  { icon: BookOpen, title: '📚 Documentation Assistant', description: 'Upload PDFs, Markdown, or TXT files and query them with RAG.' },
  { icon: Bug, title: '🐞 AI Debugger', description: 'Paste an error and get: Root cause, Explanation, Suggested fixes, Corrected code.' },
  { icon: Code, title: '🧩 Code Explainer', description: 'Understand unfamiliar code with: Line-by-line explanations, Time complexity, Space complexity, Best practices.' },
  { icon: Zap, title: '⚡ Code Generator', description: 'Generate production-ready code for React, Express, APIs, Authentication, Database operations.' },
  { icon: Bookmark, title: '🗂 Prompt Library', description: 'Save and reuse your favorite prompts.' },
  { icon: Shield, title: '🔒 Secure Authentication', description: 'Google Sign-In and Email/Password powered by Firebase Authentication.' },
];

export function Landing() {
  return (
    <main className="relative overflow-hidden bg-base text-text-primary"><MeshBackground />
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8"><Logo /><div className="flex items-center gap-2"><Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link><Link to="/register"><Button size="sm">Get started <ArrowRight size={15} /></Button></Link></div></header>
      
      <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-4xl px-5 pb-24 pt-10 text-center sm:px-8 sm:pt-16">
        <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/[0.08] px-3 py-1.5 text-xs font-medium text-brand-light"><Sparkles size={14} />Your AI-native development workspace</motion.div>
        <motion.h1 variants={fadeUp} className="mx-auto mt-7 max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-6xl">Build with a <GradientText>clearer flow.</GradientText></motion.h1>
        <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">Your intelligent coding companion powered by Retrieval-Augmented Generation (RAG). Upload documentation, debug errors, explain code, and build faster with an AI that understands your knowledge base. StackPilot brings chat, code understanding, and your project documentation into one deliberate workspace.</motion.p>
        <motion.div variants={fadeUp} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/register"><Button size="lg">🚀 Get Started</Button></Link></motion.div>
        
        {/* Hero Visual */}
        <motion.div variants={fadeUp} className="glass-panel mx-auto mt-16 max-w-3xl rounded-2xl p-3 text-left shadow-glow-md relative">
          <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-3 pb-3">
            <span className="h-2 w-2 rounded-full bg-red-400/80" /><span className="h-2 w-2 rounded-full bg-amber-300/80" /><span className="h-2 w-2 rounded-full bg-accent-emerald/80" /><span className="ml-2 text-xs text-text-muted">copilot / debug</span>
          </div>
          <div className="p-4 font-mono text-sm leading-7">
            <p className="text-text-secondary">User prompt: "Why is my Express middleware throwing 401?"</p>
            <p className="mt-5 text-accent-cyan">→ AI Response: The 401 Unauthorized error typically occurs when the authentication token is missing or invalid.</p>
            <pre className="mt-2 text-text-muted bg-black/30 p-2 rounded"><code>{`if (!req.headers.authorization) {\n  return res.status(401).send('Unauthorized');\n}`}</code></pre>
          </div>
          
          
        </motion.div>
      </motion.section>

      

      <section id="workflow" className="mx-auto grid max-w-6xl gap-4 px-5 py-24 sm:grid-cols-3 sm:px-8">
        {originalFeatures.map(({ icon: Icon, title, description }) => (
          <GlowCard key={title}><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-brand-light"><Icon size={19} /></span><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p></GlowCard>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newFeatures.map(({ icon: Icon, title, description }) => (
            <GlowCard key={title}>
              <h2 className="font-semibold flex items-center gap-2 text-lg"><Icon size={18} className="text-brand-light"/> {title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <h2 className="mb-8 text-3xl font-bold">How It Works</h2>
          <ul className="space-y-4 text-text-secondary">
             <li className="flex gap-3"><CheckCircle className="text-brand-light" size={20}/> Sign in securely.</li>
             <li className="flex gap-3"><CheckCircle className="text-brand-light" size={20}/> Upload your documentation.</li>
             <li className="flex gap-3"><CheckCircle className="text-brand-light" size={20}/> AI indexes it using RAG.</li>
             <li className="flex gap-3"><CheckCircle className="text-brand-light" size={20}/> Ask questions in natural language.</li>
             <li className="flex gap-3"><CheckCircle className="text-brand-light" size={20}/> Receive accurate, context-aware answers.</li>
          </ul>
        </div>
        <div className="flex-1">
          <h2 className="mb-8 text-3xl font-bold">Why Choose StackPilot?</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface/50">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="border-b border-white/10 bg-white/5 text-text-primary">
                <tr><th className="p-4 font-semibold">Traditional AI</th><th className="p-4 font-semibold">StackPilot</th></tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5"><td className="p-4">Generic answers</td><td className="p-4 text-brand-light">Context-aware responses</td></tr>
                <tr className="border-b border-white/5"><td className="p-4">Doesn't know your docs</td><td className="p-4 text-brand-light">Learns from your uploaded knowledge</td></tr>
                <tr className="border-b border-white/5"><td className="p-4">No persistent history</td><td className="p-4 text-brand-light">Saves chats and prompts</td></tr>
                <tr><td className="p-4">Limited debugging</td><td className="p-4 text-brand-light">Explains and fixes code intelligently</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 text-center sm:px-8">
        <h2 className="text-3xl font-bold">Ready to Code Smarter?</h2>
        <p className="mt-4 text-text-secondary">Join developers using AI to build, debug, and learn faster.</p>
        <Link to="/register"><Button size="lg" className="mt-8">Start Building</Button></Link>
      </section>

      <footer className="border-t border-white/[0.07] py-12 px-5 sm:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm text-text-muted">
           <div><h3 className="text-text-primary font-semibold mb-4">Product</h3><ul className="space-y-2"><li><a href="#" className="hover:text-white">Features</a></li><li><a href="#" className="hover:text-white">Documentation</a></li></ul></div>
           <div><h3 className="text-text-primary font-semibold mb-4">Code</h3><ul className="space-y-2"><li><a href="#" className="hover:text-white flex items-center gap-2"><Github size={14}/> GitHub</a></li></ul></div>
           <div><h3 className="text-text-primary font-semibold mb-4">Legal</h3><ul className="space-y-2"><li><a href="#" className="hover:text-white">Privacy Policy</a></li><li><a href="#" className="hover:text-white">Terms of Service</a></li></ul></div>
           <div><h3 className="text-text-primary font-semibold mb-4">Support</h3><ul className="space-y-2"><li><a href="#" className="hover:text-white">Contact</a></li></ul></div>
        </div>
        <div className="text-center text-sm text-text-muted pt-8 border-t border-white/[0.05]">
           <span className="inline-flex items-center gap-2"><TerminalSquare size={15} />StackPilot <span className="text-white/20">•</span> Built for focused work</span>
        </div>
      </footer>
    </main>
  );
}
