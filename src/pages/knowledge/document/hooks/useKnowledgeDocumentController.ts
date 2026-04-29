import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { KnowledgeChunkItem, KnowledgeInsightItem } from '../models';
import type {
	ChunkSourceSummary,
	SourceFilterValue,
	StatusFilterValue,
} from '../types';
import { CHUNK_PAGE_SIZE, getChunkSourceSummary, normalizeChunks } from '../utils';

interface UseKnowledgeDocumentControllerOptions {
	chunks: KnowledgeChunkItem[];
}

export interface KnowledgeDocumentController {
	chunks: KnowledgeChunkItem[];
	filteredChunks: KnowledgeChunkItem[];
	pagedChunks: KnowledgeChunkItem[];
	visibleInsights: KnowledgeInsightItem[];
	chunkSourceSummary: ChunkSourceSummary;
	currentChunkId: string;
	searchKeyword: string;
	sourceFilter: SourceFilterValue;
	statusFilter: StatusFilterValue;
	chunkPage: number;
	handleSearchChange: (value: string) => void;
	setSourceFilter: (value: SourceFilterValue) => void;
	setStatusFilter: (value: StatusFilterValue) => void;
	setChunkPage: (page: number) => void;
	setActiveChunkId: (chunkId: string) => void;
}

/**
 * 文档详情页 UI 状态控制器：仅负责筛选/分页/选中等派生状态。
 * 数据本身由 useKnowledgeDocumentApi 提供，写操作通过其 mutations + refetch。
 */
export const useKnowledgeDocumentController = ({
	chunks: rawChunks,
}: UseKnowledgeDocumentControllerOptions): KnowledgeDocumentController => {
	const [searchKeyword, setSearchKeyword] = useState('');
	const deferredKeyword = useDeferredValue(searchKeyword);
	const [sourceFilter, setSourceFilter] = useState<SourceFilterValue>('all');
	const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('全部状态');
	const [chunkPage, setChunkPage] = useState(1);
	const [activeChunkId, setActiveChunkId] = useState('');

	const chunks = useMemo(() => normalizeChunks(rawChunks ?? []), [rawChunks]);

	// 当切片重新加载且当前选中已不存在时，回退到首条
	useEffect(() => {
		if (!chunks.length) {
			setActiveChunkId('');
			return;
		}
		setActiveChunkId((prev) => (chunks.some((c) => c.id === prev) ? prev : chunks[0].id));
	}, [chunks]);

	const filteredChunks = useMemo(() => {
		const keyword = deferredKeyword.trim().toLowerCase();
		return chunks.filter((item) => {
			const matchesKeyword =
				!keyword ||
				[item.label ?? '', item.content ?? '', item.chunk_type].some((value) =>
					String(value).toLowerCase().includes(keyword),
				);
			const matchesSource = sourceFilter === 'all' || item.chunk_type === sourceFilter;
			const matchesStatus = statusFilter === '全部状态' || item.statusText === statusFilter;
			return matchesKeyword && matchesSource && matchesStatus;
		});
	}, [chunks, deferredKeyword, sourceFilter, statusFilter]);

	useEffect(() => {
		setChunkPage(1);
	}, [deferredKeyword, sourceFilter, statusFilter]);

	useEffect(() => {
		const totalPages = Math.max(1, Math.ceil(filteredChunks.length / CHUNK_PAGE_SIZE));
		setChunkPage((current) => Math.min(current, totalPages));
	}, [filteredChunks.length]);

	const pagedChunks = useMemo(() => {
		const startIndex = (chunkPage - 1) * CHUNK_PAGE_SIZE;
		return filteredChunks.slice(startIndex, startIndex + CHUNK_PAGE_SIZE);
	}, [chunkPage, filteredChunks]);

	const currentChunkId = useMemo(
		() =>
			filteredChunks.some((item) => item.id === activeChunkId)
				? activeChunkId
				: filteredChunks[0]?.id ?? '',
		[activeChunkId, filteredChunks],
	);

	const visibleInsights = useMemo<KnowledgeInsightItem[]>(() => {
		const currentChunk = chunks.find((item) => item.id === currentChunkId);
		if (!currentChunk) return [];
		return (currentChunk.knowledge_points ?? []).map((kp) => ({
			id: kp.id,
			chunkId: currentChunk.id,
			content: kp.content,
			source: kp.source ?? '',
		}));
	}, [chunks, currentChunkId]);

	const chunkSourceSummary = useMemo(() => getChunkSourceSummary(chunks), [chunks]);

	const handleSearchChange = (value: string) => {
		startTransition(() => {
			setSearchKeyword(value);
		});
	};

	return {
		chunks,
		filteredChunks,
		pagedChunks,
		visibleInsights,
		chunkSourceSummary,
		currentChunkId,
		searchKeyword,
		sourceFilter,
		statusFilter,
		chunkPage,
		handleSearchChange,
		setSourceFilter,
		setStatusFilter,
		setChunkPage,
		setActiveChunkId,
	};
};
