import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { uploadFile } from '@/services/upload/api';
import { DEFAULT_IMPORT_CONFIG } from '../constants';
import type { ImportMode, WebImportItem, WebUpdateFrequency } from '../types';
import type { ImportFormValues } from './types';

const MAX_UPLOAD_COUNT = 100;
const MAX_QA_UPLOAD_COUNT = 20;
export const MAX_WEB_SINGLE_URL_COUNT = 10;
export const MAX_WEB_BATCH_URL_COUNT = 800;
const MB = 1024 * 1024;
const GB = 1024 * MB;
const DOCUMENT_ACCEPT = '.doc,.txt,.docx,.pdf,.ppt,.pptx,.md';
const DOCUMENT_ALLOWED_EXTENSIONS = new Set(['doc', 'txt', 'docx', 'pdf', 'ppt', 'pptx', 'md']);
const QA_ACCEPT = '.xlsx,.xls,.csv,.json';
const QA_ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv', 'json']);
const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.bmp';
const IMAGE_ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp']);
const AUDIO_ACCEPT = '.wav,.mp3,.pcm,.m4a,.amr';
const AUDIO_ALLOWED_EXTENSIONS = new Set(['wav', 'mp3', 'pcm', 'm4a', 'amr']);
const WEB_BATCH_ACCEPT = '.xlsx';
const WEB_BATCH_ALLOWED_EXTENSIONS = new Set(['xlsx']);
const WEB_BATCH_MAX_COUNT = 1;
const WEB_BATCH_MAX_FILE_SIZE = 15 * MB;
const QA_SUPPORTED_ENCODINGS = ['utf-8', 'gbk', 'gb2312', 'gb18030', 'ascii'] as const;
const QA_MAX_ROWS = 100000;
const QA_MAX_COLUMNS = 20;
const QA_MAX_ROW_CHARACTERS = 150000;

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? '';

const getFileTitle = (fileName: string) => fileName.replace(/\.[^.]+$/, '');

const truncateFileTitle = (fileName: string, maxLength = 255) => {
	const extension = getFileExtension(fileName);
	const title = Array.from(getFileTitle(fileName)).slice(0, maxLength).join('');
	return extension ? `${title}.${extension}` : title;
};

const replaceFileName = (file: File, fileName: string) =>
	new File([file], fileName, { type: file.type, lastModified: file.lastModified });

const isDocumentImport = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	formValues.mode === 'byType' && formValues.doc_category === 'text';

const isQaImport = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	formValues.mode === 'byType' && formValues.doc_category === 'table';

const isImageImport = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	formValues.mode === 'byType' && formValues.doc_category === 'image';

const isAudioImport = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	formValues.mode === 'byType' && formValues.doc_category === 'audio';

export const isWebImport = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	formValues.mode === 'byType' && formValues.doc_category === 'web';

const getMaxUploadCount = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	isQaImport(formValues) ? MAX_QA_UPLOAD_COUNT : MAX_UPLOAD_COUNT;

const WEB_URL_PATTERN = /^https?:\/\//i;

export const WEB_PARSE_MODE_OPTIONS = [
	{
		label: '解析网页内容',
		value: 'currentPage',
		description: '仅支持解析所上传URL的网页数据',
	},
] as const;

export const WEB_UPLOAD_MODE_OPTIONS: Array<{ label: string; value: 'single' | 'batch' }> = [
	{ label: '逐个上传', value: 'single' },
	{ label: '批量上传', value: 'batch' },
];

export const WEB_UPDATE_FREQUENCY_OPTIONS: Array<{ label: string; value: WebUpdateFrequency }> = [
	{ label: '不自动更新', value: 'manual' },
	{ label: '每天', value: 'daily' },
	{ label: '每3天', value: 'every3Days' },
	{ label: '每7天', value: 'every7Days' },
	{ label: '每30天', value: 'every30Days' },
];

