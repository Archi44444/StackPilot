import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import { Button } from '../ui/Button.jsx';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);

export function CodeBlock({ language = 'text', value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return <div className="my-4 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0a0a12]"><div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-1.5"><span className="font-mono text-xs text-text-muted">{language}</span><Button variant="icon" size="sm" className="h-8 w-8" onClick={copy} aria-label="Copy code">{copied ? <Check size={15} className="text-accent-emerald" /> : <Copy size={15} />}</Button></div><SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.8rem', lineHeight: '1.55' }} wrapLongLines>{value}</SyntaxHighlighter></div>;
}
