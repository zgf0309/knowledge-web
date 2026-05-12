// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/enhancedRequest';
import { s } from 'nuqs/dist/context-BE-tNWKb';

const omitTenantId = <T extends Record<string, any> | undefined>(params: T) => {
  if (!params) return {};
  const rest = { ...params };
  delete rest[['tenant', 'id'].join('_')];
  return rest;
};

/**
 * 查询知识库分组（知识树）列表
 * @param params.name 分组名称（可选，用于过滤）
 */
export async function queryKnowledgeGroup(
  params: {
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/group', {
    method: 'GET',
    params: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}
/**
 * 新增知识库分组节点（新建知识树）
 * @param params.name 分组名称
 * @param params.description 分组描述
 * @param params.parent_id 父节点 ID，为空表示顶级节点
 */
export async function addKnowledgeTree(
  params: {
    name?: string;
    description?: string;
    parent_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/group', {
    method: 'POST',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 更新知识库分组信息
 * @param params.group_id 分组 ID
 * @param params.name 新的分组名称
 * @param params.description 新的分组描述
 */
export async function updateKnowledgeTree(
  params: {
    group_id?: string;
    name?: string;
    description?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/group', {
    method: 'PUT',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  }); 
}

/**
 * 获取指定知识库分组的详细信息
 * @param params.group_id 分组 ID
 */
export async function getKnowledgeGroupInfo(
  params: {
    group_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/group/${params.group_id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 删除知识库分组节点
 * @param params.group_id 要删除的分组 ID
 */
export async function delKnowledgeTree(
  params: {
    group_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/group`, {
    method: 'DELETE',
    data: { 
      ...omitTenantId(params) 
    },
    ...(options || {}),
  });
}

/**
 * 查询知识库列表（支持分页、排序、过滤）
 * @param params.knowledge_name 知识库名称（模糊查询）
 * @param params.group_id 所属分组 ID
 * @param params.user_id 归属用户 ID
 * @param params.knowledge_id 知识库 ID
 * @param params.scope 可见范围（如私有 / 共享）
 * @param params.sort_field 排序字段
 * @param params.sort_order 排序方式（asc / desc）
 * @param params.page_num 页码
 * @param params.page_size 每页条数
 */
export async function queryKnowledgeList(
  params: {
    knowledge_name?: string;
    group_id?: string;
    user_id?: string;
    knowledge_id?: string;
    scope?: number;
    sort_field?: string;
    sort_order?: string;
    page_num?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge', {
    method: 'GET',
    params: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 创建知识库
 * @param params.knowledge_name 知识库名称
 * @param params.group_id 归属分组 ID
 * @param params.user_id 创建者用户 ID
 * @param params.scope 可见范围
 */
export async function addKnowledgeList(
  params: {
    knowledge_name?: string;
    group_id?: string;
    user_id?: string;
    knowledge_id?: string;
    scope?: number;
    sort_field?: string;
    sort_order?: string;
    page_num?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge', {
    method: 'POST',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 删除知识库
 * @param params.knowledge_id 要删除的知识库 ID
 */
export async function delKnowledgeList(
  params: {
    knowledge_id?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge`, {
    method: 'DELETE',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 查询知识库下的文档列表
 * @param params.knowledge_id 知识库 ID
 * @param params.document_name 文档名称（模糊查询）
 * @param params.status 文档状态（如 available / processing）
 * @param params.page_num 页码
 * @param params.page_size 每页条数
 */
export async function queryKnowledgeDocList(
  params: {
    knowledge_id?: string;
    document_name?: string;
    status?: string;
    page_num?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc', {
    method: 'GET',
    params: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 按文件类型导入文档到知识库
 * @param params.knowledge_id 目标知识库 ID
 * @param params.documents 待导入的文档列表
 * @param params.doc_category 文档分类（如 text / table / image / audio / web）
 */
export async function addKnowledgeDoc(
  params: {
    knowledge_id: string;
    documents: Array<Record<string, any>>;
    doc_category: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc/import', {
    method: 'POST',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 按模板导入文档到知识库（如简历 / 论文 / 问答对 等模板）
 * @param params.knowledge_id 目标知识库 ID
 * @param params.documents 待导入的文档列表
 */
export async function addKnowledgeDocTemplate(
  params: {
    knowledge_id: string;
    documents: Array<Record<string, any>>;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc/import-template', {
    method: 'POST',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 删除知识库下的文档（支持批量）
 * @param params.doc_ids 要删除的文档 ID，多个以逗号分隔
 */
export async function delKnowledgeDoc(
  params: {
    doc_ids?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/doc`, {
    method: 'DELETE',
    data: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 启动文档解析（运行解析/切片/向量化流程）
 * @param params.doc_ids 要运行解析的文档 ID 列表
 * @param params.force 是否强制重新解析已完成的文档
 */
export async function runKnowledgeDoc(
  params: {
    doc_ids?: string[];
    force: boolean;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/doc/run`, {
    method: 'POST',
    data: { ...omitTenantId(params) },
    ...(options || {}),
  })
}

/**
 * 停止文档解析任务
 * @param params.doc_ids 要停止的文档 ID 列表
 */
export async function stopKnowledgeDoc(
  params: {
    doc_ids?: string[];
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/doc/stop`, {
    method: 'POST',
    data: { ...omitTenantId(params) },
    ...(options || {}),
  })
}

/**
 * 获取文档对应的 Markdown 源内容（用于预览原文）
 * @param params.object_key 对象存储中的文件 key
 */
export async function queryKnowledgeDocMdcontent(
  params: {
    object_key?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/mdcontent`, {
    method: 'GET',
    params: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}

/**
 * 分页查询文档的切片（chunk）列表
 * @param params.knowledge_id 知识库 ID
 * @param params.document_id 文档 ID
 * @param params.page_no 页码
 * @param params.page_size 每页条数
 */
export async function queryKnowledgeDocChunks(
  params: {
    knowledge_id?: string;
    document_id?: string;
    page_no?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/knowledge-api/api/v1/ai/knowledge/doc/chunk`, {
    method: 'GET',
    params: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}


/**
 * 新增自定义切片（chunk）
 * @param params.knowledge_id 知识库 ID
 * @param params.document_id 文档 ID
 * @param params.content 切片内容
 * @param params.available 切片是否可用（启用/停用）
 */
export async function addKnowledgeDocCustomChunk(
  params: {
    knowledge_id: string;
    document_id: string;
    content: string;
    available: boolean;
  }
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc/chunk/custom', {
    method: 'POST',
    data: {
      ...omitTenantId(params),
    },
  });
}

/**
 * 编辑切片内容（chunk）
 * @param params.knowledge_id 知识库 ID
 * @param params.document_id 文档 ID
 * @param params.chunk_id 切片 ID
 * @param params.content 切片内容
 * @param params.available 切片是否可用（启用/停用）
 * @param params.run_embedding 是否重新运行向量化（默认为 false，更新内容但不变更向量时可不传或传 false）
 */
export async function udpdateKnowledgeDocCustomChunk(
  params: {
    knowledge_id: string;
    document_id: string;
    chunk_id: string;
    content: string;
    available: boolean;
    run_embedding?: boolean;
  }
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc/chunk/edit', {
    method: 'POST',
    data: {
      ...omitTenantId(params),
    },
  });
}

/**
 * 删除切片（chunk）
 * @param params.knowledge_id 知识库 ID
 * @param params.document_id 文档 ID
 * @param params.chunk_id 切片 ID
 */
export async function delKnowledgeDocChunk(
  params: {
    knowledge_id: string;
    document_id: string;
    chunk_id: string;
  },
) {
  return request<any>('/knowledge-api/api/v1/ai/knowledge/doc/chunk', {
    method: 'DELETE',
    data: {
      ...omitTenantId(params),
    },
  });
}

/**
   * 切片知识点（insight）
   * @param params.knowledge_id 知识库 ID
   * @param params.document_id 文档 ID
   * @param params.chunk_id 切片 ID
   * @param params.explanation 切片知识点内容
   * @param params.action 操作标签（如“原文返回”）
   */
  export async function optKnowledgeDocCustomInsight(
    params: {
      knowledge_id: string;
      document_id: string;
      chunk_id: string;
      explanation: string;
      action: string;
    }
  ) {
    return request<any>('/knowledge-api/ai/knowledge/doc/chunk/keyword', {
      method: 'POST',
      data: {
        ...omitTenantId(params),
      },
    });
  }




/**
 * 获取可用的 Embedding 向量化模型列表
 * @param params 预留查询参数
 */
export async function queryEmbeddingModels(
  params?: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/ai/embedding/models', {
    method: 'GET',
    params: {
      ...omitTenantId(params),
    },
    ...(options || {}),
  });
}
