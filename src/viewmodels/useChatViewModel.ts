import { useCallback, useMemo, useState } from 'react';
import { generateAnswer } from '../services/aiService';

export interface Message {
  id: string;
  text: string;
  role: 'user' | 'bot';
}

const USER_PROMPT_LIMIT = 3;
const PROMPT_LIMIT_MESSAGE = 'You can ask up to 3 questions per article.';

export function useChatViewModel(articleContext: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const userPromptCount = useMemo(
    () => messages.filter((message) => message.role === 'user').length,
    [messages]
  );
  const promptLimitReached = userPromptCount >= USER_PROMPT_LIMIT;

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmedInput = text.trim();
      if (!trimmedInput || loading) return;

      if (userPromptCount >= USER_PROMPT_LIMIT) {
        setInput('');
        setMessages((prev) => {
          if (prev.some((message) => message.id === 'prompt-limit')) {
            return prev;
          }

          return [
            ...prev,
            {
              id: 'prompt-limit',
              text: PROMPT_LIMIT_MESSAGE,
              role: 'bot',
            },
          ];
        });
        return;
      }

      const userMessage: Message = {
        id: `${Date.now()}-user`,
        text: trimmedInput,
        role: 'user',
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setInput('');

      try {
        const responseText = await generateAnswer(trimmedInput, articleContext);

        const botMessage: Message = {
          id: `${Date.now()}-bot`,
          text: responseText,
          role: 'bot',
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch {
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          text: 'I am having trouble connecting right now. Please try again.',
          role: 'bot',
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [articleContext, loading, userPromptCount]
  );

  const generateSuggestions = useCallback((): string[] => {
    return [
      'What is this about?',
      'Why does this matter?',
      'What happens next?',
    ];
  }, []);

  return {
    messages,
    loading,
    input,
    setInput,
    sendMessage,
    generateSuggestions,
    promptLimit: USER_PROMPT_LIMIT,
    promptLimitReached,
    remainingPrompts: Math.max(USER_PROMPT_LIMIT - userPromptCount, 0),
  };
}
