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
} from '../constants';
import type { ImportFileType, ImportSourceType } from '../types';
import type {
  ImportCheckboxCardOption,
  ImportOverviewRow,
  ImportSelectionOption,
} from './types';

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

export const fileTypeSelectionOptions: Array<
  ImportSelectionOption<ImportFileType>
> = IMPORT_FILE_TYPE_OPTIONS.map((option) => ({
  ...option,
  icon: FILE_TYPE_ICON_MAP[option.value],
}));

export const sourceSelectionOptions: Array<
  ImportSelectionOption<ImportSourceType>
> = IMPORT_SOURCE_OPTIONS.map((option) => ({
  ...option,
  icon: SOURCE_ICON_MAP[option.value],
}));

export const basicParserCardOptions: ImportCheckboxCardOption[] =
  IMPORT_BASIC_PARSER_CARD_OPTIONS.map((option) => ({
    ...option,
    fieldName: option.fieldName || ['parserOptions', option.key],
  }));

export const deepParserCardOptions: ImportCheckboxCardOption[] =
  IMPORT_DEEP_PARSER_OPTIONS.map((option) => ({
    key: option.value,
    title: option.title,
    description: option.description,
    fieldName: ['deepParserOptions', option.value],
  }));

export const knowledgeDefinitionRows: ImportOverviewRow[] = [
  {
    label: '知识库名称：',
    value: '创建后自动生成',
  },
  {
    label: '知识库备注：',
    value: '根据创建知识库时填写的描述展示',
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
    value: '共享资源',
  },
];
