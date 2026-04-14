import type { UploadFile } from 'antd';
import type { ReactNode } from 'react';
import type { ImportConfig } from '../types';

export interface ImportFormValues extends ImportConfig {
	pendingFiles: UploadFile[];
	webBatchFiles: UploadFile[];
	name: string;
	description?: string;
	groupKey: string;
	embeddingModel: string;
	storageResource: 'shared' | 'bes' | 'vectorDb';
}

export interface ImportSelectionOption<T extends string> {
	value: T;
	title: string;
	description: string;
	icon?: ReactNode;
}

export interface ImportCheckboxCardOption {
	key: string;
	title: string;
	description: string;
	fieldName?: Array<string | number>;
	checked?: boolean;
	disabled?: boolean;
}

export interface ImportOverviewRow {
	label: string;
	value: string;
	withDot?: boolean;
}