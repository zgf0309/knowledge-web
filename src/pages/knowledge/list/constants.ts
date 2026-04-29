import type {
	KnowledgeBaseRecord,
	KnowledgeBatchMoveState,
	KnowledgeGroup,
} from './types';

export const DEFAULT_GROUPS: KnowledgeGroup[] = [];

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
