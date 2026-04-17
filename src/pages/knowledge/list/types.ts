import { keys } from 'lodash';
import type { Key } from 'react';

export interface KnowledgeGroup {
	group_id: string | null;
	name: string;
	description: string;
	parent_id: string | null;
	kb_count?: number;
	children?: KnowledgeGroup[];
	[key: string]: any;
}

export interface KnowledgeBaseRecord {
	group_id?: string;
	knowledge_name: string;
	knowledge_id: string;
	knowledge_desc: string;
	language: string;
	scope: number | null;
	status: string;
	tenant_id: string;
	create_date: string;
	create_time: string;
}
export interface KnowledgeFormValues {
	knowledge_name: string;
	knowledge_id: string;
	knowledge_desc: string;
	language: string;
	scope: number | null;
	status: string;
	tenant_id: string;
	create_date: string;
	create_time: string;
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
