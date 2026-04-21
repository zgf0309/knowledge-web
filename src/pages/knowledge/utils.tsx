import {
	CustomerServiceOutlined,
	FileExcelOutlined,
	FileImageOutlined,
	LinkOutlined,
	FilePdfOutlined,
	FileTextOutlined,
	FileWordOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { UploadFile } from 'antd';
import type {
	FileFormat,
	FileStatus,
	ImportConfig,
	KnowledgeFileRecord,
	WebImportItem,
} from './types';
import { createInitialImportFormValues } from './import/formConfig';
import type { ImportFormValues } from './import/types';

const IMPORTED_RECORDS_STORAGE_KEY = 'knowledge-imported-records';

export const getFormatIcon = (format: FileFormat): ReactNode => {
	if (format === 'pdf') {
		return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
	}
	if (format === 'doc' || format === 'docx') {
		return <FileWordOutlined style={{ color: '#315efb' }} />;
	}
	if (format === 'xls' || format === 'xlsx' || format === 'csv') {
		return <FileExcelOutlined style={{ color: '#52c41a' }} />;
	}
	if (format === 'png' || format === 'jpg' || format === 'jpeg' || format === 'gif' || format === 'bmp') {
		return <FileImageOutlined style={{ color: '#722ed1' }} />;
	}
	if (format === 'wav' || format === 'mp3' || format === 'pcm' || format === 'm4a' || format === 'amr') {
		return <CustomerServiceOutlined style={{ color: '#13a8a8' }} />;
	}
	if (format === 'url') {
		return <LinkOutlined style={{ color: '#315efb' }} />;
	}
	return <FileTextOutlined style={{ color: '#fa8c16' }} />;
};

export const getFormatFromName = (name: string): FileFormat => {
	const extension = name.split('.').pop()?.toLowerCase();
	if (
		extension === 'pdf' ||
		extension === 'doc' ||
		extension === 'docx' ||
		extension === 'ppt' ||
		extension === 'pptx' ||
		extension === 'xls' ||
		extension === 'xlsx' ||
		extension === 'csv' ||
		extension === 'json' ||
		extension === 'md' ||
		extension === 'txt' ||
		extension === 'png' ||
		extension === 'jpg' ||
		extension === 'jpeg' ||
		extension === 'gif' ||
		extension === 'bmp' ||
		extension === 'wav' ||
		extension === 'mp3' ||
		extension === 'pcm' ||
		extension === 'm4a' ||
		extension === 'amr' ||
		extension === 'url'
	) {
		return extension;
	}
	return 'txt';
};

const DOCUMENT_FORMATS = new Set<FileFormat>(['doc', 'txt', 'docx', 'pdf', 'ppt', 'pptx', 'md']);
const QA_FORMATS = new Set<FileFormat>(['xlsx', 'xls', 'csv', 'json']);
const IMAGE_FORMATS = new Set<FileFormat>(['png', 'jpg', 'jpeg', 'gif', 'bmp']);
const AUDIO_FORMATS = new Set<FileFormat>(['wav', 'mp3', 'pcm', 'm4a', 'amr']);

const getSeedFromText = (input: string) =>
	Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getFormatByImportCondition = (fileName: string, config: ImportConfig): FileFormat => {
	const detectedFormat = getFormatFromName(fileName);

	if (config.mode === 'byTemplate') {
		return DOCUMENT_FORMATS.has(detectedFormat) ? detectedFormat : 'pdf';
	}

	if (config.doc_category === 'table') {
		return QA_FORMATS.has(detectedFormat) ? detectedFormat : 'xlsx';
	}

	if (config.doc_category === 'image') {
		return IMAGE_FORMATS.has(detectedFormat) ? detectedFormat : 'png';
	}

	if (config.doc_category === 'audio') {
		return AUDIO_FORMATS.has(detectedFormat) ? detectedFormat : 'mp3';
	}

	if (config.doc_category === 'web') {
		return 'url';
	}

	return DOCUMENT_FORMATS.has(detectedFormat) ? detectedFormat : 'txt';
};

const getStatusByImportCondition = (config: ImportConfig, seed: number): FileStatus => {
	if (config.sourceType === 'bos') {
		return seed % 3 === 0 ? 'processing' : 'available';
	}

	if (config.mode === 'byType' && config.doc_category === 'audio') {
		return seed % 2 === 0 ? 'processing' : 'available';
	}

	if (config.mode === 'byType' && config.doc_category === 'web' && config.webUpdateFrequency !== 'manual') {
		return 'processing';
	}

	return 'available';
};

const getAutoTags = (config: ImportConfig) => {
	const tags: string[] = [];

	if (config.autoTagging) {
		if (config.selectedTags.length) {
			tags.push(...config.selectedTags);
		} else {
			tags.push('自动标签');
		}
	}

	if (config.knowledgeEnhancement) {
		tags.push('知识增强');
	}

	if (config.knowledgeGraph) {
		tags.push('知识图谱');
	}

	return tags;
};

const getSourceTypeLabel = (sourceType: ImportConfig['sourceType']) =>
	sourceType === 'bos' ? '百度对象存储（BOS）' : '本地上传';

export const createConfigDrawerInitialValues = (record?: Pick<KnowledgeFileRecord, 'source_type' | 'tags'>): ImportFormValues => {
	const initialValues = createInitialImportFormValues();

	return {
		...initialValues,
		sourceType: record?.source_type === 'bos' ? 'bos' : 'local',
		autoTagging: Boolean(record?.tags?.length),
		selectedTags: record?.tags ?? [],
	};
};

export const getConfigDrawerParserLabel = (
	config: Pick<ImportConfig, 'advancedParsing' | 'deepParserOptions' | 'parserOptions' | 'sliceStrategy'>,
) => {
	if (config.sliceStrategy === 'whole') {
		return '整文件切片';
	}

	if (config.sliceStrategy === 'custom') {
		return '自定义切片';
	}

	if (
		config.advancedParsing &&
		(config.deepParserOptions.vlm || config.deepParserOptions.tableParsing || config.deepParserOptions.formulaParsing)
	) {
		return '高级解析策略';
	}

	if (config.parserOptions.ocr && config.parserOptions.layoutAnalysis) {
		return 'OCR + 版面分析';
	}

	if (config.parserOptions.ocr) {
		return 'OCR 增强识别';
	}

	if (config.parserOptions.layoutAnalysis) {
		return '表格增强解析';
	}

	return '默认分片策略';
};

export const getConfigDrawerSourceLabel = (sourceType: ImportConfig['sourceType']) => getSourceTypeLabel(sourceType);

export const createRecordFromUpload = (
	file: UploadFile,
	config: ImportConfig,
): KnowledgeFileRecord => {
	const size = file.originFileObj?.size ?? file.size ?? 4096;
	const now = Date.now();
	const tags = getAutoTags(config);
	const seed = getSeedFromText(file.uid || file.name);
	const format = getFormatByImportCondition(file.name, config);
	const docType = format === 'url' ? 'web' : config.doc_category;

	return {
		document_id: file.uid || `${Date.now()}`,
		knowledge_id: '',
		tenant_id: '',
		doc_name: file.name,
		doc_type: docType,
		location: '',
		doc_size: size,
		doc_category: config.doc_category,
		template_type: config.mode === 'byTemplate' ? config.templateType : null,
		tags,
		parser_id: 'naive',
		parser_config: {},
		chunk_count: 0,
		token_num: 0,
		progress: 0,
		progress_msg: '',
		status: getStatusByImportCondition(config, seed),
		run: 0,
		content_hash: null,
		doc_metadata: {},
		source_type: config.sourceType,
		source_url: null,
		create_time: now,
		update_time: now,
	};
};

export const createRecordFromWebUrl = (
	item: WebImportItem,
	config: ImportConfig,
): KnowledgeFileRecord => {
	const now = Date.now();
	const tags = getAutoTags(config);
	const seed = getSeedFromText(item.id || item.url);
	let hostName = item.url;

	try {
		hostName = new URL(item.url).hostname || item.url;
	} catch {
		hostName = item.url;
	}

	return {
		document_id: item.id || `${Date.now()}`,
		knowledge_id: '',
		tenant_id: '',
		doc_name: hostName,
		doc_type: 'web',
		location: item.url,
		doc_size: Math.max(item.url.length * 10, 200),
		doc_category: 'web',
		template_type: null,
		tags,
		parser_id: 'naive',
		parser_config: {},
		chunk_count: 0,
		token_num: 0,
		progress: 0,
		progress_msg: '',
		status: getStatusByImportCondition(config, seed),
		run: 0,
		content_hash: null,
		doc_metadata: {},
		source_type: 'local',
		source_url: item.url,
		create_time: now,
		update_time: now,
	};
};

export const getStatusLabel = (status: FileStatus) =>
	status === 'available' ? '可用' : '处理中';

export const getUniqueTags = (records: KnowledgeFileRecord[], keys: string[]) =>
	Array.from(
		new Set(
			records.filter((record) => keys.includes(record.document_id)).flatMap((record) => record.tags),
		),
	);

export const persistImportedRecords = (records: KnowledgeFileRecord[]) => {
	if (!records.length || typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.setItem(IMPORTED_RECORDS_STORAGE_KEY, JSON.stringify(records));
};

export const consumeImportedRecords = (): KnowledgeFileRecord[] => {
	if (typeof window === 'undefined') {
		return [];
	}

	const rawValue = window.sessionStorage.getItem(IMPORTED_RECORDS_STORAGE_KEY);
	if (!rawValue) {
		return [];
	}

	window.sessionStorage.removeItem(IMPORTED_RECORDS_STORAGE_KEY);

	try {
		const parsed = JSON.parse(rawValue);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};