export const WEB_SINGLE_MODE_HINT = `最多支持逐个添加${MAX_WEB_SINGLE_URL_COUNT}条url，超出数量可以通过批量上传导入url`;
export const WEB_BATCH_MODE_HINT = `通过文件批量上传url，需下载模板并填写url`;

export const isValidWebUrl = (value: string) => {
	if (!WEB_URL_PATTERN.test(value)) {
		return false;
	}

	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

const normalizeWebUrl = (value: string) => value.trim();

export const createWebImportItem = (url: string, updateFrequency: WebUpdateFrequency): WebImportItem => ({
	id:
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	url,
	updateFrequency,
	parseStatus: 'idle',
});

export const createEmptyWebImportItem = (updateFrequency: WebUpdateFrequency) =>
	createWebImportItem('', updateFrequency);

export const parseBatchUrls = (rawValue: string) =>
	rawValue
		.split(/[\n,，;；]+/)
		.map((item) => normalizeWebUrl(item))
		.filter(Boolean);

export const addWebUrls = ({
	existingUrls,
	urlList,
	updateFrequency,
	deduplicate,
	maxCount,
}: {
	existingUrls: WebImportItem[];
	urlList: string[];
	updateFrequency: WebUpdateFrequency;
	deduplicate: boolean;
	maxCount: number;
}) => {
	const invalidUrls: string[] = [];
	const duplicateUrls: string[] = [];
	const nextUrls = [...existingUrls];
	const existingSet = new Set(existingUrls.map((item) => item.url));

	for (const rawUrl of urlList) {
		const url = normalizeWebUrl(rawUrl);
		if (!isValidWebUrl(url)) {
			invalidUrls.push(rawUrl);
			continue;
		}

		if (deduplicate && existingSet.has(url)) {
			duplicateUrls.push(url);
			continue;
		}

		if (nextUrls.length >= maxCount) {
			break;
		}

		nextUrls.push(createWebImportItem(url, updateFrequency));
		existingSet.add(url);
	}

	return {
		urls: nextUrls,
		invalidUrls,
		duplicateUrls,
		overflow: Math.max(existingUrls.length + urlList.length - maxCount, 0),
	};
};

export const updateWebUrlsFrequency = (
	urls: WebImportItem[],
	updateFrequency: WebUpdateFrequency,
) => urls.map((item) => ({ ...item, updateFrequency }));

export const updateWebUrlItem = (
	urls: WebImportItem[],
	id: string,
	patch: Partial<Pick<WebImportItem, 'url' | 'updateFrequency' | 'parseStatus'>>,
) => urls.map((item) => (item.id === id ? { ...item, ...patch } : item));

export const removeWebUrl = (urls: WebImportItem[], id: string) =>
	urls.filter((item) => item.id !== id);

export const shouldShowWebConfig = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	isWebImport(formValues);

export const shouldShowFileSourceSelector = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	!isWebImport(formValues);

export const shouldShowFileUploader = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	!isWebImport(formValues);

export const validateWebImportBeforeSubmit = (
	formValues: Pick<ImportFormValues, 'webUrls'>,
) => {
	const normalizedUrls = (formValues.webUrls ?? []).map((item) => ({
		...item,
		url: normalizeWebUrl(item.url),
	}));

	if (!normalizedUrls.length) {
		return {
			valid: false,
			message: '请至少添加一个需要解析的 URL',
			urls: normalizedUrls,
		};
	}

	if (normalizedUrls.some((item) => !item.url)) {
		return {
			valid: false,
			message: '请补全所有 URL 后再提交',
			urls: normalizedUrls,
		};
	}

	if (normalizedUrls.some((item) => !isValidWebUrl(item.url))) {
		return {
			valid: false,
			message: '存在不合法的 URL，请检查后再提交',
			urls: normalizedUrls,
		};
	}

	return {
		valid: true,
		message: '',
		urls: normalizedUrls,
	};
};

const extractUrlsFromCellValue = (value: unknown) => {
	if (typeof value !== 'string') {
		return [] as string[];
	}

	const matches = value.match(/https?:\/\/[^\s,，;；]+/gi);
	return matches?.map((item) => normalizeWebUrl(item)) ?? [];
};

const validateWebBatchFile = (file: File) => {
	const extension = getFileExtension(file.name);
	if (!WEB_BATCH_ALLOWED_EXTENSIONS.has(extension)) {
		return '仅支持上传 .xlsx 文件';
	}

	if (file.size > WEB_BATCH_MAX_FILE_SIZE) {
		return '批量上传文件不能超过15MB';
	}

	return '';
};

const countPdfPages = async (file: File) => {
	const arrayBuffer = await file.arrayBuffer();
	const content = new TextDecoder('latin1').decode(arrayBuffer);
	const matches = content.match(/\/Type\s*\/Page\b/g);
	return matches?.length ?? null;
};

const extractOfficePageCount = async (file: File, extension: string) => {
	const zip = await JSZip.loadAsync(file);
	const appXml = await zip.file('docProps/app.xml')?.async('text');

	if (appXml) {
		const tagName = extension === 'pptx' ? 'Slides' : 'Pages';
		const match = appXml.match(new RegExp(`<${tagName}>(\\d+)</${tagName}>`));
		if (match) {
			return Number(match[1]);
		}
	}

	if (extension === 'pptx') {
		const slideFiles = Object.keys(zip.files).filter((name) => /ppt\/slides\/slide\d+\.xml$/i.test(name));
		return slideFiles.length || null;
	}

	return null;
};

const getDocumentPageCount = async (file: File, extension: string) => {
	if (extension === 'pdf') {
		return countPdfPages(file);
	}

	if (extension === 'docx' || extension === 'pptx') {
		return extractOfficePageCount(file, extension);
	}

	return null;
};

const decodeTextWithSupportedEncodings = async (file: File) => {
	const arrayBuffer = await file.arrayBuffer();

	for (const encoding of QA_SUPPORTED_ENCODINGS) {
		try {
			const decoder = new TextDecoder(encoding, { fatal: true });
			return {
				content: decoder.decode(arrayBuffer),
				encoding,
			};
		} catch {
			continue;
		}
	}

	return null;
};

const getRowCharacterCount = (row: unknown[]) =>
	row.reduce<number>((total, cell) => total + String(cell ?? '').length, 0);

const validateSheetMetrics = (rows: unknown[][]) => {
	if (rows.length > QA_MAX_ROWS) {
		return `文件行数不能超过${QA_MAX_ROWS}行`;
	}

	const maxColumnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
	if (maxColumnCount > QA_MAX_COLUMNS) {
		return `文件列数不能超过${QA_MAX_COLUMNS}列`;
	}

	const oversizedRow = rows.find((row: unknown[]) => getRowCharacterCount(row) > QA_MAX_ROW_CHARACTERS);
	if (oversizedRow) {
		return `每行内容不能超过${QA_MAX_ROW_CHARACTERS}字`;
	}

	return null;
};

const validateWorkbookSheet = (worksheet: XLSX.WorkSheet) => {
	const rows = XLSX.utils.sheet_to_json(worksheet, {
		header: 1,
		defval: '',
		raw: false,
	}) as unknown[][];

	return validateSheetMetrics(rows);
};

const validateCsvFile = async (file: File) => {
	const decoded = await decodeTextWithSupportedEncodings(file);
	if (!decoded) {
		return 'csv 文件编码仅支持 UTF-8、GBK、GB2312、GB18030、ASCII';
	}

	const workbook = XLSX.read(decoded.content, { type: 'string', raw: false });
	if (workbook.SheetNames.length > 1) {
		return '文件中最多支持一个sheet工作表';
	}

	return validateWorkbookSheet(workbook.Sheets[workbook.SheetNames[0]]);
};

const validateExcelFile = async (file: File) => {
	const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: false });
	if (workbook.SheetNames.length > 1) {
		return '文件中最多支持一个sheet工作表';
	}

	return validateWorkbookSheet(workbook.Sheets[workbook.SheetNames[0]]);
};

