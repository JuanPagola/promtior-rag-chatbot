import { LogoTelegram, TrashBin } from '@gravity-ui/icons';
import { Button } from '@heroui/react';

interface HeaderProps {
  hasHistory?: boolean;
  onClearClick?: () => void;
}

export function Header({ hasHistory, onClearClick }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 sm:px-6 border-b border-white/10 bg-[#1A1A2E]/80 backdrop-blur-sm">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#4FD1C5] to-[#38B2AC]">
        <LogoTelegram className="w-6 h-6 text-[#1A1A2E]" />
      </div>
      <div className="flex flex-col flex-1">
        <h1 className="text-lg font-semibold text-[#F7FAFC]">
          Promtior Assistant
        </h1>
        <p className="text-xs text-[#A0AEC0]">
          AI-powered knowledge base
        </p>
      </div>
      {hasHistory && onClearClick && (
        <Button
          isIconOnly
          variant="ghost"
          onPress={onClearClick}
          className="text-[#A0AEC0] hover:text-red-400 hover:bg-red-400/10"
          aria-label="Clear chat history"
        >
          <TrashBin className="w-5 h-5" />
        </Button>
      )}
    </header>
  );
}
