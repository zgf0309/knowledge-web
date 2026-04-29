import type { KnowledgeChunkItem } from './models';
import type { ChunkSourceSummary } from './types';

export const CHUNK_PAGE_SIZE = 5;

export const createChunkLabel = (index: number) => `#${index + 1}`;

export const normalizeChunks = (items: KnowledgeChunkItem[]) =>
	items.map((item, index) => ({
		...item,
		label: createChunkLabel(index),
		charCount: (item.content ?? '').length,
		statusText: item.available ? '已启用' : '已停用',
	}));

export const getChunkSourceSummary = (chunks: KnowledgeChunkItem[]): ChunkSourceSummary => ({
	all: chunks.length,
	original: chunks.filter((item) => item.chunk_type === 'original').length,
	custom: chunks.filter((item) => item.chunk_type === 'custom').length,
});