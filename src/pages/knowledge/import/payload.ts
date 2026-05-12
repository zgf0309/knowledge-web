import type { UploadFile } from 'antd';
import type {
	ImportFileType,
	KnowledgeEnhancementMethod,
	ImportTemplateType,
	WebImportItem,
} from '../types';
import type {
	ImportDocumentItemPayload,
	ImportDocumentParseOptions,
	ImportTableParseOptions,
	ImportDocumentsPayload,
	ImportFormValues,
	ImportTemplateDocumentsPayload,
	TemplateTypeValue,
} from './types';

interface CreateKnowledgePayload {
	knowledge_name: string;
	description?: string;
	group_id?: string;
	embeddingModel?: string;
}

type NormalizedImportDocCategory = ImportFileType;

const TEMPLATE_TYPE_VALUE_MAP: Record<ImportTemplateType, TemplateTypeValue> = {
	lawDocument: 'legal',
	contractTemplate: 'contract',
	resume: 'resume',
	ppt: 'ppt',
	paper: 'paper',
	structuredQa: 'qa',
};

const toOptionalValue = <T,>(value: T | null | undefined) => {
	if (value === null || value === undefined || value === '') {
		return undefined;
	}

	return value;
};

const compactObject = <T extends Record<string, unknown>>(value: T) =>
	Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;

const getNormalizedDocCategory = (values: Pick<ImportFormValues, 'mode' | 'doc_category'>): NormalizedImportDocCategory =>
	values.mode === 'byTemplate' ? 'text' : values.doc_category;

const getNormalizedTags = (values: Pick<ImportFormValues, 'autoTagging' | 'selectedTags'>) =>
	values.autoTagging ? values.selectedTags ?? [] : [];

const getChunkStrategy = (values: ImportFormValues): 'default' | 'custom' | 'whole' | 'page' => {
	const defaultStrategy: 'default' | 'custom' | 'whole' | 'page' = 'default';

	if (values.mode === 'byTemplate' && values.templateType === 'ppt') {
		return 'page';
	}

	if (values.sliceStrategy === 'whole') {
		return 'whole';
	}

	if (values.sliceStrategy === 'page') {
		return 'page';
	}

	if (
		values.sliceStrategy === 'custom' &&
		values.customSliceIdentifiers.length === 1 &&
		values.customSliceIdentifiers[0] === 'page'
	) {
		return 'page';
	}

	if (values.sliceStrategy === 'custom') {
		return 'custom';
	}

	return defaultStrategy;
};

const shouldUseChunkRegex = (values: ImportFormValues) =>
	values.sliceStrategy === 'custom' && values.customSliceIdentifiers.includes('customRegex');

const mapEnhancementMethod = (method: KnowledgeEnhancementMethod) => {
	if (method === 'question_generation') {
		return 'question_gen';
	}

	if (method === 'paragraph_summary') {
		return 'summary';
	}

	return 'triple_extraction';
};

const buildTextParseOptions = (values: ImportFormValues): ImportDocumentParseOptions => {
	const chunkStrategy = getChunkStrategy(values);
	const associateFileName = (values.customSliceReferenceInfo ?? []).includes('fileName');

	return compactObject({
		layout_analysis: Boolean(values.parserOptions.layout_analysis),
		image_ocr: Boolean(values.parserOptions.image_ocr),
		multimodal_understanding: Boolean(values.advancedParsing && values.deepParserOptions.multimodal_understanding),
		chart_recognition: Boolean(values.advancedParsing && values.deepParserOptions.chart_recognition),
		formula_recognition: Boolean(values.advancedParsing && values.deepParserOptions.formula_recognition),
		knowledge_enhancement: Boolean(values.knowledge_enhancement),
		knowledge_graph_extraction: Boolean(values.knowledge_graph_extraction),
		chunk_strategy: chunkStrategy,
		chunk_size: chunkStrategy === 'custom' || chunkStrategy === 'page' ? values.customSliceMaxLength : undefined,
		chunk_regex: shouldUseChunkRegex(values)
			? toOptionalValue(values.customSliceRegexPattern.trim())
			: undefined,
		associate_filename: associateFileName,
	});
};

const buildTableParseOptions = ( values: ImportFormValues): ImportTableParseOptions => {
	return compactObject({
		table_parsing: Boolean(values.parserOptions.table_parsing),
		knowledge_enhancement: Boolean(values.knowledge_enhancement),
	})
};
const buildWebParseOptions = (
	urls: string[],
	values: Pick<ImportFormValues, 'webHtmlFilter' | 'webHtmlFilterSelector' | 'webExtractLinks'>,
) =>
	compactObject({
		urls,
		css_selector: values.webHtmlFilter ? toOptionalValue(values.webHtmlFilterSelector.trim()) : undefined,
		extract_links: Boolean(values.webExtractLinks),
		web_content_parsing: true,
	});

