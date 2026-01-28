import { useState, useEffect, useCallback, useRef } from 'react';
import { sendChatMessage, ApiError } from '../api/client';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const STORAGE_KEY = 'promtior-chat-history';

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm the Promtior Assistant. I can help you learn about Promtior, our services, clients, and more. What would you like to know?",
  timestamp: new Date(),
};

const ERROR_MESSAGE = 'Sorry, I encountered an error while processing your request. Please make sure the backend server is running and try again.';

// Serialization helpers
function serializeMessages(messages: Message[]): string {
  return JSON.stringify(
    messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp?.toISOString(),
    }))
  );
}

function deserializeMessages(data: string): Message[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((msg: { role: 'user' | 'assistant'; content: string; timestamp?: string }) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
    }));
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function loadMessagesFromStorage(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const messages = deserializeMessages(stored);
      if (messages.length > 0) {
        return messages;
      }
    }
  } catch {
    // localStorage not available
  }
  return [WELCOME_MESSAGE];
}

function saveMessagesToStorage(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeMessages(messages));
  } catch {
    // localStorage not available or quota exceeded
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages to localStorage
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmedContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmedContent);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof ApiError
          ? `Error: ${error.message}`
          : ERROR_MESSAGE,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    clearStorage();
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    inputRef,
    hasHistory: messages.length > 1,
    showSuggestions: messages.length === 1,
  };
}
