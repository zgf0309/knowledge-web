import type {
	ImportConfig,
	ImportFileType,
	ImportTemplateType,
	KnowledgeEnhancementMethod,
	ImportSliceStrategy,
	ImportSourceType,
	KnowledgeBaseInfo,
	KnowledgeFileRecord,
} from './types';

export const KNOWLEDGE_BASE: KnowledgeBaseInfo = {
	id: '4081dca4-b4cd-46f9-ba98-b82025971817',
	name: '测试',
	sourceType: '共享资源',
	updatedAt: '2025-09-18 13:31:50',
	description: '暂无描述',
};

export const TAG_OPTIONS = ['重点', '共享', '调研', '简历', '制度', '图谱'];
export const PARSER_OPTIONS = ['默认分片策略', '表格增强解析', '多级标题解析', 'OCR 增强识别'];

export const IMPORT_MODE_OPTIONS = [
	{ label: '按文件类型导入', value: 'byType' },
	{ label: '按模板导入', value: 'byTemplate' },
] as const;

export const IMPORT_FILE_TYPE_OPTIONS: Array<{
	value: ImportFileType;
	title: string;
	description: string;
}> = [
	{
		value: 'document',
		title: '导入文本文件数据',
		description: '将基于上传的文本文件直接进行切分处理',
	},
	{
		value: 'qa',
		title: '导入表格型知识数据',
		description: '将表格类内容转成问答对，适合结构化文档和批量知识库',
	},
	{
		value: 'web',
		title: '读取网页数据源',
		description: '读取输入的网页链接，解析网页内容并导入知识库，支持定期自动更新',
	},
	{
		value: 'image',
		title: '导入图片文件',
		description: '将基于图片内容进行识别与解析，适合截图、扫描件和图文资料',
	},
	{
		value: 'audio',
		title: '导入音频文件',
		description: '将基于语音音频文件进行自动转写，适合会议纪要和访谈内容',
	},
];

export const IMPORT_SOURCE_OPTIONS: Array<{
	value: ImportSourceType;
	title: string;
	description: string;
}> = [
	{
		value: 'local',
		title: '本地上传',
		description: '上传本地磁盘并导入共享存储服务，支持小批量文件导入',
	},
	{
		value: 'bos',
		title: '百度对象存储（BOS）',
		description: '导入 BOS 中的文件，支持导入大规模低频数据，满足企业级安全合规需求',
	},
];

export const IMPORT_TEMPLATE_OPTIONS: Array<{
	value: ImportTemplateType;
	label: string;
	title: string;
	description: string;
	supportedFormats: string;
}> = [
	{
		value: 'lawDocument',
		label: '法律文书',
		title: '法律文书模板说明',
		description: '基于法律条文结构特性，将文件内容按单条法律条文进行独立切分，确保条条法条清晰完整、检索精准。',
		supportedFormats: '当前支持 doc、docx、pdf 三种格式文件。',
	},
	{
		value: 'contractTemplate',
		label: '合同范本',
		title: '合同范本模板说明',
		description: '根据合同类型、生效时间、合同层级等要素，按合同条款的语义单元智能切分，并自动提取层级标题信息。',
		supportedFormats: '当前支持 doc、docx、pdf 三种格式文件。',
	},
	{
		value: 'resume',
		label: '简历文档',
		title: '简历文档模板说明',
		description: '抽取个人信息、教育经历、项目经验等简历字段，适合人事资料整理和候选人信息对比。',
		supportedFormats: 'doc、docx、txt格式文件',
	},
	{
		value: 'ppt',
		label: 'ppt幻灯片',
		title: '幻灯片模板说明',
		description: '幻灯片模板将文件按页解析，每一页幻灯片内容分别存储在一个切片中，支持上传ppt、pptx、pdf格式文件',
		supportedFormats: '',
	},
	{
		value: 'paper',
		label: '论文文档',
		title: '论文文档模板说明',
		description: '提取摘要、研究方法、实验结论等学术要素，适合论文资料的知识整理与复用。',
		supportedFormats: 'pdf、doc、docx格式文件',
	},
	{
		value: 'structuredQa',
		label: '结构化问答对',
		title: '结构化问答对模板说明',
		description: '问答对模板将识别文档中的问答对信息，并将每一组问答对存储在同一个切片中。建议在问答对之间以空行进行分隔，按图示标注问题与答案信息。',
		supportedFormats: 'doc、docx、txt格式文件',
	},
];

