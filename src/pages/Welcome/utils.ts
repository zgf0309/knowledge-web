import type {
  ChatMessageItem,
  ChatRole,
  KnowledgeGroupItem,
  ReferenceItem,
} from './types';

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

  return list.map((item: any, idx: number) => {
    const refs = extractReferences(item);

    return {
      id: String(item.id ?? item.message_id ?? idx),
      role: (item.role ?? item.sender ?? 'assistant') as ChatRole,
      content: String(item.content ?? item.text ?? ''),
      createdAt: item.created_at ?? item.createdAt,
      references: refs.length > 0 ? refs : undefined,
      thinking: extractThinking(item),
    };
  });
};

export const extractAssistantReply = (raw: any): string => {
  const data = raw?.data ?? raw;
  if (typeof data === 'string') return data;

  if (raw?.type === 'reasoning' || data?.type === 'reasoning') return '';

  return (
    data?.answer ?? data?.content ?? data?.message?.content ?? data?.reply ?? ''
  );
};

const normalizeReference = (ref: any, index: number): ReferenceItem => ({
  id: String(ref.id ?? ref.doc_id ?? ref.document_id ?? ref.chunk_id ?? index),
  title: String(
    ref.title ??
      ref.name ??
      ref.document_name ??
      ref.file_name ??
      ref.knowledge_name ??
      `召回片段 ${index + 1}`,
  ),
  snippet: String(
    ref.snippet ??
      ref.content ??
      ref.text ??
      ref.description ??
      ref.chunk ??
      '',
  ),
  content: ref.content,
  knowledge_name: ref.knowledge_name ?? ref.kb_name ?? ref.dataset_name ?? '',
  score: ref.score ?? ref.relevance ?? ref.similarity ?? undefined,
  source: ref.source ?? ref.url ?? ref.path ?? '',
  metadata: ref.metadata,
});

export const extractReferences = (raw: any): ReferenceItem[] => {
  const data = raw?.data ?? raw;
  const refs =
    data?.references ??
    data?.sources ??
    data?.documents ??
    data?.refs ??
    data?.retrieval ??
    data?.retrieved_documents ??
    data?.context;

  if (!Array.isArray(refs)) return [];
  return refs.map(normalizeReference);
};

export const extractThinking = (raw: any): string => {
  const data = raw?.data ?? raw;
  if (typeof data === 'string') return '';

  if (raw?.type === 'done' || data?.type === 'done') return '';

  return String(
    data?.reasoning_content ??
      data?.thinking ??
      data?.reasoning ??
      data?.thought ??
      data?.process ??
      data?.analysis ??
      '',
  );
};

export const formatReferencesAsThinking = (references: ReferenceItem[] = []) =>
  references
    .map((item, index) => {
      const content = item.content || item.snippet || '';
      if (!content) return '';

      return `• 召回片段 ${index + 1}\n${content}`;
    })
    .filter(Boolean)
    .join('\n\n');

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