const getJsonMetrics = (payload: unknown): unknown[][] => {
	if (Array.isArray(payload)) {
		return payload.map((item) => {
			if (Array.isArray(item)) {
				return item;
			}
			if (item && typeof item === 'object') {
				return Object.values(item);
			}
			return [item];
		});
	}

	if (payload && typeof payload === 'object') {
		return [Object.values(payload)];
	}

	return [[payload]];
};

const validateJsonFile = async (file: File) => {
	const decoded = await decodeTextWithSupportedEncodings(file);
	if (!decoded) {
		return 'json 文件编码仅支持 UTF-8、GBK、GB2312、GB18030、ASCII';
	}

	try {
		const payload = JSON.parse(decoded.content);
		return validateSheetMetrics(getJsonMetrics(payload));
	} catch {
		return 'json 文件内容格式不正确';
	}
};

const validateDocumentFile = async (file: File) => {
	const extension = getFileExtension(file.name);
	const title = getFileTitle(file.name);

	if (!DOCUMENT_ALLOWED_EXTENSIONS.has(extension)) {
		return '仅支持 .doc、.txt、.docx、.pdf、.ppt、.pptx、.md 格式文件';
	}

	if (title.length > 255) {
		return '上传文件标题不能超过255字符';
	}

	if ((extension === 'txt' || extension === 'md') && file.size > 10 * MB) {
		return '.txt/.md 文件不能超过10MB';
	}

	if (extension === 'pdf' && file.size > 500 * MB) {
		return '.pdf 文件不能超过500MB';
	}

	if (extension !== 'txt' && extension !== 'md' && extension !== 'pdf' && file.size > GB) {
		return '除 .txt/.md/.pdf 外，其他文件不能超过1GB';
	}

	if (extension === 'pdf' || extension === 'doc' || extension === 'docx' || extension === 'ppt' || extension === 'pptx') {
		const pageLimit = extension === 'pdf' ? 3000 : 2500;
		const pageCount = await getDocumentPageCount(file, extension);

		if (typeof pageCount === 'number' && pageCount > pageLimit) {
			return extension === 'pdf' ? '.pdf 文件不能超过3000页' : '其他类型文件不能超过2500页';
		}
	}

	return null;
};

