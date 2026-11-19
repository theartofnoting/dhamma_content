import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, RotateCcw, Send, X } from 'lucide-react';
import { DhammaDiscourse } from '../types/dhamma';
import { calculateEstimatedReadingMinutes } from '../utils/storageAndExport';

export type AssistantRoleId = 'discourse-guide' | 'quick-study' | 'web-research';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  sources?: { title: string; uri: string }[];
  webSearchQueries?: string[];
}

interface StudyAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  discourses: DhammaDiscourse[];
  initialPrompt?: string;
  initialRole?: AssistantRoleId;
}

const ROLE_OPTIONS: {
  id: AssistantRoleId;
  label: string;
  model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
  description: string;
  usesSearchByDefault: boolean;
}[] = [
  {
    id: 'discourse-guide',
    label: 'Sayadaw Discourse Guide',
    model: 'gemini-4-hydrogen',
    description: 'Explains Abhidhamma, Satipaṭṭhāna, and Pāli commentaries in depth.',
    usesSearchByDefault: false,
  },
  {
    id: 'quick-study',
    label: 'Quick Pāli & Study Planner',
    model: 'gemini-3.1-flash-lite',
    description: 'Fast Pāli definitions and study session planning by reading time.',
    usesSearchByDefault: false,
  },
  {
    id: 'web-research',
    label: 'Web & Tipiṭaka Search',
    model: 'gemini-4-hydrogen',
    description: 'Uses Google Search grounding for live Buddhist references and citations.',
    usesSearchByDefault: true,
  },
];