const buildImageParseOptions = (values: ImportFormValues) => {
	const hasAutoCapabilities =
		values.advancedParsing &&
		(values.deepParserOptions.multimodal_understanding || values.deepParserOptions.chart_recognition || values.deepParserOptions.formula_recognition);
	const parseMode: 'manual' | 'auto' | 'image_ocr' = values.parserOptions.image_ocr ? 'image_ocr' : hasAutoCapabilities ? 'auto' : 'manual';

	return compactObject({
		parse_mode: parseMode,
		manual_description: undefined,
	});
};

const buildAudioParseOptions = (values: ImportFormValues) => ({
	knowledge_enhancement: Boolean(values.knowledge_enhancement),
	enhancement_types: values.knowledge_enhancement
		? (values.enhancement_methods ?? []).map(mapEnhancementMethod)
		: [],
	knowledge_graph_extraction: Boolean(values.knowledge_graph_extraction),
	ars: true,
});

const getDocumentParseOptions = (
	docCategory: NormalizedImportDocCategory,
	values: ImportFormValues,
	webUrls?: string[],
): ImportDocumentParseOptions | undefined => {
	if (docCategory === 'text') {
		return buildTextParseOptions(values);
	}
	if (docCategory === 'table') {
		return buildTableParseOptions(values);
	}

	if (docCategory === 'web') {
		return buildWebParseOptions(webUrls ?? [], values);
	}

	if (docCategory === 'image') {
		return buildImageParseOptions(values);
	}

	if (docCategory === 'audio') {
		return buildAudioParseOptions(values);
	}

	return undefined;
};

const getFileLocation = (file: UploadFile) => {
	const response = typeof file.response === 'object' && file.response !== null ? file.response as Record<string, unknown> : undefined;

	return toOptionalValue(
		String(
			response?.location ?? response?.url ?? file.url ?? file.name,
		),
	);
};

const getTemplateTypeValue = (templateType: ImportTemplateType): TemplateTypeValue =>
	TEMPLATE_TYPE_VALUE_MAP[templateType];

const createFileDocument = (
	file: UploadFile,
	docCategory: NormalizedImportDocCategory,
	values: ImportFormValues,
): ImportDocumentItemPayload => {
	const size = file.originFileObj?.size ?? file.size;

	return compactObject({
		name: file.name,
		location: getFileLocation(file),
		size: typeof size === 'number' ? size : undefined,
		tags: getNormalizedTags(values),
		parse_options: getDocumentParseOptions(docCategory, values),
	});
};

const getWebDocumentName = (item: WebImportItem, fallbackName: string) => {
	try {
		return new URL(item.url).hostname || fallbackName;
	} catch {
		return fallbackName;
	}
};

const createWebDocument = (
	item: WebImportItem,
	values: ImportFormValues,
): ImportDocumentItemPayload => {
	const normalizedUrl = item.url.trim();

	return compactObject({
		name: getWebDocumentName(item, values.knowledge_name || '网页导入'),
		source_url: normalizedUrl,
		tags: getNormalizedTags(values),
		parse_options: getDocumentParseOptions('web', values, [normalizedUrl]),
	});
};

export const buildImportDocumentsPayload = (
	knowledgeId: string,
	values: ImportFormValues,
): ImportDocumentsPayload => {
	const docCategory = getNormalizedDocCategory(values);

	const documents = docCategory === 'web'
		? (values.webUrls ?? []).map((item) => createWebDocument(item, values))
		: (values.pendingFiles ?? []).map((file) => createFileDocument(file, docCategory, values));

	return {
		knowledge_id: knowledgeId,
		doc_category: docCategory,
		documents,
	};
};

export const buildImportTemplateDocumentsPayload = (
	knowledgeId: string,
	values: ImportFormValues,
): ImportTemplateDocumentsPayload => {
	const tags = getNormalizedTags(values);
	const documents = (values.pendingFiles ?? []).map((file) => {
		const size = file.originFileObj?.size ?? file.size;

		return compactObject({
			template_type: getTemplateTypeValue(values.templateType),
			name: file.name,
			location: String(getFileLocation(file) ?? ''),
			size: typeof size === 'number' ? size : undefined,
			tags,
			parse_options: {},
		});
	});

	return {
		knowledge_id: knowledgeId,
		documents,
	};
};

export const buildCreateKnowledgePayload = (
	values: Pick<ImportFormValues, 'knowledge_name' | 'description' | 'group_id' | 'embeddingModel'>,
): CreateKnowledgePayload => compactObject({
	knowledge_name: values.knowledge_name.trim(),
	description: toOptionalValue(values.description?.trim()),
	group_id: toOptionalValue(values.group_id),
	embeddingModel: toOptionalValue(values.embeddingModel),
});