const validateQaFile = async (file: File) => {
	const extension = getFileExtension(file.name);

	if (!QA_ALLOWED_EXTENSIONS.has(extension)) {
		return '仅支持 .xlsx、.xls、.csv、.json 格式文件';
	}

	if (file.size > 100 * MB) {
		return '单个文件大小不能超过100MB';
	}

	if (extension === 'csv') {
		return validateCsvFile(file);
	}

	if (extension === 'json') {
		return validateJsonFile(file);
	}

	return validateExcelFile(file);
};

const validateImageFile = async (file: File) => {
	const extension = getFileExtension(file.name);
	const title = getFileTitle(file.name);

	if (!IMAGE_ALLOWED_EXTENSIONS.has(extension)) {
		return '仅支持 .png、.jpg、.jpeg、.gif、.bmp 格式文件';
	}

	if (title.length > 255) {
		return '上传文件标题不能超过255字符';
	}

	if (file.size > 10 * MB) {
		return '单图片不能超过10MB';
	}

	return null;
};

const validateAudioFile = async (file: File) => {
	const extension = getFileExtension(file.name);
	const title = getFileTitle(file.name);

	if (!AUDIO_ALLOWED_EXTENSIONS.has(extension)) {
		return '仅支持 .wav、.mp3、.pcm、.m4a、.amr 格式文件';
	}

	if (title.length > 255) {
		return '上传文件标题不能超过255字符';
	}

	if (file.size > 500 * MB) {
		return '单文件不能超过500MB';
	}

	return null;
};

