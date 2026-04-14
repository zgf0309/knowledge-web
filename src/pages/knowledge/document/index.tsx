import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Flex } from 'antd';
import { useMemo } from 'react';
import { INITIAL_RECORDS } from '../constants';
import type { KnowledgeFileRecord } from '../types';
import ChunkEditorModal from './components/ChunkEditorModal';
import DocumentChunkPanel from './components/DocumentChunkPanel';
import DocumentHeader from './components/DocumentHeader';
import DocumentInsightPanel from './components/DocumentInsightPanel';
import DocumentPreviewPanel from './components/DocumentPreviewPanel';
import InsightEditorModal from './components/InsightEditorModal';
import { useKnowledgeDocumentController } from './hooks/useKnowledgeDocumentController';
import { getKnowledgeDocumentDetail } from './mock';
import './index.less';

const KnowledgeDocumentPage = () => {
	const params = useParams<{ id: string }>();

	const record = useMemo<KnowledgeFileRecord | undefined>(
		() => INITIAL_RECORDS.find((item) => item.id === params.id),
		[params.id],
	);
	const detail = useMemo(() => getKnowledgeDocumentDetail(record ?? null), [record]);
	const controller = useKnowledgeDocumentController({ detail, record });

	return (
		<PageContainer className="knowledge-document-page" title={false}>
			{controller.messageContextHolder}
			{controller.modalContextHolder}
			<DocumentHeader title={record?.name ?? detail.previewTitle} documentId={record?.id ?? params.id ?? ''} />
      <Flex style={{ height: 'calc(100vh - 200px)' }} gap={12}>
        <div className="knowledge-document-page__layout">
          <DocumentPreviewPanel detail={controller.detail} />
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
            onCreateChunk={controller.openCreateModal}
            onSelectChunk={controller.setActiveChunkId}
            onEditChunk={controller.openEditModal}
            onCopyChunk={controller.handleCopyChunk}
            onToggleChunk={controller.handleToggleChunk}
            onDeleteChunk={controller.handleDeleteChunk}
            onPageChange={controller.setChunkPage}
          />
          <DocumentInsightPanel
            visibleInsights={controller.visibleInsights}
            onCreateInsight={controller.openCreateInsightModal}
            onEditInsight={controller.openEditInsightModal}
            onDeleteInsight={controller.handleDeleteInsight}
          />
        </div>
      </Flex>
			<ChunkEditorModal
				open={controller.chunkModalOpen}
				editingChunkId={controller.editingChunkId}
				form={controller.chunkForm}
				onCancel={controller.closeChunkModal}
				onSubmit={controller.handleSubmitChunk}
			/>
			<InsightEditorModal
				open={controller.insightModalOpen}
				editingInsightId={controller.editingInsightId}
				form={controller.insightForm}
				onCancel={controller.closeInsightModal}
				onSubmit={controller.handleSubmitInsight}
			/>
		</PageContainer>
	);
};

export default KnowledgeDocumentPage;