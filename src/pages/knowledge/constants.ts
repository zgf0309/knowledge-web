import type {
  ImportConfig,
  ImportFileType,
  ImportSliceStrategy,
  ImportSourceType,
  ImportTemplateType,
  KnowledgeBaseInfo,
  KnowledgeEnhancementMethod,
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
export const PARSER_OPTIONS = [
  '默认分片策略',
  '表格增强解析',
  '多级标题解析',
  'OCR 增强识别',
];

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
    value: 'text',
    title: '导入文本文件数据',
    description: '将基于上传的文本文件直接进行切分处理',
  },
  {
    value: 'table',
    title: '导入表格型知识数据',
    description: '将表格类内容转成问答对，适合结构化文档和批量知识库',
  },
  {
    value: 'web',
    title: '读取网页数据源',
    description:
      '读取输入的网页链接，解析网页内容并导入知识库，支持定期自动更新',
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
    description:
      '导入 BOS 中的文件，支持导入大规模低频数据，满足企业级安全合规需求',
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
    description:
      '基于法律条文结构特性，将文件内容按单条法律条文进行独立切分，确保条条法条清晰完整、检索精准。',
    supportedFormats: '当前支持 doc、docx、pdf 三种格式文件。',
  },
  {
    value: 'contractTemplate',
    label: '合同范本',
    title: '合同范本模板说明',
    description:
      '根据合同类型、生效时间、合同层级等要素，按合同条款的语义单元智能切分，并自动提取层级标题信息。',
    supportedFormats: '当前支持 doc、docx、pdf 三种格式文件。',
  },
  {
    value: 'resume',
    label: '简历文档',
    title: '简历文档模板说明',
    description:
      '抽取个人信息、教育经历、项目经验等简历字段，适合人事资料整理和候选人信息对比。',
    supportedFormats: 'doc、docx、txt格式文件',
  },
  {
    value: 'ppt',
    label: 'ppt幻灯片',
    title: '幻灯片模板说明',
    description:
      '幻灯片模板将文件按页解析，每一页幻灯片内容分别存储在一个切片中，支持上传ppt、pptx、pdf格式文件',
    supportedFormats: '',
  },
  {
    value: 'paper',
    label: '论文文档',
    title: '论文文档模板说明',
    description:
      '提取摘要、研究方法、实验结论等学术要素，适合论文资料的知识整理与复用。',
    supportedFormats: 'pdf、doc、docx格式文件',
  },
  {
    value: 'structuredQa',
    label: '结构化问答对',
    title: '结构化问答对模板说明',
    description:
      '问答对模板将识别文档中的问答对信息，并将每一组问答对存储在同一个切片中。建议在问答对之间以空行进行分隔，按图示标注问题与答案信息。',
    supportedFormats: 'doc、docx、txt格式文件',
  },
];

export const IMPORT_BASIC_PARSER_CARD_OPTIONS: Array<{
  key: 'text_extraction' | 'layout_analysis' | 'image_ocr';
  title: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  fieldName?: string[];
}> = [
  {
    key: 'text_extraction',
    title: '文字提取',
    description: '基于规则的文档文字提取',
    fieldName: ['parserOptions', 'text_extraction'],
    checked: true,
    disabled: true,
  },
  {
    key: 'layout_analysis',
    title: '版面分析',
    description: '识别文档文本排版、标题位置信息',
    fieldName: ['parserOptions', 'layout_analysis'],
  },
  {
    key: 'image_ocr',
    title: '图片文字识别（OCR）',
    description: '识别图片中的文字，适用于文档扫描件等',
    fieldName: ['parserOptions', 'image_ocr'],
  },
];

export const IMPORT_QA_PARSER_CARD_OPTIONS: Array<{
  value: 'table_parsing';
  title: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  fieldName?: string[];
}> = [
  {
    value: 'table_parsing',
    title: '表格内容解析',
    description: '基于规则的文档文字提取',
    fieldName: ['parserOptions', 'table_parsing'],
    checked: true,
    disabled: true,
  },
];

export const IMPORT_WEB_PARSER_CARD_OPTIONS: Array<{
  value: 'web_content_parsing';
  title: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  fieldName?: string[];
}> = [
  {
    value: 'web_content_parsing',
    title: '网页内容解析',
    description: '基于规则的文档文字提取',
    fieldName: ['parserOptions', 'web_content_parsing'],
    checked: true,
    disabled: true,
  },
];

export const IMPORT_IMAGE_PARSER_CARD_OPTIONS: Array<{
  value: 'manualParse' | 'image_ocr';
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
    value: 'image_ocr',
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
  value:
    | 'multimodal_understanding'
    | 'chart_recognition'
    | 'formula_recognition';
  title: string;
  description: string;
}> = [
  {
    value: 'multimodal_understanding',
    title: '图片内容理解（VLM）',
    description: '调用多模态大模型，识别图片文字、理解图片内容',
  },
  {
    value: 'chart_recognition',
    title: '图表解析',
    description: '识别文件中的折线图、直方图等可视化图表内容',
  },
  {
    value: 'formula_recognition',
    title: '公式解析',
    description: '识别文件中的公式内容',
  },
];

