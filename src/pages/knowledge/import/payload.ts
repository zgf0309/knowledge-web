import type { UploadFile } from 'antd';
import type {
	ImportFileType,
	KnowledgeEnhancementMethod,
	WebImportItem,
} from '../types';
import type {
	ImportDocumentItemPayload,
	ImportDocumentParseOptions,
	ImportDocumentsPayload,
	ImportFormValues,
} from './types';

interface CreateKnowledgePayload {
	tenant_id?: string;
	knowledge_name: string;
	description?: string;
	group_id?: string;
	embeddingModel?: string;
}

type NormalizedImportDocCategory = ImportFileType;

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
	if (method === 'questionGeneration') {
		return 'question_gen';
	}

	if (method === 'paragraphSummary') {
		return 'summary';
	}

	return 'triple_extraction';
};

const buildTextParseOptions = (values: ImportFormValues): ImportDocumentParseOptions => {
	const chunkStrategy = getChunkStrategy(values);
	const associateFileName = (values.customSliceReferenceInfo ?? []).includes('fileName');

	return compactObject({
		layout_analysis: Boolean(values.parserOptions.layoutAnalysis),
		image_ocr: Boolean(values.parserOptions.ocr),
		multimodal_understanding: Boolean(values.advancedParsing && values.deepParserOptions.vlm),
		chart_recognition: Boolean(values.advancedParsing && values.deepParserOptions.tableParsing),
		formula_recognition: Boolean(values.advancedParsing && values.deepParserOptions.formulaParsing),
		knowledge_enhancement: Boolean(values.knowledgeEnhancement),
		knowledge_graph_extraction: Boolean(values.knowledgeGraph),
		chunk_strategy: chunkStrategy,
		chunk_size: chunkStrategy === 'custom' || chunkStrategy === 'page' ? values.customSliceMaxLength : undefined,
		chunk_regex: shouldUseChunkRegex(values)
			? toOptionalValue(values.customSliceRegexPattern.trim())
			: undefined,
		associate_filename: associateFileName,
	});
};

const buildWebParseOptions = (
	urls: string[],
	values: Pick<ImportFormValues, 'webHtmlFilter' | 'webHtmlFilterSelector' | 'webExtractLinks'>,
) =>
	compactObject({
		urls,
		css_selector: values.webHtmlFilter ? toOptionalValue(values.webHtmlFilterSelector.trim()) : undefined,
		extract_links: Boolean(values.webExtractLinks),
	});

const buildImageParseOptions = (values: ImportFormValues) => {
	const hasAutoCapabilities =
		values.advancedParsing &&
		(values.deepParserOptions.vlm || values.deepParserOptions.tableParsing || values.deepParserOptions.formulaParsing);
	const parseMode: 'manual' | 'auto' | 'ocr' = values.parserOptions.ocr ? 'ocr' : hasAutoCapabilities ? 'auto' : 'manual';

	return compactObject({
		parse_mode: parseMode,
		manual_description: undefined,
	});
};

const buildAudioParseOptions = (values: ImportFormValues) => ({
	knowledge_enhancement: Boolean(values.knowledgeEnhancement),
	enhancement_types: values.knowledgeEnhancement
		? (values.enhancementMethods ?? []).map(mapEnhancementMethod)
		: [],
	knowledge_graph_extraction: Boolean(values.knowledgeGraph),
});

const getDocumentParseOptions = (
	docCategory: NormalizedImportDocCategory,
	values: ImportFormValues,
	webUrls?: string[],
): ImportDocumentParseOptions | undefined => {
	if (docCategory === 'text') {
		return buildTextParseOptions(values);
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

export const buildCreateKnowledgePayload = (
	values: Pick<ImportFormValues, 'knowledge_name' | 'description' | 'group_id' | 'embeddingModel'>,
	tenantId?: string,
): CreateKnowledgePayload => compactObject({
	tenant_id: toOptionalValue(tenantId),
	knowledge_name: values.knowledge_name.trim(),
	description: toOptionalValue(values.description?.trim()),
	group_id: toOptionalValue(values.group_id),
	embeddingModel: toOptionalValue(values.embeddingModel),
});