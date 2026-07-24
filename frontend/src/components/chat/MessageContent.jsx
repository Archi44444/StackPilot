import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock.jsx';

export function MessageContent({ content }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    code({ className, children, ...props }) {
      const language = /language-(\w+)/.exec(className ?? '')?.[1];
      const value = String(children).replace(/\n$/, '');
      return language ? <CodeBlock language={language} value={value} /> : <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.85em]" {...props}>{children}</code>;
    },
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-accent-cyan underline underline-offset-2">{children}</a>,
  }}>{content}</ReactMarkdown>;
}
