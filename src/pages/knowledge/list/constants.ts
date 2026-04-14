import type {
	KnowledgeBaseRecord,
	KnowledgeBatchMoveState,
	KnowledgeEditorState,
	KnowledgeGroup,
	KnowledgePageState,
} from './types';

export const DEFAULT_GROUPS: KnowledgeGroup[] = [
	{
		key: 'all',
		title: '全部群组',
		children: [
			{ key: 'group-1', title: '测试1', children: [{ key: 'group-1-1', title: '1234' }] },
			{ key: 'group-2', title: '测试' },
		],
	},
];

export const INITIAL_RECORDS: KnowledgeBaseRecord[] = [
	{
		key: 'kb-1',
		name: '测试知识库',
		id: '241b5eb7-c108-474d-bf1d-cd76f0f812a1',
		description: '陈述：一句话描述，简要说明知识库用途',
		documentCount: 1,
		advancedUsage: null,
		sourceType: '共享资源',
		embeddingModel: 'multilingual-embedding',
		clusterName: '-',
		updatedAt: '2026-04-09 14:44:47',
		createdAt: '2026-03-31 11:22:58',
		groupKey: 'group-2',
	},
];

export const SOURCE_OPTIONS = ['共享资源', '专属资源'];
export const EMBEDDING_MODEL_PRESETS = [
	{
		value: 'multilingual-embedding',
		title: 'multilingual-embedding',
		description: '通用多语言，支持长上下文',
		badges: ['免费', '推荐', '向量表示'],
	},
	{
		value: 'Qwen3-Embedding-4B',
		title: 'Qwen3-Embedding-4B',
		description: '支持 100+ 种语言，兼顾效率与精度',
		badges: ['推荐', '向量表示'],
	},
	{
		value: 'bge-large-en',
		title: 'bge-large-en',
		description: '专注英文，专攻文本表征、检索任务',
		badges: ['向量表示'],
	},
	{
		value: 'bge-large-zh',
		title: 'bge-large-zh',
		description: '专注中文，专攻文本表征、检索任务',
		badges: ['向量表示'],
	},
] as const;

export const EMBEDDING_MODEL_OPTIONS = EMBEDDING_MODEL_PRESETS.map((item) => item.value);

export const INITIAL_PAGE_STATE: KnowledgePageState = {
	current: 1,
	pageSize: 10,
};

export const INITIAL_EDITOR_STATE: KnowledgeEditorState = {
	open: false,
	mode: 'create',
};

export const INITIAL_BATCH_MOVE_STATE: KnowledgeBatchMoveState = {
	open: false,
};
