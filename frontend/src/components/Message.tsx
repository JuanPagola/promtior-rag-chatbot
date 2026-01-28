import { useState } from 'react';
import { Avatar } from '@heroui/react';
import { Person, LogoTelegram, Copy, Check } from '@gravity-ui/icons';
import ReactMarkdown from 'react-markdown';

export interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function Message({ role, content, timestamp }: MessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group message-enter flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar
        className="shrink-0 bg-[#0F3460] border border-white/10"
        size="sm"
      >
        <Avatar.Fallback className={isUser ? 'text-[#7C3AED]' : 'text-[#4FD1C5]'}>
          {isUser ? <Person className="w-4 h-4" /> : <LogoTelegram className="w-4 h-4" />}
        </Avatar.Fallback>
      </Avatar>

      <div
        className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-[#7C3AED] text-white rounded-tr-sm'
              : 'bg-[#16213E] text-[#F7FAFC] rounded-tl-sm border border-white/5'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
          {/* Copy button - only for assistant messages */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute -right-2 -top-2 p-1.5 rounded-full bg-[#16213E] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#0F3460]"
              aria-label={copied ? 'Copied!' : 'Copy message'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#4FD1C5]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#A0AEC0]" />
              )}
            </button>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-[#A0AEC0] mt-1 px-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="message-enter flex gap-3">
      <Avatar
        className="shrink-0 bg-[#0F3460] border border-white/10"
        size="sm"
      >
        <Avatar.Fallback className="text-[#4FD1C5]">
          <LogoTelegram className="w-4 h-4" />
        </Avatar.Fallback>
      </Avatar>

      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-[#16213E] border border-white/5">
        <span className="typing-dot w-2 h-2 rounded-full bg-[#4FD1C5]" />
        <span className="typing-dot w-2 h-2 rounded-full bg-[#4FD1C5]" />
        <span className="typing-dot w-2 h-2 rounded-full bg-[#4FD1C5]" />
      </div>
    </div>
  );
}
