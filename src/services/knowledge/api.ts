// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/enhancedRequest';
export async function queryKnowledgeList(
  params: {
    // query
    /** tenant_id */
    tenant_id?: string;
    /** knowledge_name */
    knowledge_name?: string;
    /** user_id */
		user_id?: string;
    /** knowledge_id */
		knowledge_id?: string;
    /** scope */
		scope?: number;
    /** sort_field */
		sort_field?: string;
    /** sort_order */
		sort_order?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/ai/knowledge', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}