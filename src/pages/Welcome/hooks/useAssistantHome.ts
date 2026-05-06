import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_SUGGESTION_GROUPS } from '../constants';
import type { ConversationItem } from '../types';
import { pickRandom } from '../utils';

interface UseAssistantHomeReturn {
  historyCollapsed: boolean;
  toggleHistory: () => void;
  conversations: ConversationItem[];
  createConversation: (title: string, id?: string) => ConversationItem;
  question: string;
  setQuestion: (value: string) => void;
  knowledgeId: string | undefined;
  setKnowledgeId: (id: string | undefined) => void;
  suggestions: string[];
  refreshSuggestions: () => void;
}

export const useAssistantHome = (): UseAssistantHomeReturn => {
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [question, setQuestion] = useState('');
  const [knowledgeId, setKnowledgeId] = useState<string | undefined>(undefined);
  const [suggestionsSeed, setSuggestionsSeed] = useState(() => Date.now());

  const suggestions = useMemo(() => {
    void suggestionsSeed;
    return pickRandom(DEFAULT_SUGGESTION_GROUPS);
  }, [suggestionsSeed]);

  const toggleHistory = useCallback(() => {
    setHistoryCollapsed((value) => !value);
  }, []);

  const refreshSuggestions = useCallback(() => {
    setSuggestionsSeed(Date.now());
  }, []);

  const createConversation = useCallback((title: string, id?: string) => {
    const next: ConversationItem = {
      id: id ?? `conv-${Date.now()}`,
      title: title || '新对话',
      createdAt: Date.now(),
    };

    setConversations((current) => [next, ...current]);
    return next;
  }, []);

  return {
    historyCollapsed,
    toggleHistory,
    conversations,
    createConversation,
    question,
    setQuestion,
    knowledgeId,
    setKnowledgeId,
    suggestions,
    refreshSuggestions,
  };
};
