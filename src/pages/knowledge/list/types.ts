import type { Key } from 'react';

export interface KnowledgeGroup {
	key: string;
	title: string;
	children?: KnowledgeGroup[];
}

export interface KnowledgeBaseRecord {
	key: string;
	name: string;
	id: string;
	description: string;
	documentCount: number;
	advancedUsage: number | null;
	sourceType: string;
	embeddingModel: string;
	clusterName: string;
	updatedAt: string;
	createdAt: string;
	groupKey: string;
}

export interface KnowledgeFormValues {
	name: string;
	description?: string;
	groupKey: string;
	sourceType: string;
	embeddingModel: string;
	clusterName?: string;
}

export interface KnowledgeEditorState {
	open: boolean;
	mode: 'create' | 'edit';
	recordKey?: string;
}

export interface KnowledgePageState {
	current: number;
	pageSize: number;
}

export interface KnowledgeBatchMoveState {
	open: boolean;
	targetGroupKey?: string;
}

export type KnowledgeRowKey = Key;
