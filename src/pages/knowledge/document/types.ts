import type { FormInstance } from 'antd';
import type { KnowledgeChunkItem, KnowledgeDocumentDetail, KnowledgeInsightItem } from './mock';

export type ChunkSourceType = KnowledgeChunkItem['sourceType'];
export type SourceFilterValue = '全部' | '原文切片' | '自定义切片';
export type StatusFilterValue = '全部状态' | '已启用' | '已停用';

export interface ChunkFormValues {
	sourceType: ChunkSourceType;
	content: string;
}

export interface InsightFormValues {
	title: string;
	content: string;
	source: string;
	actionLabel: string;
}

export interface ChunkSourceSummary {
	all: number;
	original: number;
	custom: number;
}

export interface ChunkEditorModalProps {
	open: boolean;
	editingChunkId: string | null;
	form: FormInstance<ChunkFormValues>;
	onCancel: () => void;
	onSubmit: () => void;
}

export interface InsightEditorModalProps {
	open: boolean;
	editingInsightId: string | null;
	form: FormInstance<InsightFormValues>;
	onCancel: () => void;
	onSubmit: () => void;
}

export interface KnowledgeDocumentState {
	detail: KnowledgeDocumentDetail;
	chunks: KnowledgeChunkItem[];
	insights: KnowledgeInsightItem[];
	filteredChunks: KnowledgeChunkItem[];
	pagedChunks: KnowledgeChunkItem[];
	visibleInsights: KnowledgeInsightItem[];
	chunkSourceSummary: ChunkSourceSummary;
	currentChunkId: string;
	searchKeyword: string;
	sourceFilter: SourceFilterValue;
	statusFilter: StatusFilterValue;
	chunkPage: number;
	chunkModalOpen: boolean;
	editingChunkId: string | null;
	insightModalOpen: boolean;
	editingInsightId: string | null;
	chunkForm: FormInstance<ChunkFormValues>;
	insightForm: FormInstance<InsightFormValues>;
	messageContextHolder: React.ReactElement;
	modalContextHolder: React.ReactElement;
	handleSearchChange: (value: string) => void;
	setSourceFilter: (value: SourceFilterValue) => void;
	setStatusFilter: (value: StatusFilterValue) => void;
	setChunkPage: (page: number) => void;
	setActiveChunkId: (chunkId: string) => void;
	openCreateModal: () => void;
	openEditModal: (chunk: KnowledgeChunkItem) => void;
	closeChunkModal: () => void;
	handleSubmitChunk: () => Promise<void>;
	handleToggleChunk: (chunkId: string, enabled: boolean) => void;
	handleCopyChunk: (chunk: KnowledgeChunkItem) => void;
	handleDeleteChunk: (chunk: KnowledgeChunkItem) => void;
	openCreateInsightModal: () => void;
	openEditInsightModal: (insightId: string) => void;
	closeInsightModal: () => void;
	handleSubmitInsight: () => Promise<void>;
	handleDeleteInsight: (insightId: string) => void;
}