const normalizeUploadFile = (
	file: File,
	formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>,
	messageApi: MessageInstance,
) => {
	if (!isQaImport(formValues)) {
		return file;
	}

	const titleLength = Array.from(getFileTitle(file.name)).length;
	if (titleLength <= 255) {
		return file;
	}

	messageApi.warning('上传文件标题超过255字符，已自动截断');
	return replaceFileName(file, truncateFileTitle(file.name));
};

const getIncomingFileIndex = (file: File, fileList: File[]) =>
	fileList.findIndex((currentFile) => currentFile === file || currentFile.name === file.name);

const validateFileBeforeUpload = async (
	file: File,
	fileList: File[],
	formValues: Pick<ImportFormValues, 'mode' | 'doc_category' | 'pendingFiles'>,
	messageApi: MessageInstance,
) => {
	const maxUploadCount = getMaxUploadCount(formValues);
	const incomingFileIndex = getIncomingFileIndex(file, fileList);
	if (formValues.pendingFiles.length + incomingFileIndex + 1 > maxUploadCount) {
		if (formValues.pendingFiles.length + incomingFileIndex === maxUploadCount) {
			messageApi.warning(`单次上传文档数量不能超过${maxUploadCount}个`);
		}
		return Upload.LIST_IGNORE;
	}

	const normalizedFile = normalizeUploadFile(file, formValues, messageApi);

	if (isDocumentImport(formValues)) {
		const errorMessage = await validateDocumentFile(normalizedFile);
		if (errorMessage) {
			messageApi.warning(errorMessage);
			return Upload.LIST_IGNORE;
		}
	}

	if (isQaImport(formValues)) {
		const errorMessage = await validateQaFile(normalizedFile);
		if (errorMessage) {
			messageApi.warning(errorMessage);
			return Upload.LIST_IGNORE;
		}
	}

	if (isImageImport(formValues)) {
		const errorMessage = await validateImageFile(normalizedFile);
		if (errorMessage) {
			messageApi.warning(errorMessage);
			return Upload.LIST_IGNORE;
		}
	}

	if (isAudioImport(formValues)) {
		const errorMessage = await validateAudioFile(normalizedFile);
		if (errorMessage) {
			messageApi.warning(errorMessage);
			return Upload.LIST_IGNORE;
		}
	}

	return normalizedFile;
};

export const uploadHintByMode: Record<ImportMode, string> = {
	byTemplate:
		'单次上传文档数量为100个；支持 doc/docx/txt 三种格式；txt文件不能超过10MB，其他类型文件不能超过50MB且不能超过1000页；上传文件标题不能超过255字符',
	byType: '单次上传文档数量为100个；支持 doc、txt、docx、pdf、ppt、pptx、md 格式。',
};

export const documentUploadHint =
	'单次上传文档数量为100个；支持.doc/.txt/.docx/.pdf/.ppt/.pptx/.md七种格式；.txt/.md文件不能超过10MB，.pdf文件不能超过500MB且不能超过3000页，其他类型文件不能超过1GB且不能超过2500页；上传文件标题不能超过255字符';

export const qaUploadHint =
	'单次上传文档数量不超过20个；支持.xlsx/.xls/.csv/.json四种文件格式；支持UTF-8、GBK、GB2312、GB18030、ASCII五种编码格式；单个文件大小不超过100MB，不超过10万行、20列，每行不超过15万字，且文件中最多支持一个sheet工作表，上传文件标题不能超过255字符（超出范围的内容会被自动忽略）';

export const imageUploadHint =
	'单次上传文档数量为100个；支持.png/.jpg/.jpeg/.gif/.bmp格式；单图片不能超过10MB；上传文件标题不能超过255字符';

export const audioUploadHint =
	'单次上传文档数量为100个；支持.wav/.mp3/.pcm/.m4a/.amr等格式；单文件不能超过500MB；上传文件标题不能超过255字符';

