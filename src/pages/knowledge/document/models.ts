export type ChunkType = 'original' | 'custom';

export const CHUNK_TYPE_LABEL: Record<ChunkType, string> = {
	original: '原文切片',
	custom: '自定义切片',
};

export interface KnowledgePointItem {
	id: string;
	content: string;
	source: string;
	is_mock?: boolean;
}

export interface KnowledgeChunkItem {
	id: string;
	content: string;
	content_with_weight: string;
	document_id: string;
	docnm_kwd: string;
	important_keywords: string[];
	keyword_explanations: Record<string, string>;
	knowledge_points?: KnowledgePointItem[];
	available: boolean;
	positions: string[];
	page_num: number;
	tag_kwd: string[];
	tag_feas: Record<string, any>;
	chunk_type: ChunkType;
	/** UI 派生字段 */
	label?: string;
	charCount?: number;
	statusText?: string;
}

export interface KnowledgeInsightItem {
	id: string;
	chunkId: string;
	content: string;
	source: string;
}

export interface KnowledgeDocMeta {
	doc_name?: string;
	document_id?: string;
	location?: string;
}
