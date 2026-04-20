import {
	CloudServerOutlined,
	FileImageOutlined,
	FileTextOutlined,
	LinkOutlined,
	SoundOutlined,
	TableOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import {
	IMPORT_BASIC_PARSER_CARD_OPTIONS,
	IMPORT_DEEP_PARSER_OPTIONS,
	IMPORT_FILE_TYPE_OPTIONS,
	IMPORT_SOURCE_OPTIONS,
	KNOWLEDGE_BASE,
} from '../constants';
import type { ImportFileType, ImportSourceType } from '../types';
import type { ImportCheckboxCardOption, ImportOverviewRow, ImportSelectionOption } from './types';

const FILE_TYPE_ICON_MAP: Record<ImportFileType, ReactNode> = {
	text: <FileTextOutlined />,
	table: <TableOutlined />,
	web: <LinkOutlined />,
	image: <FileImageOutlined />,
	audio: <SoundOutlined />,
};

const SOURCE_ICON_MAP: Record<ImportSourceType, ReactNode> = {
	local: <UploadOutlined />,
	bos: <CloudServerOutlined />,
};

export const fileTypeSelectionOptions: Array<ImportSelectionOption<ImportFileType>> =
	IMPORT_FILE_TYPE_OPTIONS.map((option) => ({
		...option,
		icon: FILE_TYPE_ICON_MAP[option.value],
	}));

export const sourceSelectionOptions: Array<ImportSelectionOption<ImportSourceType>> =
	IMPORT_SOURCE_OPTIONS.map((option) => ({
		...option,
		icon: SOURCE_ICON_MAP[option.value],
	}));

export const basicParserCardOptions: ImportCheckboxCardOption[] = IMPORT_BASIC_PARSER_CARD_OPTIONS.map((option) => ({
	...option,
	fieldName: option.fieldName || ['parserOptions', option.key],
}));

export const deepParserCardOptions: ImportCheckboxCardOption[] = IMPORT_DEEP_PARSER_OPTIONS.map((option) => ({
	key: option.value,
	title: option.title,
	description: option.description,
	fieldName: ['deepParserOptions', option.value],
}));

export const knowledgeDefinitionRows: ImportOverviewRow[] = [
	{
		label: '知识库名称：',
		value: KNOWLEDGE_BASE.name || '测试知识库',
	},
	{
		label: '知识库备注：',
		value:
			'概述：一句话描述，简要说明知识库的核心内容和使用目的。主要内容：[文件二名称]、[对该主题的简短描述，包括关键问题概览] [文件二名称]、[对该主题的简短描述，包括关键词或概念] [文件三名称]、[对该主题的简短描述，包括关键词或概念] 适用场景：[描述用户类型的查询或问题，这个知识库能够提供帮助]',
	},
];

export const knowledgeConfigRows: ImportOverviewRow[] = [
	{
		label: '向量模型：',
		value: 'multilingual-embedding',
		withDot: true,
	},
	{
		label: '存储检索资源：',
		value: KNOWLEDGE_BASE.sourceType,
	},
];