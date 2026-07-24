import { Bot, UserRound } from 'lucide-react';
import { MessageContent } from './MessageContent.jsx';

export function ChatMessage({ role, content, streaming = false }) {
  const assistant = role === 'assistant';
  return <article className={`flex gap-3 ${assistant ? '' : 'justify-end'}`}><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${assistant ? 'bg-brand/15 text-brand-light' : 'order-2 bg-white/[0.08] text-text-secondary'}`}>{assistant ? <Bot size={17} /> : <UserRound size={16} />}</div><div className={`max-w-[min(80%,720px)] rounded-2xl px-4 py-3 text-sm leading-6 ${assistant ? 'bg-surface text-text-primary' : 'bg-brand/20 text-text-primary'}`}><MessageContent content={content || (streaming ? 'Thinking…' : '')} />{streaming && <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-brand-light align-middle" />}</div></article>;
}
