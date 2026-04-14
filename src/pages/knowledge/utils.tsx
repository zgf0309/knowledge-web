import {
	CustomerServiceOutlined,
	FileExcelOutlined,
	FileImageOutlined,
	LinkOutlined,
	FilePdfOutlined,
	FileTextOutlined,
	FileWordOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import type { UploadFile } from 'antd';
import type { FileFormat, FileStatus, ImportConfig, KnowledgeFileRecord, WebImportItem } from './types';

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

const getParserConfigLabel = (config: ImportConfig) => {
	if (
		config.advancedParsing &&
		(config.deepParserOptions.vlm ||
			config.deepParserOptions.tableParsing ||
			config.deepParserOptions.formulaParsing)
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

export const createRecordFromUpload = (
	file: UploadFile,
	config: ImportConfig,
): KnowledgeFileRecord => {
	const size = file.originFileObj?.size ?? file.size ?? 4096;
	const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
	const tags = getAutoTags(config);

	return {
		key: file.uid,
		id:
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: `${Date.now()}-${file.uid}`,
		name: file.name,
		status: 'available',
		dataSize: Math.max(Math.round(size / 3), 200),
		format: getFormatFromName(file.name),
		tags,
		uploader: '当前用户',
		uploadedAt: now,
		updatedAt: now,
		parserConfig: getParserConfigLabel(config),
		sourceType: getSourceTypeLabel(config.sourceType),
	};
};

export const createRecordFromWebUrl = (
	item: WebImportItem,
	config: ImportConfig,
): KnowledgeFileRecord => {
	const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
	const tags = getAutoTags(config);
	let hostName = item.url;

	try {
		hostName = new URL(item.url).hostname || item.url;
	} catch {
		hostName = item.url;
	}

	return {
		key: item.id,
		id:
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: `${Date.now()}-${item.id}`,
		name: hostName,
		status: 'available',
		dataSize: Math.max(item.url.length * 10, 200),
		format: 'url',
		tags,
		uploader: '当前用户',
		uploadedAt: now,
		updatedAt: now,
		parserConfig: getParserConfigLabel(config),
		sourceType: '网页链接',
	};
};

export const getStatusLabel = (status: FileStatus) =>
	status === 'available' ? '可用' : '处理中';

export const getUniqueTags = (records: KnowledgeFileRecord[], keys: string[]) =>
	Array.from(
		new Set(
			records.filter((record) => keys.includes(record.key)).flatMap((record) => record.tags),
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