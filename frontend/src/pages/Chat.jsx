import { ArrowUp, Braces, LoaderCircle, Paperclip, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { ChatMessage } from '../components/chat/ChatMessage.jsx';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useMessages } from '../hooks/useMessages.js';
import { streamChat } from '../services/chatService.js';
import { getSettings } from '../services/settingsService.js';
import { uploadDocument } from '../services/documentService.js';
import { searchStackOverflow } from '../services/knowledgeService.js';

const MODEL_OPTIONS = [
  { value: 'gemini-flash-latest', label: 'Gemini Flash', provider: 'gemini' },
  { value: 'gemini-pro-latest', label: 'Gemini Pro', provider: 'gemini' },
  { value: 'openrouter/free', label: 'OpenRouter (free)', provider: 'openrouter' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openrouter' },
  { value: 'anthropic/claude-sonnet', label: 'Claude Sonnet', provider: 'openrouter' },
  { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', provider: 'openrouter' },
  { value: 'google/gemma-2-9b-it', label: 'Gemma 2 9B', provider: 'openrouter' },
  { value: 'mistralai/mistral-7b-instruct', label: 'Mistral 7B', provider: 'openrouter' },
];

const prompts = ['Explain an error', 'Review a pull request', 'Generate unit tests', 'Refactor this function'];

export function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, loading } = useMessages(conversationId);
  const [input, setInput] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedDocument, setAttachedDocument] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');
  const [selectedTemperature, setSelectedTemperature] = useState(0.3);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [includeStackOverflow, setIncludeStackOverflow] = useState(false);
  const [sources, setSources] = useState([]);
  const [stackAnswers, setStackAnswers] = useState([]);
  const [stackStatus, setStackStatus] = useState('idle');
  const [stackError, setStackError] = useState('');
  const completedConversationRef = useRef(null);
  const pendingSourcesRef = useRef([]);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelRef = useRef(null);
  const hasMessages = messages.length > 0 || isStreaming;

  // Load user settings on mount for model/temperature defaults
  useEffect(() => {
    if (!user) return;
    getSettings()
      .then((settings) => {
        if (settings.model) setSelectedModel(settings.model);
        if (settings.temperature != null) setSelectedTemperature(settings.temperature);
      })
      .catch(() => { /* use defaults */ });
  }, [user]);

  // Close model picker on outside click
  useEffect(() => {
    if (!showModelPicker) return;
    const handler = (e) => { if (modelRef.current && !modelRef.current.contains(e.target)) setShowModelPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModelPicker]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamedContent]);

  useEffect(() => {
    if (!conversationId) {
      setSources([]);
      setStackAnswers([]);
      setStackStatus('idle');
      setAttachedDocument(null);
      setError(null);
      return;
    }
    const saved = sessionStorage.getItem(`stackpilot:sources:${conversationId}`);
    if (!saved) {
      setSources([]);
      setStackAnswers([]);
      setStackStatus('idle');
      return;
    }
    try {
      const { sources: savedSources, stackAnswers: savedAnswers } = JSON.parse(saved);
      setSources(savedSources || []);
      setStackAnswers(savedAnswers || []);
      setStackStatus(savedAnswers && savedAnswers.length > 0 ? 'complete' : 'idle');
    } catch { /* Ignore stale session data. */ }
  }, [conversationId]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError(null);
    try {
      const document = await uploadDocument(file);
      setAttachedDocument(document);
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const send = async (event) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isStreaming) return;
    setInput('');
    setError(null);
    setStreamedContent('');
    setIsStreaming(true);
    setStackAnswers([]);
    setStackError('');
    setStackStatus(includeStackOverflow ? 'loading' : 'idle');
    try {
      const stackPromise = includeStackOverflow ? searchStackOverflow(message) : Promise.resolve([]);
      let nextConversationId = conversationId;
      await streamChat({ conversationId, message, mode: 'chat', model: selectedModel, temperature: selectedTemperature, documentId: attachedDocument?.id }, {
        onToken: ({ content }) => setStreamedContent((current) => current + content),
        onDone: ({ conversationId: returnedConversationId }) => { nextConversationId = returnedConversationId || conversationId; completedConversationRef.current = nextConversationId; },
        onError: (eventError) => setError(eventError.message ?? 'Unable to complete this response.'),
        onSources: ({ sources: nextSources }) => { pendingSourcesRef.current = nextSources || []; setSources(nextSources || []); },
      });
      let nextStackAnswers = [];
      try {
        nextStackAnswers = await stackPromise;
        if (includeStackOverflow) setStackStatus(nextStackAnswers.length ? 'complete' : 'empty');
      } catch (lookupError) {
        setStackStatus('error');
        setStackError(lookupError.response?.data?.error?.message || 'Stack Overflow lookup failed. Please try again.');
      }
      setStackAnswers(nextStackAnswers);
      if (nextConversationId) sessionStorage.setItem(`stackpilot:sources:${nextConversationId}`, JSON.stringify({ sources: pendingSourcesRef.current, stackAnswers: nextStackAnswers }));
      if (nextConversationId && nextConversationId !== conversationId) navigate(`/chat/${nextConversationId}`, { replace: true });
      setAttachedDocument(null);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsStreaming(false);
      setStreamedContent('');
    }
  };

  const currentModelInfo = MODEL_OPTIONS.find((m) => m.value === selectedModel);
  const modelLabel = currentModelInfo?.label ?? selectedModel;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Conversation</p>
          <h1 className="page-title mt-1">{conversationId ? 'Chat' : 'New chat'}</h1>
        </div>
        <div className="relative" ref={modelRef}>
          <button
            onClick={() => setShowModelPicker((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-surface/60 px-3 py-1.5 text-xs text-text-secondary transition hover:border-white/20 hover:text-text-primary"
            disabled={isStreaming}
          >
            <Braces size={14} />
            {modelLabel}
          </button>
          {showModelPicker && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/[0.08] bg-elevated p-1.5 shadow-2xl backdrop-blur-xl">
              <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Gemini models
              </p>
              {MODEL_OPTIONS.filter((m) => m.provider === 'gemini').map((opt) => (
                <button
                  key={opt.value}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${
                    selectedModel === opt.value
                      ? 'bg-brand/15 text-brand-light'
                      : 'text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
                  }`}
                  onClick={() => { setSelectedModel(opt.value); setShowModelPicker(false); }}
                >
                  {opt.label}
                </button>
              ))}
              <div className="mx-2 my-1 border-t border-white/[0.06]" />
              <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                OpenRouter models
              </p>
              {MODEL_OPTIONS.filter((m) => m.provider === 'openrouter').map((opt) => (
                <button
                  key={opt.value}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${
                    selectedModel === opt.value
                      ? 'bg-brand/15 text-brand-light'
                      : 'text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
                  }`}
                  onClick={() => { setSelectedModel(opt.value); setShowModelPicker(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 pb-8">
        {loading && <p className="text-center text-sm text-text-muted">Loading messages…</p>}
        {!loading && !hasMessages && (
          <div className="flex flex-1 flex-col items-center justify-center pb-10">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand-light shadow-glow-sm">
              <Sparkles size={25} />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Where should we start?</h2>
            <p className="mt-2 max-w-md text-center text-sm leading-6 text-text-secondary">
              Ask for an explanation, a debugging plan, or help shaping an implementation.
            </p>
            <div className="mt-7 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-xl border border-white/[0.08] bg-surface/60 px-4 py-3 text-left text-sm text-text-secondary transition hover:border-brand/35 hover:bg-brand/[0.06] hover:text-text-primary"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} role={message.role} content={message.content} />
        ))}
        {isStreaming && <ChatMessage role="assistant" content={streamedContent} streaming />}
        {(sources.length > 0 || stackAnswers.length > 0 || stackStatus === 'loading' || stackStatus === 'empty' || stackStatus === 'error') && <GlowCard className="border-brand/15"><h3 className="text-sm font-semibold">Sources used</h3><div className="mt-3 space-y-2">{sources.map((source) => <a key={source.id} href={source.url || '#'} target={source.url ? '_blank' : undefined} rel="noreferrer" className="block rounded-lg bg-base/50 px-3 py-2 text-sm text-text-secondary hover:text-brand-light">{source.type} · {source.title}</a>)}{stackStatus === 'loading' && <p className="rounded-lg bg-base/50 px-3 py-2 text-sm text-text-secondary">Searching Stack Overflow…</p>}{stackStatus === 'empty' && <p className="rounded-lg bg-base/50 px-3 py-2 text-sm text-text-secondary">No Stack Overflow matches found for this question.</p>}{stackStatus === 'error' && <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{stackError}</p>}{stackAnswers.map((answer) => <a key={answer.link} href={answer.link} target="_blank" rel="noreferrer" className="block rounded-lg border border-white/[.07] bg-base/50 p-3 text-sm"><div className="flex gap-2"><span className="rounded bg-accent-emerald/15 px-1.5 py-0.5 text-xs text-accent-emerald">{answer.accepted ? 'Accepted' : `${answer.score} votes`}</span><span className="line-clamp-1 text-text-primary">{answer.title}</span></div><p className="mt-1 line-clamp-2 text-xs text-text-secondary">{answer.excerpt}</p></a>)}</div></GlowCard>}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      <GlowCard className="sticky bottom-3 p-2">
        <form className="flex items-end gap-2" onSubmit={send}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
          />
          <Button
            variant="icon"
            type="button"
            aria-label="Attach a file"
            disabled={uploadingFile || isStreaming}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingFile ? <LoaderCircle size={18} className="animate-spin" /> : <Paperclip size={18} />}
          </Button>
          <textarea
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
            placeholder="Ask about your code…"
            rows="1"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isStreaming}
          />
          <Button variant="icon" type="submit" aria-label="Send message" disabled={!input.trim() || isStreaming}>
            <ArrowUp size={18} />
          </Button>
        </form>
        {attachedDocument && <p className="px-2 pt-1 text-xs text-brand-light">Attached document: {attachedDocument.filename}</p>}
        <label className="flex cursor-pointer items-center gap-2 px-2 pt-2 text-xs text-text-secondary"><input type="checkbox" checked={includeStackOverflow} onChange={(event) => setIncludeStackOverflow(event.target.checked)} /> Include Stack Overflow results {includeStackOverflow && <span className="text-accent-emerald">Enabled</span>}</label>
        <p className="px-2 pb-1 text-xs text-text-muted">
          Responses can make mistakes. Review generated code before using it.
        </p>
      </GlowCard>
    </div>
  );
}
