import type { UploadFile } from 'antd';

export type FileFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'xls'
  | 'xlsx'
  | 'csv'
  | 'json'
  | 'md'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'gif'
  | 'bmp'
  | 'wav'
  | 'mp3'
  | 'pcm'
  | 'm4a'
  | 'amr'
  | 'url';
export type FileStatus =
  | 'pending'
  | 'running'
  | 'parsing'
  | 'completed'
  | 'success'
  | 'failed'
  | 'available'
  | 'processing';

export interface KnowledgeBaseInfo {
  id: string;
  name: string;
  sourceType: string;
  updatedAt: string;
  description: string;
}

export interface KnowledgeFileRecord {
  document_id: string;
  knowledge_id: string;
  doc_name: string;
  doc_type: string;
  location: string;
  doc_category: string;
  template_type: any | null;
  tags: any[];
  parser_id: string | null;
  parser_config: any | null;
  chunk_count: number;
  token_num: number;
  progress: number;
  progress_msg: string;
  status: string;
  run: number;
  content_hash: any | null;
  doc_metadata: any | null;
  source_type: string;
  source_url: any | null;
  create_time: any | null;
  update_time: any | null;
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
  text_extraction: boolean;
  layout_analysis: boolean;
  image_ocr: boolean;
  table_parsing: boolean;
  web_content_parsing: boolean;
}

export interface ImportDeepParserOptions {
  multimodal_understanding: boolean;
  chart_recognition: boolean;
  formula_recognition: boolean;
  asr: boolean;
}

export type KnowledgeEnhancementMethod =
  | 'question_generation'
  | 'paragraph_summary'
  | 'triple_extraction';

export type WebParseMode = 'currentPage' | 'subPages';
export type WebUploadMode = 'single' | 'batch';
export type WebUpdateFrequency =
  | 'manual'
  | 'daily'
  | 'every3Days'
  | 'every7Days'
  | 'every30Days';
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
  knowledge_enhancement: boolean;
  enhancement_methods: KnowledgeEnhancementMethod[];
  knowledge_graph_extraction: boolean;
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
