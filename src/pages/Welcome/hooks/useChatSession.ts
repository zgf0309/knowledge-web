import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  createConversation as apiCreateConversation,
  queryConversationMessages,
} from '@/services/chat/api';
import type { ChatMessageItem } from '../types';
import {
  createLocalMessage,
  extractAssistantReply,
  normalizeMessages,
} from '../utils';
import { sendChatMessage } from './useSendChatMessage';

interface SubmitQuestionInput {
  content: string;
  kbId: string;
  tenantId: string;
}

export const useChatSession = () => {
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [sending, setSending] = useState(false);

  const historyQuery = useQuery({
    queryKey: ['ChatConversationMessages', conversationId],
    queryFn: () => queryConversationMessages(conversationId as string),
    enabled: !!conversationId,
    select: (raw) => normalizeMessages(raw),
  });

  useEffect(() => {
    if (!conversationId || !historyQuery.isFetched || !historyQuery.data)
      return;

    setMessages((prev) =>
      prev.length === 0 ? (historyQuery.data ?? []) : prev,
    );
  }, [conversationId, historyQuery.data, historyQuery.isFetched]);

  const createMutation = useMutation({
    mutationFn: (variables: {
      kb_id: string;
      title: string;
      tenant_id?: string;
    }) => apiCreateConversation(variables),
  });
  const { isPending: creating, mutateAsync: createConversation } =
    createMutation;

  const resetSession = useCallback(() => {
    setConversationId(undefined);
    setMessages([]);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setConversationId(id);
    setMessages([]);
  }, []);

  const ensureConversation = useCallback(
    async ({ content, kbId, tenantId }: SubmitQuestionInput) => {
      if (conversationId) return conversationId;

      const res = await createConversation({
        kb_id: kbId,
        title: content.slice(0, 20) || '新对话',
        tenant_id: tenantId,
      });
      const nextConversationId =
        (res as any)?.data?.conversation_id ??
        (res as any)?.data?.id ??
        (res as any)?.conversation_id;

      if (!nextConversationId) {
        throw new Error('创建对话失败：未返回 conversation_id');
      }

      setConversationId(nextConversationId);
      return nextConversationId as string;
    },
    [conversationId, createConversation],
  );

  const appendAssistantChunk = useCallback(
    (assistantId: string, content: string) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId ? { ...item, content } : item,
        ),
      );
    },
    [],
  );

  const submitQuestion = useCallback(
    async (input: SubmitQuestionInput): Promise<string> => {
      const content = input.content.trim();
      if (!content) throw new Error('content is empty');

      const cid = await ensureConversation({ ...input, content });

      setMessages((prev) => [
        ...prev,
        createLocalMessage('user', content, 'local'),
      ]);

      const assistantId = `assistant-${Date.now()}`;
      let assistantContent = '';
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: Date.now(),
        },
      ]);

      setSending(true);
      try {
        const reply = await sendChatMessage(
          cid,
          {
            content,
            stream: true,
          },
          {
            onMessage: (message) => {
              const chunkContent = extractAssistantReply(message);
              if (!chunkContent) return;

              assistantContent += chunkContent;
              appendAssistantChunk(assistantId, assistantContent);
            },
          },
        );

        if (!assistantContent) {
          assistantContent = extractAssistantReply(reply) || '（无回复内容）';
          appendAssistantChunk(assistantId, assistantContent);
        }
      } catch (error) {
        setMessages((prev) => prev.filter((item) => item.id !== assistantId));
        throw error;
      } finally {
        setSending(false);
      }

      return cid;
    },
    [appendAssistantChunk, ensureConversation],
  );

  return {
    conversationId,
    messages,
    historyLoading: historyQuery.isFetching,
    creating,
    sending,
    resetSession,
    loadConversation,
    submitQuestion,
  };
};