export function StudyAssistantDrawer({
  isOpen,
  onClose,
  discourses,
  initialPrompt,
  initialRole,
}: StudyAssistantDrawerProps) {
  const [roleId, setRoleId] = useState<AssistantRoleId>('discourse-guide');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRole) {
      setRoleId(initialRole);
      setUseSearchGrounding(initialRole === 'web-research');
    }
  }, [initialRole]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const currentRole = ROLE_OPTIONS.find((r) => r.id === roleId) || ROLE_OPTIONS[0];
  const effectiveSearch = currentRole.usesSearchByDefault || useSearchGrounding;

  const buildArchiveContext = () => {
    return discourses
      .map((d) => {
        const mins = calculateEstimatedReadingMinutes(d);
        return `- [${d.accessionCode}] "${d.title}" by ${d.sayadawName} (${d.collection}, ${mins} min read, Ref: ${d.sourceText})`;
      })
      .join('\n');
  };

  const handleRoleChange = (nextRole: AssistantRoleId) => {
    setRoleId(nextRole);
    const roleMeta = ROLE_OPTIONS.find((r) => r.id === nextRole);
    if (roleMeta?.usesSearchByDefault) {
      setUseSearchGrounding(true);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          model: effectiveSearch ? 'gemini-4-hydrogen' : currentRole.model,
          roleId,
          useSearchGrounding: effectiveSearch,
          archiveContext: buildArchiveContext(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }

      const assistantMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.text || 'No response text returned.',
        modelUsed: data.model,
        sources: Array.isArray(data.sources) ? data.sources : [],
        webSearchQueries: Array.isArray(data.webSearchQueries) ? data.webSearchQueries : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to reach the study assistant right now. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const starterPrompts = [
    'Plan a 15-minute evening study session from our Sayadaw discourses.',
    'Explain how Mogok Sayadaw connects vedanā and taṇhā in Paṭiccasamuppāda.',
    'Search the web for recent Dhamma talks and books by Sayadaw Dr. Nandamālābhivaṃsa.',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-assistant-title"
      className="fixed inset-0 z-50 flex justify-end bg-[#1C1917]/50 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-xl h-full flex flex-col bg-[#FBF9F5] dark:bg-[#181512] border-l border-[#D6CEBE] dark:border-[#342E28] shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD3] dark:border-[#342E28] flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-code text-[11px] uppercase tracking-wider text-[#9A3412] dark:text-[#FDBA74]">
              Vipassana Bhavana · Study Companion
            </p>
            <h2
              id="study-assistant-title"
              className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]"
            >
              Dhamma Study Assistant
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setErrorMsg(null);
                }}
                aria-label="Clear conversation history"
                className="min-h-[38px] px-2.5 inline-flex items-center gap-1.5 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Chat</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close study assistant"
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Role & Google Search Grounding Controls */}
        <div className="px-6 py-3.5 border-b border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/60 dark:bg-[#1E1A16] space-y-3">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Assistant role">
            {ROLE_OPTIONS.map((opt) => {
              const active = opt.id === roleId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleRoleChange(opt.id)}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                      : 'bg-[#FBF9F5] text-[#57534E] border border-[#D6CEBE] dark:bg-[#25211D] dark:text-[#A8A29E] dark:border-[#3F3832]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <p className="text-[#57534E] dark:text-[#A8A29E] leading-snug">
              {currentRole.description}
            </p>
            <button
              type="button"
              onClick={() => setUseSearchGrounding((v) => !v)}
              disabled={currentRole.usesSearchByDefault}
              aria-pressed={effectiveSearch}
              className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 border text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-70 ${
                effectiveSearch
                  ? 'border-[#9A3412] bg-[#9A3412]/10 text-[#9A3412] dark:border-[#FDBA74] dark:text-[#FDBA74]'
                  : 'border-[#D6CEBE] dark:border-[#44403C] text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{effectiveSearch ? 'Google Search On' : 'Google Search Off'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Multi-Turn Conversation Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messages.length === 0 ? (
            <div className="space-y-5 pt-2">
              <p className="text-sm leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
                Ask questions about Sayadaw teachings in our collection, plan study sessions using
                each discourse’s estimated reading time, or enable Google Search grounding for
                up-to-date Tipiṭaka and monastic references.
              </p>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                  Suggested Prompts
                </p>
                <div className="space-y-2">
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (idx === 2) {
                          setRoleId('web-research');
                          setUseSearchGrounding(true);
                        }
                        void sendMessage(prompt);
                      }}
                      className="w-full text-left p-3 text-xs leading-relaxed border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#221E1A] hover:border-[#9A3412] text-[#292524] dark:text-[#E7E5E4] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`space-y-2 ${
                  msg.role === 'user' ? 'pl-8' : 'pr-4'
                }`}
              >
                <div
                  className={`p-4 border text-sm leading-[1.7] whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] dark:bg-[#2A241E] dark:text-[#F5F5F4] dark:border-[#3F3832]'
                      : 'bg-[#F4EFE6]/55 text-[#1C1917] border-[#E5DFD3] dark:bg-[#1E1A16] dark:text-[#E7E5E4] dark:border-[#342E28]'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wider opacity-70 mb-1.5 font-mono-code">
                    {msg.role === 'user'
                      ? 'You'
                      : `${currentRole.label}${msg.modelUsed ? ` · ${msg.modelUsed}` : ''}`}
                  </p>
                  <div>{msg.text}</div>
                </div>

                {/* Google Search Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="p-3 border border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512] space-y-1.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-[#9A3412] dark:text-[#FDBA74]" aria-hidden="true" />
                      <span>Web Sources (Google Search Grounding)</span>
                    </p>
                    <ul className="space-y-1">
                      {msg.sources.map((src, idx) => (
                        <li key={`${src.uri}-${idx}`} className="text-xs">
                          <a
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#9A3412] dark:text-[#FDBA74] hover:underline break-all"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="p-4 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16] text-xs text-[#57534E] dark:text-[#A8A29E]">
              {effectiveSearch
                ? 'Searching web references and preparing response…'
                : 'Preparing Dhamma study response…'}
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5] leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512]"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                effectiveSearch
                  ? 'Ask a question with live Google Search grounding…'
                  : 'Ask about a Sayadaw discourse, Pāli term, or study plan…'
              }
              aria-label="Message to Dhamma Study Assistant"
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="min-h-[44px] px-4 inline-flex items-center gap-1.5 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
