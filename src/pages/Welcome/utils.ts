import type { ChatMessageItem, ChatRole, KnowledgeGroupItem } from './types';

export const pickRandom = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

export const createLocalMessage = (
  role: ChatRole,
  content: string,
  idPrefix: string = role,
): ChatMessageItem => ({
  id: `${idPrefix}-${Date.now()}`,
  role,
  content,
  createdAt: Date.now(),
});

export const normalizeMessages = (raw: any): ChatMessageItem[] => {
  const list = raw?.data?.messages ?? raw?.data?.list ?? raw?.data ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((item: any, idx: number) => ({
    id: String(item.id ?? item.message_id ?? idx),
    role: (item.role ?? item.sender ?? 'assistant') as ChatRole,
    content: String(item.content ?? item.text ?? ''),
    createdAt: item.created_at ?? item.createdAt,
  }));
};

export const extractAssistantReply = (raw: any): string => {
  const data = raw?.data ?? raw;
  if (typeof data === 'string') return data;

  return (
    data?.answer ?? data?.content ?? data?.message?.content ?? data?.reply ?? ''
  );
};

export const flattenGroups = (
  groups: KnowledgeGroupItem[] = [],
  acc: KnowledgeGroupItem[] = [],
): KnowledgeGroupItem[] => {
  for (const group of groups) {
    acc.push(group);
    if (group.children?.length) flattenGroups(group.children, acc);
  }

  return acc;
};