export const qaTemplateDownloadOptions = [
	{ key: 'csv', label: 'csv 模板', badge: 'CSV', tone: 'green' },
	{ key: 'xls', label: 'xls 模板', badge: 'X', tone: 'green' },
	{ key: 'xlsx', label: 'xlsx 模板', badge: 'X', tone: 'green' },
	{ key: 'json', label: 'json 模板', badge: 'JS', tone: 'purple' },
] as const;

const triggerFileDownload = (fileName: string, content: BlobPart, mimeType: string) => {
	if (typeof window === 'undefined') {
		return;
	}

	const blob = new Blob([content], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	window.URL.revokeObjectURL(url);
};

export const downloadQaTemplate = (templateKey: (typeof qaTemplateDownloadOptions)[number]['key']) => {
	const templateRows = [
		{ question: '示例问题', answer: '示例答案' },
		{ question: '另一个问题', answer: '另一条答案' },
	];

	if (templateKey === 'json') {
		triggerFileDownload('knowledge-template.json', JSON.stringify(templateRows, null, 2), 'application/json;charset=utf-8');
		return;
	}

	const worksheet = XLSX.utils.json_to_sheet(templateRows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

	if (templateKey === 'csv') {
		triggerFileDownload('knowledge-template.csv', XLSX.utils.sheet_to_csv(worksheet), 'text/csv;charset=utf-8');
		return;
	}

	const bookType = templateKey === 'xls' ? 'biff8' : 'xlsx';
	const mimeType = templateKey === 'xls'
		? 'application/vnd.ms-excel'
		: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

	triggerFileDownload(
		`knowledge-template.${templateKey}`,
		XLSX.write(workbook, { type: 'array', bookType }),
		mimeType,
	);
};

export const downloadWebBatchTemplate = () => {
	const templateRows = [{ url: 'https://example.com' }];
	const worksheet = XLSX.utils.json_to_sheet(templateRows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'URLs');

	triggerFileDownload(
		'web-url-template.xlsx',
		XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }),
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	);
};

export const getUploadHintText = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	isDocumentImport(formValues)
		? documentUploadHint
		: isQaImport(formValues)
			? qaUploadHint
			: isImageImport(formValues)
				? imageUploadHint
				: isAudioImport(formValues)
					? audioUploadHint
					: isWebImport(formValues)
						? ''
			: uploadHintByMode[formValues.mode];

export const getUploadAreaClassName = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	isDocumentImport(formValues)
		? 'knowledge-import-route__uploader knowledge-import-route__uploader--document'
		: isQaImport(formValues)
			? 'knowledge-import-route__uploader knowledge-import-route__uploader--qa'
			: isImageImport(formValues)
				? 'knowledge-import-route__uploader knowledge-import-route__uploader--image'
				: isAudioImport(formValues)
					? 'knowledge-import-route__uploader knowledge-import-route__uploader--audio'
					: isWebImport(formValues)
						? 'knowledge-import-route__uploader knowledge-import-route__uploader--web'
			: 'knowledge-import-route__uploader';

export const getUploadTextVariant = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	isDocumentImport(formValues)
		? 'text'
		: isQaImport(formValues)
			? 'table'
			: isImageImport(formValues)
				? 'image'
				: isAudioImport(formValues)
					? 'audio'
					: isWebImport(formValues)
						? 'web'
				: 'default';

export const shouldShowQaTemplateDownloads = (formValues: Pick<ImportFormValues, 'mode' | 'doc_category'>) =>
	isQaImport(formValues);

