import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
	createConversation as apiCreateConversation,
	queryConversationMessages,
	sendChatMessage,
} from '@/services/chat/api';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessageItem {
	id: string;
	role: ChatRole;
	content: string;
	createdAt?: number;
}

const normalizeMessages = (raw: any): ChatMessageItem[] => {
	const list = raw?.data?.messages ?? raw?.data?.list ?? raw?.data ?? [];
	if (!Array.isArray(list)) return [];
	return list.map((item: any, idx: number) => ({
		id: String(item.id ?? item.message_id ?? idx),
		role: (item.role ?? item.sender ?? 'assistant') as ChatRole,
		content: String(item.content ?? item.text ?? ''),
		createdAt: item.created_at ?? item.createdAt,
	}));
};

const extractAssistantReply = (raw: any): string => {
	const data = raw?.data ?? raw;
	if (typeof data === 'string') return data;
	return (
		data?.answer ??
		data?.content ??
		data?.message?.content ??
		data?.reply ??
		''
	);
};

export const useChatSession = () => {
	const [conversationId, setConversationId] = useState<string | undefined>(undefined);
	const [messages, setMessages] = useState<ChatMessageItem[]>([]);

	const historyQuery = useQuery({
		queryKey: ['ChatConversationMessages', conversationId],
		queryFn: () => queryConversationMessages(conversationId as string),
		enabled: !!conversationId,
		select: (raw) => normalizeMessages(raw),
	});

	// 同步：当切换到已有会话且加载完成时，覆盖本地 messages（仅在本地为空时）
	useEffect(() => {
		if (!conversationId) return;
		if (!historyQuery.isFetched) return;
		if (!historyQuery.data) return;
		setMessages((prev) => (prev.length === 0 ? historyQuery.data ?? [] : prev));
	}, [conversationId, historyQuery.data, historyQuery.isFetched]);

	const createMutation = useMutation({
		mutationFn: (variables: { kb_id: string; title: string }) =>
			apiCreateConversation(variables),
	});

	const sendMutation = useMutation({
		mutationFn: (variables: { conversationId: string; content: string; stream?: boolean }) =>
			sendChatMessage(variables.conversationId, {
				content: variables.content,
				stream: variables.stream ?? false,
			}),
	});

	const resetSession = () => {
		setConversationId(undefined);
		setMessages([]);
	};

	const loadConversation = async (id: string) => {
		setConversationId(id);
		setMessages([]);
	};

	const submitQuestion = async (input: { content: string; kbId: string }): Promise<string> => {
		const content = input.content.trim();
		if (!content) throw new Error('content is empty');

		// 1. 没有当前会话则先创建
		let cid = conversationId;
		if (!cid) {
			const res = await createMutation.mutateAsync({
				kb_id: input.kbId,
				title: content.slice(0, 20) || '新对话',
			});
			cid =
				(res as any)?.data?.conversation_id ??
				(res as any)?.data?.id ??
				(res as any)?.conversation_id;
			if (!cid) throw new Error('创建对话失败：未返回 conversation_id');
			setConversationId(cid);
		}

		// 2. 本地立即显示用户消息
		const userMsg: ChatMessageItem = {
			id: `local-${Date.now()}`,
			role: 'user',
			content,
			createdAt: Date.now(),
		};
		setMessages((prev) => [...prev, userMsg]);

		// 3. 调用发送消息接口
		const reply = await sendMutation.mutateAsync({
			conversationId: cid,
			content,
			stream: false,
		});
		const replyContent = extractAssistantReply(reply);
		setMessages((prev) => [
			...prev,
			{
				id: `assistant-${Date.now()}`,
				role: 'assistant',
				content: replyContent || '（无回复内容）',
				createdAt: Date.now(),
			},
		]);

		return cid;
	};

	return {
		conversationId,
		messages,
		historyLoading: historyQuery.isFetching,
		creating: createMutation.isPending,
		sending: sendMutation.isPending,
		resetSession,
		loadConversation,
		submitQuestion,
	};
};