export const KNOWLEDGE_ENHANCEMENT_METHOD_OPTIONS: Array<{
  value: KnowledgeEnhancementMethod;
  label: string;
}> = [
  {
    value: 'question_generation',
    label: '问题生成',
  },
  {
    value: 'paragraph_summary',
    label: '段落概要',
  },
  {
    value: 'triple_extraction',
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
  {
    value: 'page',
    title: '按页切片',
    description: '将文档按页进行切片',
  },
];

export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  mode: 'byType',
  doc_category: 'text',
  templateType: 'structuredQa',
  sourceType: 'local',
  autoTagging: false,
  selectedTags: [],
  parserOptions: {
    text_extraction: true,
    layout_analysis: false,
    image_ocr: false,
    table_parsing: false,
    web_content_parsing: false,
  },
  advancedParsing: false,
  deepParserOptions: {
    multimodal_understanding: false,
    chart_recognition: false,
    formula_recognition: false,
    asr: false,
  },
  knowledge_enhancement: false,
  enhancement_methods: ['question_generation'],
  knowledge_graph_extraction: true,
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
    document_id: 'doc_259a4488fc614ebd',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: '《重点》基于全寿命周期成本的设计方案.pdf',
    doc_type: 'pdf',
    location: 'oss://knowledge/doc_259a4488fc614ebd.pdf',
    doc_category: 'text',
    template_type: null,
    tags: ['重点'],
    parser_id: 'multi_heading',
    parser_config: { strategy: '多级标题解析' },
    chunk_count: 56,
    token_num: 15112,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: 'a1b2c3d4',
    doc_metadata: { uploader: '张明' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-18 13:30:12',
    update_time: '2025-09-18 13:31:50',
  },
  {
    document_id: 'doc_89fb1e0bb0414d46',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: '《重点》全寿命周期成本调研报告.pdf',
    doc_type: 'pdf',
    location: 'oss://knowledge/doc_89fb1e0bb0414d46.pdf',
    doc_category: 'text',
    template_type: null,
    tags: ['重点', '调研'],
    parser_id: 'default',
    parser_config: { strategy: '默认分片策略' },
    chunk_count: 48,
    token_num: 13609,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '王敏' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-18 12:58:41',
    update_time: '2025-09-18 13:16:08',
  },
  {
    document_id: 'doc_233b3c76f9d44a67',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: '处理复杂带表格和图片的转换说明.docx',
    doc_type: 'docx',
    location: 'oss://knowledge/doc_233b3c76f9d44a67.docx',
    doc_category: 'text',
    template_type: null,
    tags: [],
    parser_id: 'table_enhanced',
    parser_config: { strategy: '表格增强解析' },
    chunk_count: 12,
    token_num: 1487,
    progress: 60,
    progress_msg: 'parsing',
    status: 'processing',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '李欣' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-17 19:44:06',
    update_time: '2025-09-17 20:10:22',
  },
  {
    document_id: 'doc_4eb8a572753b4ba8',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: 'LLM Survey副本.pdf',
    doc_type: 'pdf',
    location: 'oss://knowledge/doc_4eb8a572753b4ba8.pdf',
    doc_category: 'text',
    template_type: null,
    tags: ['调研'],
    parser_id: 'default',
    parser_config: { strategy: '默认分片策略' },
    chunk_count: 320,
    token_num: 194555,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '张明' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-17 11:18:22',
    update_time: '2025-09-18 09:15:03',
  },
  {
    document_id: 'doc_3aeda979de8346a8',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: 'LLM Survey副本(1).pdf',
    doc_type: 'pdf',
    location: 'oss://knowledge/doc_3aeda979de8346a8.pdf',
    doc_category: 'text',
    template_type: null,
    tags: [],
    parser_id: 'default',
    parser_config: { strategy: '默认分片策略' },
    chunk_count: 322,
    token_num: 195122,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '刘畅' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-16 15:27:14',
    update_time: '2025-09-16 15:31:42',
  },
  {
    document_id: 'doc_f6d5b02b7df14c8f',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: '张明轩简历.pdf',
    doc_type: 'pdf',
    location: 'oss://knowledge/doc_f6d5b02b7df14c8f.pdf',
    doc_category: 'text',
    template_type: 'resume',
    tags: ['简历'],
    parser_id: 'ocr_enhanced',
    parser_config: { strategy: 'OCR 增强识别' },
    chunk_count: 4,
    token_num: 573,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '王敏' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-15 18:04:50',
    update_time: '2025-09-15 18:05:27',
  },
  {
    document_id: 'doc_c4aee84541cf444f',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: '国管公司简介.docx',
    doc_type: 'docx',
    location: 'oss://knowledge/doc_c4aee84541cf444f.docx',
    doc_category: 'text',
    template_type: null,
    tags: ['制度'],
    parser_id: 'table_enhanced',
    parser_config: { strategy: '表格增强解析' },
    chunk_count: 8,
    token_num: 1333,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '李欣' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-14 10:41:08',
    update_time: '2025-09-14 10:50:09',
  },
  {
    document_id: 'doc_c41235a328d04375',
    knowledge_id: KNOWLEDGE_BASE.id,
    tenant_id: 'tenant_default',
    doc_name: '国管公司简介(1).docx',
    doc_type: 'docx',
    location: 'oss://knowledge/doc_c41235a328d04375.docx',
    doc_category: 'text',
    template_type: null,
    tags: [],
    parser_id: 'default',
    parser_config: { strategy: '默认分片策略' },
    chunk_count: 8,
    token_num: 1333,
    progress: 100,
    progress_msg: 'success',
    status: 'available',
    run: 1,
    content_hash: null,
    doc_metadata: { uploader: '刘畅' },
    source_type: 'local',
    source_url: null,
    create_time: '2025-09-14 10:14:33',
    update_time: '2025-09-14 10:18:12',
  },
];
