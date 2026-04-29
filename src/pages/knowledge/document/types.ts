import type { FormInstance } from 'antd';
import type { ChunkType } from './models';

export type ChunkSourceType = ChunkType;
export type SourceFilterValue = 'all' | ChunkType;
export type StatusFilterValue = '全部状态' | '已启用' | '已停用';

export interface ChunkFormValues {
	content: string;
}

export interface InsightFormValues {
	content: string;
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
	initialValues: ChunkFormValues;
	onCancel: () => void;
	onSubmit: () => void;
}

export interface InsightEditorModalProps {
	open: boolean;
	editingInsightId: string | null;
	form: FormInstance<InsightFormValues>;
	initialValues: InsightFormValues;
	onCancel: () => void;
	onSubmit: () => void;
}
