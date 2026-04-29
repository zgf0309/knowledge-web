import { useMemo, useState } from 'react';
import type { AssistantMode } from './constants';
import { DEFAULT_SUGGESTION_GROUPS } from './constants';

export interface ConversationItem {
	id: string;
	title: string;
	createdAt: number;
	mode: AssistantMode;
}

interface UseAssistantHomeReturn {
	/** 侧栏折叠状态 */
	historyCollapsed: boolean;
	toggleHistory: () => void;
	/** 历史会话 */
	conversations: ConversationItem[];
	createConversation: (title: string, mode: AssistantMode, id?: string) => ConversationItem;
	/** 当前模式 */
	mode: AssistantMode;
	setMode: (mode: AssistantMode) => void;
	/** 输入内容 */
	question: string;
	setQuestion: (value: string) => void;
	/** 选中知识库 */
	knowledgeId: string | undefined;
	setKnowledgeId: (id: string | undefined) => void;
	/** 当前展示的推荐项（每次刷新随机一组） */
	suggestions: string[];
	refreshSuggestions: () => void;
}

const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const useAssistantHome = (): UseAssistantHomeReturn => {
	const [historyCollapsed, setHistoryCollapsed] = useState(true);
	const [conversations, setConversations] = useState<ConversationItem[]>([]);
	const [mode, setMode] = useState<AssistantMode>('qa');
	const [question, setQuestion] = useState('');
	const [knowledgeId, setKnowledgeId] = useState<string | undefined>(undefined);
	const [suggestionsSeed, setSuggestionsSeed] = useState(() => Date.now());

	const suggestions = useMemo(() => {
		// suggestionsSeed 仅用于触发重算
		void suggestionsSeed;
		return pickRandom(DEFAULT_SUGGESTION_GROUPS);
	}, [suggestionsSeed]);

	const toggleHistory = () => setHistoryCollapsed((v) => !v);

	const refreshSuggestions = () => setSuggestionsSeed(Date.now());

	const createConversation = (title: string, conversationMode: AssistantMode, id?: string) => {
		const next: ConversationItem = {
			id: id ?? `conv-${Date.now()}`,
			title: title || '新对话',
			createdAt: Date.now(),
			mode: conversationMode,
		};
		setConversations((current) => [next, ...current]);
		return next;
	};

	return {
		historyCollapsed,
		toggleHistory,
		conversations,
		createConversation,
		mode,
		setMode,
		question,
		setQuestion,
		knowledgeId,
		setKnowledgeId,
		suggestions,
		refreshSuggestions,
	};
};
