import type { UploadFile } from 'antd';
import type { ReactNode } from 'react';
import type { ImportConfig, ImportFileType } from '../types';

export interface ImportFormValues extends ImportConfig {
	// 租户 ID（提交时由上下文注入）。
	tenant_id?: string;
	// 待上传的本地文件列表。
	pendingFiles: UploadFile[];
	// 网页批量导入模式下上传的 Excel 文件。
	webBatchFiles: UploadFile[];
	// 知识库名称。
	knowledge_name: string;
	// 知识库备注。
	description?: string;
	// 向量模型标识。
	embeddingModel: string;
	// 所属群组 ID。
	group_id: string;
	// 存储资源类型。
	storageResource: 'shared' | 'bes' | 'vectorDb';
}

export interface ImportTextParseOptions {
	layout_analysis: boolean;
	image_ocr: boolean;
	multimodal_understanding: boolean;
	chart_recognition: boolean;
	formula_recognition: boolean;
	knowledge_enhancement: boolean;
	knowledge_graph_extraction: boolean;
	chunk_strategy: 'default' | 'custom' | 'whole' | 'page';
	chunk_size?: number;
	chunk_regex?: string;
	associate_filename: boolean;
}

export interface ImportWebParseOptions {
	urls: string[];
	css_selector?: string;
	extract_links: boolean;
}

export interface ImportImageParseOptions {
	parse_mode: 'manual' | 'auto' | 'ocr';
	manual_description?: string;
}

export interface ImportAudioParseOptions {
	knowledge_enhancement: boolean;
	enhancement_types: Array<'question_gen' | 'summary' | 'triple_extraction'>;
	knowledge_graph_extraction: boolean;
}

export type ImportDocumentParseOptions =
	| ImportTextParseOptions
	| ImportWebParseOptions
	| ImportImageParseOptions
	| ImportAudioParseOptions;

export interface ImportDocumentItemPayload {
	name: string;
	location?: string;
	source_url?: string;
	size?: number;
	tags?: string[];
	parse_options?: ImportDocumentParseOptions;
}

export interface ImportDocumentsPayload {
	knowledge_id: string;
	documents: ImportDocumentItemPayload[];
	doc_category: ImportFileType;
}

export interface ImportSelectionOption<T extends string> {
	value: T;
	title: string;
	description: string;
	icon?: ReactNode;
}

export interface ImportCheckboxCardOption {
	key: string;
	title: string;
	description: string;
	fieldName?: Array<string | number>;
	checked?: boolean;
	disabled?: boolean;
}

export interface ImportOverviewRow {
	label: string;
	value: string;
	withDot?: boolean;
}

export interface EmbeddingModelOption {
	model_name?: string;
	value?: string;
	title?: string;
	description?: string;
	languages?: string[];
	badges?: string[];
}