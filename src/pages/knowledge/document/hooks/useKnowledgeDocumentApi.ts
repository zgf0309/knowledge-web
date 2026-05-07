import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  addKnowledgeDocCustomChunk,
  delKnowledgeDocChunk,
  optKnowledgeDocCustomInsight,
  queryKnowledgeDocChunks,
  queryKnowledgeDocMdcontent,
  udpdateKnowledgeDocCustomChunk,
} from '@/services/knowledge/api';
import type { KnowledgeChunkItem, KnowledgeDocMeta } from '../models';

export interface DocumentApiContext {
  tenantId: string;
  knowledgeId: string;
  documentId: string;
}

interface UseKnowledgeDocumentApiOptions extends DocumentApiContext {
  pageNo: number;
  pageSize: number;
  enableMdContent?: boolean;
}

interface ChunksResponse {
  doc?: KnowledgeDocMeta;
  chunks?: KnowledgeChunkItem[];
  total?: number;
}

const isOk = (res: any) => res?.code === 200;

export const useKnowledgeDocumentApi = ({
  tenantId,
  knowledgeId,
  documentId,
  pageNo,
  pageSize,
  enableMdContent = true,
}: UseKnowledgeDocumentApiOptions) => {
  const ctx = useMemo<DocumentApiContext>(
    () => ({ tenantId, knowledgeId, documentId }),
    [tenantId, knowledgeId, documentId],
  );

  const chunksQuery = useQuery({
    queryKey: ['KnowledgeDocChunks', ctx, pageNo, pageSize],
    queryFn: () =>
      queryKnowledgeDocChunks({
        tenant_id: tenantId,
        knowledge_id: knowledgeId,
        document_id: documentId,
        page_no: pageNo,
        page_size: pageSize,
      }),
    select: (s: any) => s?.data as ChunksResponse | undefined,
    enabled: !!documentId,
  });

  const objectKey = chunksQuery.data?.doc?.location ?? '';

  const mdcontentQuery = useQuery({
    queryKey: ['KnowledgeDocMdcontent', ctx, objectKey],
    queryFn: () =>
      queryKnowledgeDocMdcontent({
        tenant_id: tenantId,
        object_key: objectKey,
      }),
    select: (s: any) => s?.data?.content as string | undefined,
    enabled: enableMdContent && !!documentId && !!objectKey,
  });

  const refetchChunks = () => chunksQuery.refetch();

  const createChunk = async (content: string) => {
    const res: any = await addKnowledgeDocCustomChunk({
      tenant_id: tenantId,
      knowledge_id: knowledgeId,
      document_id: documentId,
      content,
      available: true,
    });
    return isOk(res);
  };

  const updateChunk = async (
    chunkId: string,
    content: string,
    available = true,
  ) => {
    const res: any = await udpdateKnowledgeDocCustomChunk({
      tenant_id: tenantId,
      knowledge_id: knowledgeId,
      document_id: documentId,
      chunk_id: chunkId,
      content,
      available,
      run_embedding: false,
    });
    return isOk(res);
  };

  const toggleChunk = async (chunk: KnowledgeChunkItem, enabled: boolean) =>
    updateChunk(chunk.id, chunk.content, enabled);

  const copyChunk = async (chunk: KnowledgeChunkItem) =>
    createChunk(`${chunk.content}（副本）`);

  const deleteChunk = async (chunkId: string) => {
    const res: any = await delKnowledgeDocChunk({
      tenant_id: tenantId,
      knowledge_id: knowledgeId,
      document_id: documentId,
      chunk_id: chunkId,
    });
    return isOk(res);
  };

  const submitInsight = async (
    chunkId: string,
    action: 'create' | 'update' | 'delete',
    explanation: string,
  ) => {
    const res: any = await optKnowledgeDocCustomInsight({
      tenant_id: tenantId,
      knowledge_id: knowledgeId,
      document_id: documentId,
      chunk_id: chunkId,
      explanation,
      action,
    });
    return isOk(res);
  };

  return {
    chunksQuery,
    mdcontentQuery,
    doc: chunksQuery.data?.doc,
    chunks: chunksQuery.data?.chunks ?? [],
    reportContent: mdcontentQuery.data ?? '',
    refetchChunks,
    mutations: {
      createChunk,
      updateChunk,
      toggleChunk,
      copyChunk,
      deleteChunk,
      submitInsight,
    },
  };
};

export type KnowledgeDocumentApi = ReturnType<typeof useKnowledgeDocumentApi>;
