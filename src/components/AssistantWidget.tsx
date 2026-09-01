import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Which career fits me?",
  "How do I become a data analyst?",
  "What should I learn first?",
];

function renderContent(text: string) {
  // Turn internal paths like /careers/frontend-developer into router links.
  const parts = text.split(/(\/[a-z0-9-]+(?:\/[a-z0-9$-]+)*)/gi);
  return parts.map((part, i) =>
    /^\/[a-z0-9-]/i.test(part) ? (
      <a key={i} href={part} className="text-primary underline underline-offset-2">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function AssistantWidget() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the Career compass assistant. Ask me which roadmap fits you, what to learn next, or how to use the site.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { messages: next.slice(-10) } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't reach the assistant. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Career compass assistant"
          className="card-surface fixed bottom-24 right-4 z-50 flex h-[min(70vh,32rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl"
        >
          <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Ask the assistant</h2>
              <p className="text-xs text-muted-foreground">Careers, skills and how to use the site</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "max-w-[90%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm leading-relaxed text-foreground"
                }
              >
                {m.role === "assistant" ? renderContent(m.content) : m.content}
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            ) : null}
            {messages.length === 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-border/70 p-3"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Message the assistant
            </label>
            <input
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about careers…"
              maxLength={2000}
              className="min-h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary"
            />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-xl" disabled={busy || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
