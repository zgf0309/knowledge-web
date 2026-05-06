import { PageContainer } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Flex, Modal, message } from 'antd';
import { useState } from 'react';
import { useTenantId } from '@/hooks/useTenantId';
import type { KnowledgeFileRecord } from '../types';
import ChunkEditorModal from './components/ChunkEditorModal';
import DocumentChunkPanel from './components/DocumentChunkPanel';
import DocumentHeader from './components/DocumentHeader';
import DocumentInsightPanel from './components/DocumentInsightPanel';
import DocumentPreviewPanel from './components/DocumentPreviewPanel';
import InsightEditorModal from './components/InsightEditorModal';
import { useEditorModal } from './hooks/useEditorModal';
import { useKnowledgeDocumentApi } from './hooks/useKnowledgeDocumentApi';
import { useKnowledgeDocumentController } from './hooks/useKnowledgeDocumentController';
import type { KnowledgeChunkItem } from './models';
import type { ChunkFormValues, InsightFormValues } from './types';
import './index.less';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10 };

const KnowledgeDocumentPage = () => {
  const location = useLocation();
  const locationState = location.state as
    | { record?: KnowledgeFileRecord }
    | undefined;
  const record = locationState?.record;

  const tenantId = useTenantId();
  const knowledgeId = record?.knowledge_id ?? '';
  const documentId = record?.document_id ?? '';

  const [pagination] = useState(DEFAULT_PAGINATION);

  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const api = useKnowledgeDocumentApi({
    tenantId,
    knowledgeId,
    documentId,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  });

  const controller = useKnowledgeDocumentController({ chunks: api.chunks });

  const chunkEditor = useEditorModal<ChunkFormValues>({ content: '' });
  const insightEditor = useEditorModal<InsightFormValues>({ content: '' });

  // ---------- 切片 ----------
  const handleSubmitChunk = async () => {
    try {
      const { content } = await chunkEditor.form.validateFields();
      const trimmed = content.trim();
      const ok = chunkEditor.editingId
        ? await api.mutations.updateChunk(chunkEditor.editingId, trimmed)
        : await api.mutations.createChunk(trimmed);
      if (ok) {
        messageApi.success(chunkEditor.editingId ? '切片已更新' : '切片已创建');
        chunkEditor.close();
        api.refetchChunks();
      } else {
        messageApi.error(
          chunkEditor.editingId ? '切片更新失败' : '切片创建失败',
        );
      }
    } catch (err) {
      if (err && (err as any).errorFields) return; // 表单校验失败，已展示
      messageApi.error('操作失败，请重试');
    }
  };

  const handleToggleChunk = async (chunkId: string, enabled: boolean) => {
    const target = api.chunks.find((c) => c.id === chunkId);
    if (!target) return;
    const ok = await api.mutations.toggleChunk(target, enabled);
    if (ok) {
      messageApi.success(enabled ? '切片已启用' : '切片已停用');
      api.refetchChunks();
    } else {
      messageApi.error('操作失败');
    }
  };

  const handleCopyChunk = async (chunk: KnowledgeChunkItem) => {
    const ok = await api.mutations.copyChunk(chunk);
    if (ok) {
      messageApi.success('切片已复制');
      api.refetchChunks();
    } else {
      messageApi.error('切片复制失败');
    }
  };

  const handleDeleteChunk = (chunk: KnowledgeChunkItem) => {
    modal.confirm({
      title: `确认删除 ${chunk.label} 吗？`,
      content: '删除后不可恢复，关联知识点将不再展示。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        const ok = await api.mutations.deleteChunk(chunk.id);
        if (ok) {
          messageApi.success('切片已删除');
          api.refetchChunks();
        } else {
          messageApi.error('切片删除失败');
        }
      },
    });
  };

  // ---------- 知识点 ----------
  const handleOpenCreateInsight = () => {
    if (!controller.currentChunkId) {
      messageApi.warning('请先选择一个切片');
      return;
    }
    insightEditor.openCreate();
  };

  const handleOpenEditInsight = (insightId: string) => {
    const target = controller.visibleInsights.find(
      (item) => item.id === insightId,
    );
    if (!target) return;
    insightEditor.openEdit(insightId, { content: target.content });
  };

  const handleSubmitInsight = async () => {
    try {
      const { content } = await insightEditor.form.validateFields();
      const trimmed = content.trim();
      const action = insightEditor.editingId ? 'update' : 'create';
      const ok = await api.mutations.submitInsight(
        controller.currentChunkId,
        action,
        trimmed,
      );
      if (ok) {
        messageApi.success(
          action === 'update' ? '知识点已更新' : '知识点已创建',
        );
        insightEditor.close();
        api.refetchChunks();
      } else {
        messageApi.error(
          action === 'update' ? '知识点更新失败' : '知识点创建失败',
        );
      }
    } catch (err) {
      if (err && (err as any).errorFields) return;
      messageApi.error('操作失败，请重试');
    }
  };

  const handleDeleteInsight = (insightId: string) => {
    const target = controller.visibleInsights.find(
      (item) => item.id === insightId,
    );
    if (!target) return;
    modal.confirm({
      title: '确认删除该知识点吗？',
      content: '删除后不可恢复。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        const ok = await api.mutations.submitInsight(
          target.chunkId,
          'delete',
          insightId,
        );
        if (ok) {
          messageApi.success('知识点已删除');
          api.refetchChunks();
        } else {
          messageApi.error('知识点删除失败');
        }
      },
    });
  };

  return (
    <PageContainer className="knowledge-document-page" title={false}>
      {messageContextHolder}
      {modalContextHolder}
      <DocumentHeader
        title={api.doc?.doc_name ?? record?.doc_name ?? ''}
        documentId={api.doc?.document_id ?? documentId}
      />
      <Flex style={{ height: 'calc(100vh - 200px)' }} gap={12}>
        <div className="knowledge-document-page__layout">
          <DocumentPreviewPanel
            reportContent={api.reportContent}
            loading={api.mdcontentQuery.isFetching}
          />
          <DocumentChunkPanel
            filteredChunks={controller.filteredChunks}
            pagedChunks={controller.pagedChunks}
            chunkCount={controller.chunks.length}
            chunkPage={controller.chunkPage}
            currentChunkId={controller.currentChunkId}
            searchKeyword={controller.searchKeyword}
            sourceFilter={controller.sourceFilter}
            statusFilter={controller.statusFilter}
            sourceSummary={controller.chunkSourceSummary}
            onSearchChange={controller.handleSearchChange}
            onSourceFilterChange={controller.setSourceFilter}
            onStatusFilterChange={controller.setStatusFilter}
            onCreateChunk={() => chunkEditor.openCreate()}
            onSelectChunk={controller.setActiveChunkId}
            onEditChunk={(chunk) =>
              chunkEditor.openEdit(chunk.id, { content: chunk.content })
            }
            onCopyChunk={handleCopyChunk}
            onToggleChunk={handleToggleChunk}
            onDeleteChunk={handleDeleteChunk}
            onPageChange={controller.setChunkPage}
            loading={api.chunksQuery.isFetching}
          />
          <DocumentInsightPanel
            visibleInsights={controller.visibleInsights}
            onCreateInsight={handleOpenCreateInsight}
            onEditInsight={handleOpenEditInsight}
            onDeleteInsight={handleDeleteInsight}
          />
        </div>
      </Flex>
      <ChunkEditorModal
        open={chunkEditor.open}
        editingChunkId={chunkEditor.editingId}
        form={chunkEditor.form}
        initialValues={chunkEditor.initialValues}
        onCancel={chunkEditor.close}
        onSubmit={handleSubmitChunk}
      />
      <InsightEditorModal
        open={insightEditor.open}
        editingInsightId={insightEditor.editingId}
        form={insightEditor.form}
        initialValues={insightEditor.initialValues}
        onCancel={insightEditor.close}
        onSubmit={handleSubmitInsight}
      />
    </PageContainer>
  );
};

export default KnowledgeDocumentPage;
