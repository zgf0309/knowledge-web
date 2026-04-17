import type {
	KnowledgeBaseRecord,
	KnowledgeBatchMoveState,
	KnowledgeGroup,
} from './types';

export const DEFAULT_GROUPS: KnowledgeGroup[] = [];

export const INITIAL_RECORDS: KnowledgeBaseRecord[] = [
	{
		group_id: 'all',
		knowledge_name: '测试知识库',
		knowledge_id: '241b5eb7-c108-474d-bf1d-cd76f0f812a1',
		knowledge_desc: '陈述：一句话描述，简要说明知识库用途',
		language: 'zh-CN',
		scope: 0,
		status: 'ready',
		tenant_id: 'mock-tenant',
		create_date: '2026-03-31',
		create_time: '11:22:58',
	},
];

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

export const INITIAL_BATCH_MOVE_STATE: KnowledgeBatchMoveState = {
	open: false,
};
