const API_URL = import.meta.env.VITE_API_URL || '';

const TIMEOUT_MS = 120000; // 120 seconds (accounts for cold start on free tier)

export interface ChatResponse {
  output: string;
}

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function sendChatMessage(input: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/promtior/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `Failed to send message: ${response.statusText}`,
        response.status
      );
    }

    const data: ChatResponse = await response.json();
    return data.output || 'Sorry, I could not process your request.';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    throw error;
  }
}

export async function streamChatMessage(
  input: string,
  onChunk: (chunk: string) => void,
  onComplete?: () => void
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS * 2); // Longer timeout for streaming

  try {
    const response = await fetch(`${API_URL}/promtior/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `Failed to stream message: ${response.statusText}`,
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('Stream not available', 500);
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });

      // Parse SSE format: data: {"content": "..."}\n\n
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            if (jsonStr.trim() === '[DONE]') continue;
            const data = JSON.parse(jsonStr);
            if (data.content) {
              onChunk(data.content);
            }
          } catch {
            // Not valid JSON, might be partial data
          }
        }
      }
    }

    onComplete?.();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    throw error;
  }
}
