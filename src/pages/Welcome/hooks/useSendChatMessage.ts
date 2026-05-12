import {
  type EventSourceMessage,
  EventStreamContentType,
  type FetchEventSourceInit,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import { buildAuthHeaders } from '@/utils/enhancedRequest';

type SendChatMessageData = {
  content: string;
  stream?: boolean;
};

type SendChatMessageOptions = Omit<
  FetchEventSourceInit,
  'body' | 'method' | 'onmessage'
> & {
  onMessage?: (message: any, event: EventSourceMessage) => void;
};

const toFetchHeaders = (
  headers: Record<string, unknown>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, String(value)]),
  );

const parseStreamPayload = (payload: string): any => {
  try {
    return JSON.parse(payload);
  } catch (_error) {
    return payload;
  }
};

const extractStreamContent = (message: any): string => {
  if (typeof message === 'string') {
    return message;
  }

  const data = message?.data ?? message;
  return String(
    data?.answer ??
      data?.text ??
      data?.content ??
      data?.delta ??
      data?.reply ??
      data?.message ??
      data?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      '',
  );
};

/**
 * 发送消息（SSE 流式）
 * POST /api/v1/chat/conversations/{conversation_id}/messages
 */
export async function sendChatMessage(
  conversationId: string,
  data: SendChatMessageData,
  options?: SendChatMessageOptions,
) {
  let fullContent = '';

  await fetchEventSource(
    `/knowledge-api/api/v1/chat/conversations/${conversationId}/messages`,
    {
      ...options,
      method: 'POST',
      headers: {
        ...toFetchHeaders(buildAuthHeaders()),
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(options?.headers ?? {}),
      },
      body: JSON.stringify({
        ...data,
        stream: data.stream ?? true,
      }),
      async onopen(response) {
        if (!response.ok) {
          throw new Error(`发送消息失败：${response.status}`);
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes(EventStreamContentType)) {
          throw new Error(
            `发送消息失败：接口未返回流式响应，当前 Content-Type 为 ${contentType || '空'}`,
          );
        }

        await options?.onopen?.(response);
      },
      onmessage(event) {
        console.log('onmessage', event);
        if (!event.data || event.data === '[DONE]') {
          return;
        }

        const message = parseStreamPayload(event.data);
        const content = extractStreamContent(message);

        if (content) {
          fullContent += content;
        }

        options?.onMessage?.(message, event);
      },
      onerror(error) {
        options?.onerror?.(error);
        throw error;
      },
    },
  );

  return fullContent;
}
