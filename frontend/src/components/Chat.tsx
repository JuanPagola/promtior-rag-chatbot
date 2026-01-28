import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, ScrollShadow, AlertDialog } from '@heroui/react';
import { ArrowUp, TrashBin, CircleQuestion } from '@gravity-ui/icons';
import { Header } from './Header';
import { Message, TypingIndicator } from './Message';
import { useChat } from '../hooks/useChat';

const SUGGESTED_QUESTIONS = [
  'What services does Promtior offer?',
  'When was Promtior founded?',
  "Who are Promtior's clients?",
  'What is a Bionic Organization?',
];

export function Chat() {
  const {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    inputRef,
    hasHistory,
    showSuggestions: initialShowSuggestions,
  } = useChat();

  const [input, setInput] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(initialShowSuggestions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync showSuggestions when initialShowSuggestions changes (e.g., after clear history)
  useEffect(() => {
    setShowSuggestions(initialShowSuggestions);
  }, [initialShowSuggestions]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage(input);
        setInput('');
      }
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Header
        hasHistory={hasHistory}
        onClearClick={() => setIsDeleteDialogOpen(true)}
      />

      <div className="flex flex-col flex-1 min-h-0">
        {/* Messages Area */}
        <ScrollShadow
          className="flex-1 overflow-y-auto chat-scroll"
          hideScrollBar={false}
          size={60}
        >
          <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-3xl mx-auto w-full">
            {messages.map((message, index) => (
              <Message key={index} {...message} />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </ScrollShadow>

        {/* Suggested Questions */}
        {showSuggestions && (
          <div className="px-4 sm:px-6 pb-2 max-w-3xl mx-auto w-full">
            <p className="text-xs text-[#A0AEC0] mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    sendMessage(question);
                    setShowSuggestions(false);
                  }}
                  className="px-3 py-1.5 text-xs rounded-full bg-[#16213E] text-[#4FD1C5] border border-[#4FD1C5]/30 hover:bg-[#4FD1C5]/10 hover:border-[#4FD1C5]/50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-footer border-t border-white/10 bg-[#1A1A2E]/80 backdrop-blur-sm p-4 sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 max-w-3xl mx-auto w-full"
          >
            {/* Suggestions toggle button */}
            <Button
              type="button"
              isIconOnly
              variant="ghost"
              onPress={() => setShowSuggestions(!showSuggestions)}
              className={`transition-colors ${
                showSuggestions
                  ? 'text-[#4FD1C5] hover:text-[#38B2AC] hover:bg-[#4FD1C5]/10'
                  : 'text-[#A0AEC0] hover:text-[#F7FAFC] hover:bg-white/5'
              }`}
              aria-label={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
            >
              <CircleQuestion className="w-5 h-5" />
            </Button>

            <Input
              ref={inputRef}
              className="flex-1"
              placeholder="Ask about Promtior..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="off"
            />
            <Button
              type="submit"
              isIconOnly
              isDisabled={!input.trim() || isLoading}
              className="bg-linear-to-r from-[#4FD1C5] to-[#38B2AC] text-[#1A1A2E] hover:opacity-90"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-[10px] sm:text-xs text-[#A0AEC0] text-center mt-2 sm:mt-3">
            <span className="hidden sm:inline">Promtior Assistant uses RAG to answer questions about Promtior</span>
            <span className="sm:hidden">Powered by RAG</span>
            {hasHistory && <span> • Saved locally</span>}
          </p>
        </div>

        {/* Delete Confirmation Modal */}
        <AlertDialog.Backdrop
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          variant="blur"
          className="bg-black/60"
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-100 bg-[#16213E] border border-white/10 shadow-2xl">
              <AlertDialog.CloseTrigger className="text-[#F7FAFC] bg-white/10 hover:bg-white/20 border border-white/10 rounded-md" />
              <AlertDialog.Header>
                <AlertDialog.Icon
                  status="warning"
                  className="bg-amber-500/20 text-amber-400"
                >
                  <TrashBin className="w-5 h-5" />
                </AlertDialog.Icon>
                <AlertDialog.Heading className="text-[#F7FAFC]">
                  Clear chat history?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-sm text-[#A0AEC0]">
                  This will permanently delete all {messages.length - 1} messages from your conversation history.
                  This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  onPress={() => setIsDeleteDialogOpen(false)}
                  className="text-[#F7FAFC] bg-white/10 hover:bg-white/20 border border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onPress={handleClearHistory}
                >
                  Clear History
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </div>
    </>
  );
}