export const IMPORT_BASIC_PARSER_CARD_OPTIONS: Array<{
	key: 'textExtraction' | 'layoutAnalysis' | 'ocr';
	title: string;
	description: string;
	checked?: boolean;
	disabled?: boolean;
	fieldName?: string[];
}> = [
	{
		key: 'textExtraction',
		title: '文字提取',
		description: '基于规则的文档文字提取',
		fieldName: ['parserOptions', 'textExtraction'],
		checked: true,
		disabled: true,
	},
	{
		key: 'layoutAnalysis',
		title: '版面分析',
		description: '识别文档文本排版、标题位置信息',
		fieldName: ['parserOptions', 'layoutAnalysis'],
	},
	{
		key: 'ocr',
		title: '图片文字识别（OCR）',
		description: '识别图片中的文字，适用于文档扫描件等',
		fieldName: ['parserOptions', 'ocr'],
	},
]

export const IMPORT_QA_PARSER_CARD_OPTIONS: Array<{
	value: 'tableParsing';
	title: string;
	description: string;
	checked?: boolean;
	disabled?: boolean;
	fieldName?: string[];
}> = [
	{
		value: 'tableParsing',
		title: '表格内容解析',
		description: '基于规则的文档文字提取',
		fieldName: ['parserOptions', 'tableParsing'],
		checked: true,
		disabled: true,
	},
]

export const IMPORT_WEB_PARSER_CARD_OPTIONS: Array<{
	value: 'webContentParsing';
	title: string;
	description: string;
	checked?: boolean;
	disabled?: boolean;
}> = [
	{
		value: 'webContentParsing',
		title: '网页内容解析',
		description: '基于规则的文档文字提取',
		checked: true,
		disabled: true,
	},
];

export const IMPORT_IMAGE_PARSER_CARD_OPTIONS: Array<{
	value: 'manualParse' | 'ocr';
	title: string;
	description: string;
	disabled?: boolean;
}> = [
	{
		value: 'manualParse',
		title: '手动解析',
		description: '基于规则的文档文字提取',
	},
	{
		value: 'ocr',
		title: '图片文字识别（OCR）',
		description: '识别图片中的文字，适用于文档扫描件等',
	},
];

export const IMPORT_AUDIO_PARSER_CARD_OPTIONS: Array<{
	value: 'asr';
	title: string;
	description: string;
	checked?: boolean;
	disabled?: boolean;
}> = [
	{
		value: 'asr',
		title: '音频解析（ASR）',
		description: '分析识别文件中的语音内容',
		checked: true,
		disabled: true,
	},
];

export const IMPORT_DEEP_PARSER_OPTIONS: Array<{
	value: 'vlm' | 'tableParsing' | 'formulaParsing';
	title: string;
	description: string;
}> = [
	{
		value: 'vlm',
		title: '图片内容理解（VLM）',
		description: '调用多模态大模型，识别图片文字、理解图片内容',
	},
	{
		value: 'tableParsing',
		title: '表格解析',
		description: '识别文件中的折线图、直方图等可视化图表内容',
	},
	{
		value: 'formulaParsing',
		title: '公式解析',
		description: '识别文件中的公式内容',
	},
];

export const KNOWLEDGE_ENHANCEMENT_METHOD_OPTIONS: Array<{
	value: KnowledgeEnhancementMethod;
	label: string;
}> = [
	{
		value: 'questionGeneration',
		label: '问题生成',
	},
	{
		value: 'paragraphSummary',
		label: '段落概要',
	},
	{
		value: 'tripleExtraction',
		label: '三元组知识抽取',
	},
];

export const IMPORT_SLICE_STRATEGY_OPTIONS: Array<{
	value: ImportSliceStrategy;
	title: string;
	description: string;
}> = [
	{
		value: 'default',
		title: '默认切分',
		description: '自动设置切分规则',
	},
	{
		value: 'custom',
		title: '自定义切片',
		description: '配置切分标识符、切片最大长度等选项',
	},
	{
		value: 'whole',
		title: '整文件切片',
		description: '将整篇文档内容存入单一切片',
	},
];

