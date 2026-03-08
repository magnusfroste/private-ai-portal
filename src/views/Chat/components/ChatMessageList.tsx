import { Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
      title="Kopiera"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      pre({ children }) {
        const codeEl = (children as any)?.props;
        const codeText = codeEl?.children?.[0] || "";
        return (
          <div className="relative group my-3">
            <CopyButton text={String(codeText)} />
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs font-mono">
              {children}
            </pre>
          </div>
        );
      },
      code({ className, children, ...props }) {
        const isInline = !className;
        if (isInline) {
          return (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground" {...props}>
              {children}
            </code>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      p({ children }) {
        return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
      },
      ul({ children }) {
        return <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>;
      },
      h1({ children }) {
        return <h2 className="text-lg font-bold mb-2 mt-5 first:mt-0">{children}</h2>;
      },
      h2({ children }) {
        return <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">{children}</h3>;
      },
      h3({ children }) {
        return <h4 className="text-sm font-semibold mb-1.5 mt-3 first:mt-0">{children}</h4>;
      },
      blockquote({ children }) {
        return (
          <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground my-3">
            {children}
          </blockquote>
        );
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full text-xs border border-border rounded">{children}</table>
          </div>
        );
      },
      th({ children }) {
        return <th className="border border-border bg-muted px-3 py-1.5 text-left font-semibold">{children}</th>;
      },
      td({ children }) {
        return <td className="border border-border px-3 py-1.5">{children}</td>;
      },
      a({ href, children }) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
            {children}
          </a>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

export const ChatMessageList = ({ messages, isStreaming }: ChatMessageListProps) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-2">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="py-3"
        >
          {msg.role === "user" ? (
            <div className="flex justify-end">
              <div className="bg-muted rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed prose-sm">
              <MarkdownContent content={msg.content} />
              {i === messages.length - 1 && isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};