export const createUploadProps = (
	formValues: Pick<ImportFormValues, 'mode' | 'doc_category' | 'pendingFiles'>,
	messageApi: MessageInstance,
	kbId?: string,
): UploadProps => ({
	multiple: true,
	accept: isDocumentImport(formValues)
		? DOCUMENT_ACCEPT
		: isQaImport(formValues)
			? QA_ACCEPT
			: isImageImport(formValues)
				? IMAGE_ACCEPT
				: isAudioImport(formValues)
					? AUDIO_ACCEPT
				: undefined,
	beforeUpload: (file, fileList) => validateFileBeforeUpload(file, fileList, formValues, messageApi),
		customRequest: async ({ file, onSuccess, onError }) => {
			try {
				const uploadResult: any = await uploadFile({
					file,
					kb_id: kbId,
				});
				const { code, data } = uploadResult;
				if (code === 200) {
					const payload = typeof data === 'object' && data !== null ? data : uploadResult;
					const location = String(payload?.location ?? payload?.doc_url ?? payload?.doc_url ?? '').trim();
					if (!location) {
						throw new Error('上传成功但未返回文件地址');
					}
					onSuccess?.({
						...payload,
						location,
						url: location,
					}, undefined as any);
				} else {
					onError?.(uploadResult);
				}
				
			} catch (error) {
				const message = error instanceof Error ? error.message : '文件上传失败，请稍后重试';
				messageApi.warning(message);
				onError?.(error as Error);
			}
		},
});

export const createWebBatchUploadProps = (messageApi: MessageInstance): UploadProps => ({
	multiple: false,
	maxCount: WEB_BATCH_MAX_COUNT,
	accept: WEB_BATCH_ACCEPT,
	beforeUpload: (file) => {
		const errorMessage = validateWebBatchFile(file);
		if (errorMessage) {
			messageApi.warning(errorMessage);
			return Upload.LIST_IGNORE;
		}

		return false;
	},
	onChange: ({ fileList }) => {
		if (fileList.length > WEB_BATCH_MAX_COUNT) {
			messageApi.warning('批量上传只支持选择一个文件');
		}
	},
});

export const extractUrlsFromWebBatchFile = async (file: UploadFile) => {
	const sourceFile = file.originFileObj;
	if (!sourceFile) {
		throw new Error('未找到上传文件');
	}

	const workbook = XLSX.read(await sourceFile.arrayBuffer(), { type: 'array' });
	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) {
		return [] as string[];
	}

	const worksheet = workbook.Sheets[firstSheetName];
	const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(worksheet, {
		header: 1,
		raw: false,
		defval: '',
	});

	return rows.flatMap((row) => row.flatMap((cell) => extractUrlsFromCellValue(cell)));
};

export const createInitialImportFormValues = (): ImportFormValues => ({
	...DEFAULT_IMPORT_CONFIG,
	// 文件导入的待上传文件列表。
	pendingFiles: [],
	// 网页批量模式的上传文件列表。
	webBatchFiles: [],
	// 知识库名称。
	knowledge_name: '',
	// 知识库备注。
	description: '',
	// 所属群组 ID。
	group_id: 'group-2',
	// 默认向量模型。
	embeddingModel: 'multilingual-embedding',
	// 存储资源（默认共享存储）。
	storageResource: 'shared',
	selectedTags: [...DEFAULT_IMPORT_CONFIG.selectedTags],
	parserOptions: { ...DEFAULT_IMPORT_CONFIG.parserOptions },
	deepParserOptions: { ...DEFAULT_IMPORT_CONFIG.deepParserOptions },
	enhancementMethods: [...DEFAULT_IMPORT_CONFIG.enhancementMethods],
	customSliceIdentifiers: [...DEFAULT_IMPORT_CONFIG.customSliceIdentifiers],
	customSliceReferenceInfo: [...DEFAULT_IMPORT_CONFIG.customSliceReferenceInfo],
});

export const getUploadFileList = (event: { fileList?: UploadFile[] } | UploadFile[]) => {
	if (Array.isArray(event)) {
		return event.slice(0, MAX_UPLOAD_COUNT);
	}

	return event?.fileList?.slice(0, MAX_UPLOAD_COUNT) ?? [];
};

export const getWebBatchUploadFileList = (event: { fileList?: UploadFile[] } | UploadFile[]) => {
	if (Array.isArray(event)) {
		return event.slice(-WEB_BATCH_MAX_COUNT);
	}

	return event?.fileList?.slice(-WEB_BATCH_MAX_COUNT) ?? [];
};