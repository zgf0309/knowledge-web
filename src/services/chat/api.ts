// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/enhancedRequest';

/**
 * 创建对话
 * POST /api/v1/chat/conversations
 */
export async function createConversation(
	data: {
		kb_id: string;
		title: string;
	},
	options?: { [key: string]: any },
) {
	return request<any>('/knowledge-api/api/v1/chat/conversations', {
		method: 'POST',
		data,
		...(options || {}),
	});
}

/**
 * 发送消息
 * POST /api/v1/chat/conversations/{conversation_id}/messages
 */
export async function sendChatMessage(
	conversationId: string,
	data: {
		content: string;
		stream?: boolean;
	},
	options?: { [key: string]: any },
) {
	return request<any>(
		`/knowledge-api/api/v1/chat/conversations/${conversationId}/messages`,
		{
			method: 'POST',
			data,
			...(options || {}),
		},
	);
}

/**
 * 获取对话历史
 * GET /api/v1/chat/conversations/{conversation_id}/messages
 */
export async function queryConversationMessages(
	conversationId: string,
	options?: { [key: string]: any },
) {
	return request<any>(
		`/knowledge-api/api/v1/chat/conversations/${conversationId}/messages`,
		{
			method: 'GET',
			...(options || {}),
		},
	);
}
