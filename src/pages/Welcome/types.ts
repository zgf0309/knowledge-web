export interface ConversationItem {
  id: string;
  title: string;
  createdAt: number;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ReferenceItem {
  id: string;
  title: string;
  snippet?: string;
  content?: string;
  knowledge_name?: string;
  score?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessageItem {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: number;
  thinking?: string;
  thinkingTime?: number;
  thinkingStatus?: 'thinking' | 'done';
}

export interface KnowledgeItem {
  knowledge_id: string;
  knowledge_name: string;
  description?: string;
}

export interface KnowledgeGroupItem {
  group_id?: string;
  id?: string;
  name?: string;
  group_name?: string;
  children?: KnowledgeGroupItem[];
}
