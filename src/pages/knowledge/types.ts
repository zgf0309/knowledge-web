import type { UploadFile } from 'antd';

export type FileFormat = 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'csv' | 'json' | 'md' | 'txt' | 'png' | 'jpg' | 'jpeg' | 'gif' | 'bmp' | 'wav' | 'mp3' | 'pcm' | 'm4a' | 'amr' | 'url';
export type FileStatus = 'available' | 'processing';

export interface KnowledgeBaseInfo {
	id: string;
	name: string;
	sourceType: string;
	updatedAt: string;
	description: string;
}

export interface KnowledgeFileRecord {
	key: string;
	id: string;
	name: string;
	status: FileStatus;
	dataSize: number;
	advancedUsageTotal?: number;
	advancedUsageLatest?: number;
	format: FileFormat;
	tags: string[];
	uploader: string;
	uploadedAt: string;
	updatedAt: string;
	parserConfig: string;
	sourceType: string;
}

export interface BatchConfigValues {
	parserConfig: string;
}

export interface TagFormValues {
	tags: string[];
}

export type ImportMode = 'byType' | 'byTemplate';
export type ImportFileType = 'text' | 'table' | 'web' | 'image' | 'audio';
export type ImportSourceType = 'local' | 'bos';
export type ImportTemplateType =
	| 'lawDocument'
	| 'contractTemplate'
	| 'resume'
	| 'ppt'
	| 'paper'
	| 'structuredQa';

export interface ImportParserOptions {
	textExtraction: boolean;
	layoutAnalysis: boolean;
	ocr: boolean;
}

export interface ImportDeepParserOptions {
	vlm: boolean;
	tableParsing: boolean;
	formulaParsing: boolean;
}

export type KnowledgeEnhancementMethod =
	| 'questionGeneration'
	| 'paragraphSummary'
	| 'tripleExtraction';

export type WebParseMode = 'currentPage' | 'subPages';
export type WebUploadMode = 'single' | 'batch';
export type WebUpdateFrequency = 'manual' | 'daily' | 'every3Days' | 'every7Days' | 'every30Days';
export type WebParseStatus = 'idle' | 'parsing' | 'success' | 'failure';

export interface WebImportItem {
	id: string;
	url: string;
	updateFrequency: WebUpdateFrequency;
	parseStatus: WebParseStatus;
}

export type ImportSliceStrategy = 'default' | 'custom' | 'whole' | 'page';
export type ImportSliceIdentifier =
	| 'page'
	| 'customRegex'
	| 'chinesePeriod'
	| 'chineseComma'
	| 'chineseQuestion'
	| 'englishPeriod'
	| 'englishQuestion'
	| 'ellipsis'
	| 'chineseDoubleQuote'
	| 'lineBreak'
	| 'chineseSemicolon'
	| 'englishSemicolon';
export type ImportSliceReferenceInfo = 'fileName' | 'heading';
export type ImportSliceRegexInclusionStrategy = 'prefix' | 'suffix' | 'discard';

export interface ImportConfig {
	mode: ImportMode;
	doc_category: ImportFileType;
	templateType: ImportTemplateType;
	sourceType: ImportSourceType;
	autoTagging: boolean;
	selectedTags: string[];
	parserOptions: ImportParserOptions;
	advancedParsing: boolean;
	deepParserOptions: ImportDeepParserOptions;
	knowledgeEnhancement: boolean;
	enhancementMethods: KnowledgeEnhancementMethod[];
	knowledgeGraph: boolean;
	sliceStrategy: ImportSliceStrategy;
	customSliceIdentifiers: ImportSliceIdentifier[];
	customSliceRegexPattern: string;
	customSliceRegexInclusionStrategy: ImportSliceRegexInclusionStrategy;
	customSliceMaxLength: number;
	customSliceOverlapRatio: number;
	customSliceReferenceInfo: ImportSliceReferenceInfo[];
	webParseMode: WebParseMode;
	webUploadMode: WebUploadMode;
	webUpdateFrequency: WebUpdateFrequency;
	webSingleInput: string;
	webBatchInput: string;
	webUrls: WebImportItem[];
	webDeduplicate: boolean;
	webHtmlFilter: boolean;
	webHtmlFilterSelector: string;
	webExtractLinks: boolean;
}

export interface ImportModalState {
	open: boolean;
	pendingFiles: UploadFile[];
}