export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
	mode: 'byType',
	fileType: 'document',
	templateType: 'structuredQa',
	sourceType: 'local',
	autoTagging: false,
	selectedTags: [],
	parserOptions: {
		textExtraction: true,
		layoutAnalysis: false,
		ocr: false,
	},
	advancedParsing: false,
	deepParserOptions: {
		vlm: false,
		tableParsing: false,
		formulaParsing: false,
	},
	knowledgeEnhancement: false,
	enhancementMethods: ['questionGeneration'],
	knowledgeGraph: true,
	sliceStrategy: 'default',
	customSliceIdentifiers: [
		'chinesePeriod',
		'englishQuestion',
		'chineseComma',
		'chineseQuestion',
		'englishPeriod',
		'ellipsis',
	],
	customSliceRegexPattern: '',
	customSliceRegexInclusionStrategy: 'suffix',
	customSliceMaxLength: 600,
	customSliceOverlapRatio: 0,
	customSliceReferenceInfo: ['fileName'],
	webParseMode: 'currentPage',
	webUploadMode: 'single',
	webUpdateFrequency: 'manual',
	webSingleInput: '',
	webBatchInput: '',
	webUrls: [],
	webDeduplicate: true,
	webHtmlFilter: false,
	webHtmlFilterSelector: '',
	webExtractLinks: false,
};

export const INITIAL_RECORDS: KnowledgeFileRecord[] = [
	{
		key: '1',
		id: '658dac20-48ad-4272-a0f4-4c6013d6b24f',
		name: '《重点》基于全寿命周期成...',
		status: 'available',
		dataSize: 15112,
		format: 'pdf',
		tags: ['重点'],
		uploader: '张明',
		uploadedAt: '2025-09-18 13:30:12',
		updatedAt: '2025-09-18 13:31:50',
		parserConfig: '多级标题解析',
		sourceType: '共享资源',
	},
	{
		key: '2',
		id: '89fb1e0b-b041-4d46-8f90-70f495ecef22',
		name: '《重点》基于全寿命周期成...',
		status: 'available',
		dataSize: 13609,
		format: 'pdf',
		tags: ['重点', '调研'],
		uploader: '王敏',
		uploadedAt: '2025-09-18 12:58:41',
		updatedAt: '2025-09-18 13:16:08',
		parserConfig: '默认分片策略',
		sourceType: '共享资源',
	},
	{
		key: '3',
		id: '233b3c76-f9d4-4a67-96c5-3b3b1d2a903a',
		name: '处理复杂带表格和图片的转...',
		status: 'available',
		dataSize: 1487,
		format: 'docx',
		tags: [],
		uploader: '李欣',
		uploadedAt: '2025-09-17 19:44:06',
		updatedAt: '2025-09-17 20:10:22',
		parserConfig: '表格增强解析',
		sourceType: '共享资源',
	},
	{
		key: '4',
		id: '4eb8a572-753b-4ba8-8a81-8ed0d65d4da6',
		name: 'LLM Survey副本.pdf',
		status: 'available',
		dataSize: 194555,
		format: 'pdf',
		tags: ['调研'],
		uploader: '张明',
		uploadedAt: '2025-09-17 11:18:22',
		updatedAt: '2025-09-18 09:15:03',
		parserConfig: '默认分片策略',
		sourceType: '共享资源',
	},
	{
		key: '5',
		id: '3aeda979-de83-46a8-b62f-2a2794b39f46',
		name: 'LLM Survey副本.pdf',
		status: 'available',
		dataSize: 195122,
		format: 'pdf',
		tags: [],
		uploader: '刘畅',
		uploadedAt: '2025-09-16 15:27:14',
		updatedAt: '2025-09-16 15:31:42',
		parserConfig: '默认分片策略',
		sourceType: '共享资源',
	},
	{
		key: '6',
		id: 'f6d5b02b-7df1-4c8f-bc0e-5591d7f928a9',
		name: '张明轩简历.pdf',
		status: 'available',
		dataSize: 573,
		format: 'pdf',
		tags: ['简历'],
		uploader: '王敏',
		uploadedAt: '2025-09-15 18:04:50',
		updatedAt: '2025-09-15 18:05:27',
		parserConfig: 'OCR 增强识别',
		sourceType: '共享资源',
	},
	{
		key: '7',
		id: 'c4aee845-41cf-444f-81bf-d8350175c2d4',
		name: '国管公司简介.docx',
		status: 'available',
		dataSize: 1333,
		format: 'docx',
		tags: ['制度'],
		uploader: '李欣',
		uploadedAt: '2025-09-14 10:41:08',
		updatedAt: '2025-09-14 10:50:09',
		parserConfig: '表格增强解析',
		sourceType: '共享资源',
	},
	{
		key: '8',
		id: 'c41235a3-28d0-4375-8dc4-ef53cbf5f2f9',
		name: '国管公司简介.docx',
		status: 'available',
		dataSize: 1333,
		format: 'docx',
		tags: [],
		uploader: '刘畅',
		uploadedAt: '2025-09-14 10:14:33',
		updatedAt: '2025-09-14 10:18:12',
		parserConfig: '默认分片策略',
		sourceType: '共享资源',
	},
];