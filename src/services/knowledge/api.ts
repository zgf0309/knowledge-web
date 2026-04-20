// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/enhancedRequest';


export async function queryKnowledgeGroup(
  params: {
    // query
    /** tenant_id */
    tenant_id?: string;
    /** name */
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/group', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
export async function addKnowledgeTree(
  params: {
    // query
    /** name */
    name?: string;
    /** description */
    description?: string;
    /** parent_id */
    parent_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/group', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateKnowledgeTree(
  params: {
    // query
    /** group_id */
    group_id?: string;
    /** name */
    name?: string;
    /** description */
    description?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/group', {
    method: 'PUT',
    data: {
      ...params,
    },
    ...(options || {}),
  }); 
}

export async function getKnowledgeGroupInfo(
  params: {
    // query
    /** group_id */
    group_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/group/${params.group_id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function delKnowledgeTree(
  params: {
    // query
    /** group_id */
    group_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/group/${params.group_id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function queryKnowledgeList(
  params: {
    // query
    /** tenant_id */
    tenant_id?: string;
    /** knowledge_name */
    knowledge_name?: string;
    /** group_id */
    group_id?: string;
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
    /** page_num */
		page_num?: number;
    /** page_size */
		page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addKnowledgeList(
  params: {
    // query
    /** tenant_id */
    tenant_id?: string;
    /** knowledge_name */
    knowledge_name?: string;
    /** group_id */
    group_id?: string;
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
    /** page_num */
		page_num?: number;
    /** page_size */
		page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function queryKnowledgeDocList(
  params: {
    // query
    /** tenant_id */
    tenant_id?: string;
    /** knowledge_id */
		knowledge_id?: string;
    /** document_name */
		document_name?: string;
    /** status */
		status?: string;
    /** page_num */
		page_num?: number;
    /** page_size */
		page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addKnowledgeDoc(
  params: {
    /** tenant_id */
    tenant_id?: string;
    /** knowledge_id */
    knowledge_id: string;
    /** documents */
    documents: Array<Record<string, any>>;
    /** doc_category */
    doc_category: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc/import', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function queryEmbeddingModels(
  params?: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/embedding/models', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
