import {
	AppstoreOutlined,
	CaretDownFilled,
	CloudUploadOutlined,
	DatabaseOutlined,
	FolderOpenFilled,
	InfoCircleOutlined,
	ReloadOutlined,
	SearchOutlined,
	SettingOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import { Button, Flex, Form, Input, Popover, Radio, Select, Segmented, Switch, Tree, Typography, Upload } from 'antd';
import type { DataNode as TreeDataNode } from 'antd/es/tree';
import type { Key } from 'react';
import { useMemo, useState } from 'react';
import { IMPORT_MODE_OPTIONS, TAG_OPTIONS } from '../../../constants';
import type { KnowledgeGroup } from '../../../list/types';
import { collectGroupKeys, filterGroupTree, findGroupPathTitles } from '../../../list/utils';
import { useImportContext } from '../../context';
import {
	downloadQaTemplate,
	getUploadAreaClassName,
	getUploadHintText,
	getUploadTextVariant,
	qaTemplateDownloadOptions,
	shouldShowFileSourceSelector,
	shouldShowFileUploader,
	shouldShowQaTemplateDownloads,
} from '../../formConfig';
import type { EmbeddingModelOption, ImportFormValues, ImportOverviewRow } from '../../types';
import { sourceSelectionOptions } from '../../viewConfig';
import { LabeledRow } from '../Scaffold/LabeledRow';
import { SelectionCardGroup } from '../Scaffold/SelectionCardGroup';
import { TemplatePreview, templateDescriptions } from '../VisualBlocks';

const { Dragger } = Upload;
const { Text } = Typography;

const embeddingModelIcons = [
	<AppstoreOutlined key="appstore" />,
	<ShareAltOutlined key="share" />,
	<DatabaseOutlined key="database-1" />,
	<DatabaseOutlined key="database-2" />,
];

interface AddOverviewGroupSelectProps {
	knowledgeGroup: KnowledgeGroup[];
	value: string;
	onChange: (value: string) => void;
}

interface AddOverviewModelSelectProps {
	modelList: EmbeddingModelOption[];
	value: string;
	onChange: (value: string) => void;
}

export const renderRequiredLabel = (label: string) => (
	<span className="knowledge-import-route__required-label">
		{label}
		<span className="knowledge-import-route__required-mark">*</span>
	</span>
);

const getEmbeddingModelValue = (item?: EmbeddingModelOption) => item?.model_name ?? item?.value ?? '';

const getEmbeddingModelTitle = (item?: EmbeddingModelOption) => item?.model_name ?? item?.title ?? item?.value ?? '暂无可用模型';

const getEmbeddingModelDescription = (item?: EmbeddingModelOption) => item?.description ?? '暂无模型描述';

const getEmbeddingModelBadges = (item?: EmbeddingModelOption) => {
	if (Array.isArray(item?.languages)) {
		return item.languages;
	}

	if (Array.isArray(item?.badges)) {
		return item.badges;
	}

	return [] as string[];
};

const renderModelSelectedLabel = (item: EmbeddingModelOption | undefined, iconIndex: number) => (
	<Flex align="center" gap={10} className="knowledge-import-route__model-selected">
		<span className="knowledge-import-route__model-option-icon">{embeddingModelIcons[iconIndex] ?? <AppstoreOutlined />}</span>
		<Flex align="center" gap={8} wrap flex={1} className="knowledge-import-route__model-selected-copy">
			<span className="knowledge-import-route__model-selected-title">{getEmbeddingModelTitle(item)}</span>
			{getEmbeddingModelBadges(item).slice(0, 2).map((badge) => (
				<span
					key={`selected-label-${getEmbeddingModelValue(item)}-${badge}`}
					className={`knowledge-import-route__model-option-badge knowledge-import-route__model-option-badge--${badge === '推荐' ? 'accent' : 'soft'}`}
				>
					{badge}
				</span>
			))}
		</Flex>
	</Flex>
);

const AddOverviewGroupSelect = ({ knowledgeGroup, value, onChange }: AddOverviewGroupSelectProps) => {
	const groups = knowledgeGroup || [];
	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState('');
	const [draftGroupKey, setDraftGroupKey] = useState(value);
	const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => collectGroupKeys(groups));
	const filteredGroups = useMemo(() => filterGroupTree(groups, keyword), [groups, keyword]);
	const selectedPath = useMemo(() => findGroupPathTitles(groups, value)?.join(' / ') ?? '请选择所属群组', [groups, value]);

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setKeyword('');
			setDraftGroupKey(value);
			setExpandedKeys(collectGroupKeys(groups));
		}
	};

	const treeData = useMemo<TreeDataNode[]>(() => {
		const convert = (items: KnowledgeGroup[], level = 0): TreeDataNode[] =>
			items.map((group) => ({
				key: String(group.group_id ?? ''),
				selectable: group.group_id !== 'all',
				title: (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						className={draftGroupKey === group.group_id ? 'knowledge-import-route__group-tree-node knowledge-import-route__group-tree-node--selected' : 'knowledge-import-route__group-tree-node'}
					>
						<Flex align="center" gap={8} className="knowledge-import-route__group-tree-main">
							<FolderOpenFilled className="knowledge-import-route__group-tree-icon" />
							<span className={level === 0 ? 'knowledge-import-route__group-tree-title knowledge-import-route__group-tree-title--root' : 'knowledge-import-route__group-tree-title'}>
								{group?.name}
							</span>
						</Flex>
						<span className={draftGroupKey === group.group_id ? 'knowledge-import-route__group-tree-count knowledge-import-route__group-tree-count--selected' : 'knowledge-import-route__group-tree-count'}>
							{group.kb_count ?? 0}
						</span>
					</Flex>
				),
				children: group.children ? convert(group.children, level + 1) : undefined,
			}));

		return convert(filteredGroups);
	}, [draftGroupKey, filteredGroups]);

	return (
		<Popover
			trigger="click"
			placement="bottomLeft"
			open={open}
			onOpenChange={handleOpenChange}
			overlayClassName="knowledge-import-route__group-popover"
			content={(
				<Flex vertical className="knowledge-import-route__group-popover-content">
					<Input.Search
						allowClear
						autoFocus
						placeholder="请输入群组名称搜索"
						className="knowledge-import-route__group-search"
						value={keyword}
						onChange={(event) => {
							const nextKeyword = event.target.value;
							setKeyword(nextKeyword);
							if (nextKeyword.trim()) {
								setExpandedKeys(collectGroupKeys(filterGroupTree(groups, nextKeyword)));
								return;
							}

							setExpandedKeys(collectGroupKeys(groups));
						}}
					/>
					<div className="knowledge-import-route__group-popover-tree">
						<Tree
							blockNode
							switcherIcon={<CaretDownFilled className="knowledge-import-route__group-tree-switcher" />}
							expandedKeys={expandedKeys}
							selectedKeys={draftGroupKey ? [draftGroupKey] : []}
							treeData={treeData}
							onExpand={(keys) => setExpandedKeys(keys)}
							onSelect={(keys) => {
								const nextKey = String(keys[0] ?? '');
								setDraftGroupKey(nextKey || value);
							}}
						/>
					</div>
					<Flex justify="flex-end" gap={8} className="knowledge-import-route__group-popover-footer">
						<Button size="small" onClick={() => setOpen(false)}>取消</Button>
						<Button
							type="primary"
							size="small"
							disabled={!draftGroupKey || draftGroupKey === 'all'}
							onClick={() => {
								if (draftGroupKey && draftGroupKey !== 'all') {
									onChange(draftGroupKey);
									setOpen(false);
								}
							}}
						>
							确定
						</Button>
					</Flex>
				</Flex>
			)}
		>
			<button type="button" className="knowledge-import-route__group-trigger">
				<span className="knowledge-import-route__group-trigger-value">{selectedPath}</span>
				<SearchOutlined className="knowledge-import-route__group-trigger-icon" />
			</button>
		</Popover>
	);
};

const AddOverviewModelSelect = ({ modelList, value, onChange }: AddOverviewModelSelectProps) => {
	const safeModelList = Array.isArray(modelList) ? modelList : [];
	const selectedModelOption = useMemo(() => safeModelList.find((item) => getEmbeddingModelValue(item) === value) ?? safeModelList[0], [safeModelList, value]);
	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState('');
	const filteredModels = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase();
		if (!normalizedKeyword) {
			return safeModelList;
		}

		return safeModelList.filter((item) => [getEmbeddingModelTitle(item), getEmbeddingModelDescription(item)].some((text) => text.toLowerCase().includes(normalizedKeyword)));
	}, [keyword, safeModelList]);

	const selectedModelIndex = selectedModelOption
		? Math.max(safeModelList.findIndex((item) => getEmbeddingModelValue(item) === getEmbeddingModelValue(selectedModelOption)), 0)
		: 0;

	return (
		<Flex align="center" gap={8} className="knowledge-import-route__model-select-wrap">
			<Popover
				trigger="click"
				placement="bottomLeft"
				open={open}
				onOpenChange={(nextOpen) => {
					setOpen(nextOpen);
					if (!nextOpen) {
						setKeyword('');
					}
				}}
				overlayClassName="knowledge-import-route__model-popover"
				content={(
					<Flex vertical className="knowledge-import-route__model-popover-content">
						<Flex align="center" justify="space-between" className="knowledge-import-route__model-popover-header">
							<Text strong className="knowledge-import-route__model-popover-title">选择模型服务</Text>
						</Flex>
						<Input
							allowClear
							placeholder="请搜索模型名称"
							prefix={<SearchOutlined className="knowledge-import-route__model-search-icon" />}
							className="knowledge-import-route__model-search-input"
							value={keyword}
							onChange={(event) => setKeyword(event.target.value)}
						/>
						<Flex vertical className="knowledge-import-route__model-list">
							{filteredModels.length ? filteredModels.map((item, index) => {
								const modelValue = getEmbeddingModelValue(item);
								const selected = value === modelValue;

								return (
									<button
										key={modelValue || `model-${index}`}
										type="button"
										className={selected ? 'knowledge-import-route__model-option knowledge-import-route__model-option--selected' : 'knowledge-import-route__model-option'}
										onClick={() => {
											onChange(modelValue);
											setOpen(false);
										}}
									>
										<Flex gap={12} align="flex-start">
											<span className="knowledge-import-route__model-option-icon">{embeddingModelIcons[index] ?? <AppstoreOutlined />}</span>
											<Flex vertical gap={4} flex={1} className="knowledge-import-route__model-option-copy">
												<Flex align="center" gap={8} wrap>
													<Text strong className={`knowledge-import-route__model-option-title${selected ? ' knowledge-import-route__model-option-title--selected' : ''}`}>
														{getEmbeddingModelTitle(item)}
													</Text>
													{getEmbeddingModelBadges(item).map((badge) => (
														<span
															key={`${modelValue}-${badge}`}
															className={`knowledge-import-route__model-option-badge knowledge-import-route__model-option-badge--${badge === '推荐' ? 'accent' : 'soft'}`}
														>
															{badge}
														</span>
													))}
												</Flex>
												<Text type="secondary" className="knowledge-import-route__model-option-description">{getEmbeddingModelDescription(item)}</Text>
											</Flex>
										</Flex>
									</button>
								);
							}) : (
								<div className="knowledge-import-route__model-option knowledge-import-route__model-option--empty">
									<Text type="secondary">暂无可用模型</Text>
								</div>
							)}
						</Flex>
					</Flex>
				)}
			>
				<button type="button" className="knowledge-import-route__model-trigger" disabled={!selectedModelOption}>
					{renderModelSelectedLabel(selectedModelOption, selectedModelIndex)}
					<span className="knowledge-import-route__model-trigger-caret">▾</span>
				</button>
			</Popover>
			<Button
				type="text"
				size="small"
				icon={<ReloadOutlined />}
				className="knowledge-import-route__preview-refresh"
				disabled={!safeModelList.length}
				onClick={() => {
					onChange(getEmbeddingModelValue(safeModelList[0]));
				}}
			/>
		</Flex>
	);
};

export const OverviewValueRows = ({ rows }: { rows: ImportOverviewRow[] }) => (
	<Flex vertical gap={18} className="knowledge-import-route__overview-body">
		{rows.map((item) => (
			<LabeledRow key={item.label} label={item.label} alignStart>
				<Flex align="center" gap={8} className="knowledge-import-route__overview-value">
					{item.withDot ? <span className="knowledge-import-route__radio-dot" /> : null}
					<span>{item.value}</span>
				</Flex>
			</LabeledRow>
		))}
	</Flex>
);

export const AddOverviewNameField = () => {
	const { formValues } = useImportContext();

	return (
		<LabeledRow label={renderRequiredLabel('知识库名称')} alignStart>
			<Flex vertical gap={8} className="knowledge-import-route__preview-field-stack">
				<Form.Item name="knowledge_name" rules={[{ required: true, message: '请输入知识库名称' }]} className="knowledge-import-route__form-item">
					<Input
						maxLength={50}
						placeholder="请输入知识库名称"
						className="knowledge-import-route__preview-input-field"
						suffix={<span className="knowledge-import-route__preview-inline-count">{formValues.knowledge_name?.length ?? 0} / 50</span>}
					/>
				</Form.Item>
				<Text type="secondary" className="knowledge-import-route__preview-helper">支持中文、英文、数字、下划线（_）、中划线（-）、英文点（.）</Text>
			</Flex>
		</LabeledRow>
	);
};

export const AddOverviewDescriptionField = () => {
	const { formValues } = useImportContext();

	return (
		<LabeledRow label="知识库备注" alignStart>
			<Flex vertical gap={8} className="knowledge-import-route__preview-field-stack">
				<Form.Item name="description" className="knowledge-import-route__form-item">
					<Input.TextArea
						rows={4}
						maxLength={400}
						placeholder="请输入知识库内容简述说明，便于查找和管理知识库。备注不影响 Agent 知识召回时的消耗效果"
						className="knowledge-import-route__preview-textarea-field"
					/>
				</Form.Item>
				<Flex justify="space-between" align="center">
					<span className="knowledge-import-route__preview-counter-inline">{formValues.description?.length ?? 0} / 400</span>
					<Button type="link" size="small" className="knowledge-import-route__link-button">使用模板</Button>
				</Flex>
			</Flex>
		</LabeledRow>
	);
};

export const AddOverviewGroupField = () => {
	const { form, formValues, knowledgeGroup } = useImportContext();

	return (
		<LabeledRow label={renderRequiredLabel('所属群组')}>
			<Form.Item hidden name="group_id" rules={[{ required: true, message: '请选择所属群组' }]} className="knowledge-import-route__form-item">
				<Input type="hidden" />
			</Form.Item>
			<AddOverviewGroupSelect knowledgeGroup={knowledgeGroup} value={formValues.group_id} onChange={(nextValue) => form.setFieldValue('group_id', nextValue)} />
		</LabeledRow>
	);
};

export const AddOverviewEmbeddingModelField = () => {
	const { form, formValues, modelList } = useImportContext();

	return (
		<LabeledRow
			label={renderRequiredLabel('向量模型')}
			tooltip={{
				title: '向量模型用于将知识内容转成向量，影响检索召回效果。',
				color: '#fff',
				icon: <InfoCircleOutlined />,
			}}
		>
			<Form.Item hidden name="embeddingModel" rules={[{ required: true, message: '请选择向量模型' }]} className="knowledge-import-route__form-item">
				<Input type="hidden" />
			</Form.Item>
			<AddOverviewModelSelect modelList={modelList} value={formValues.embeddingModel} onChange={(nextValue) => form.setFieldValue('embeddingModel', nextValue)} />
		</LabeledRow>
	);
};


export const ImportModeField = () => {
	const { form } = useImportContext();

	return (
		<LabeledRow label="导入方式">
			<Form.Item name="mode" noStyle>
				<Segmented
					options={IMPORT_MODE_OPTIONS.map((item) => ({ label: item.label, value: item.value }))}
					onChange={(value) => {
						if (value === 'byTemplate') {
							form.setFieldsValue({
								templateType: form.getFieldValue('templateType') ?? 'structuredQa',
								doc_category: 'text',
							});
						}
					}}
				/>
			</Form.Item>
		</LabeledRow>
	);
};

export const TemplateTypeField = () => {
	const { formValues } = useImportContext();
	const activeTemplate = templateDescriptions[formValues.templateType as keyof typeof templateDescriptions];

	return (
		<LabeledRow label="模板类型" alignStart>
			<Flex vertical gap={16} style={{ width: '100%' }}>
				<Form.Item name="templateType" className="knowledge-import-route__form-item">
					<Radio.Group className="knowledge-import-route__template-radio-group">
						{Object.values(templateDescriptions).map((option) => (
							<Radio key={option.value} value={option.value} className="knowledge-import-route__template-radio">{option.label}</Radio>
						))}
					</Radio.Group>
				</Form.Item>
				<div className="knowledge-import-route__template-panel">
					<Flex vertical gap={10} className="knowledge-import-route__template-panel-copy">
						<Text strong className="knowledge-import-route__template-panel-title">{activeTemplate?.title}</Text>
						<Text type="secondary" className="knowledge-import-route__template-panel-description">{activeTemplate?.description}</Text>
						<Text type="secondary" className="knowledge-import-route__template-panel-formats">{activeTemplate?.supportedFormats}</Text>
					</Flex>
					<TemplatePreview templateType={formValues.templateType} />
				</div>
			</Flex>
		</LabeledRow>
	);
};

export const ImportSourceTypeField = () => {
	const { form, formValues } = useImportContext();

	if (!shouldShowFileSourceSelector(formValues)) {
		return null;
	}

	return (
		<LabeledRow label={renderRequiredLabel('导入来源')} alignStart>
			<Form.Item name="sourceType" hidden>
				<input />
			</Form.Item>
			<SelectionCardGroup
				options={sourceSelectionOptions}
				value={formValues.sourceType}
				onChange={(value) => {
					form.setFieldValue('sourceType', value);
				}}
				columns={3}
			/>
		</LabeledRow>
	);
};

export const FileUploaderField = () => {
	const { form, formValues, uploadProps, getUploadFileList } = useImportContext();

	if (!shouldShowFileUploader(formValues)) {
		return null;
	}

	return (
		<LabeledRow label="">
			<Form.Item
				name="pendingFiles"
				valuePropName="fileList"
				getValueFromEvent={getUploadFileList}
				className="knowledge-import-route__form-item"
				rules={[
					{
						validator: async (_, value) => {
							if (!shouldShowFileUploader(form.getFieldsValue(true) as ImportFormValues)) {
								return;
							}

							if (Array.isArray(value) && value.length > 0) {
								return;
							}

							throw new Error('请先选择要导入的文件');
						},
					},
				]}
			>
				<Dragger {...uploadProps} className={getUploadAreaClassName(formValues)}>
					<p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
					<p className={`ant-upload-text knowledge-import-route__upload-text knowledge-import-route__upload-text--${getUploadTextVariant(formValues)}`}>
						将文档拖到此处，或<span className="knowledge-import-route__upload-text-action">点击上传</span>
					</p>
					<p className="ant-upload-hint">{getUploadHintText(formValues)}</p>
					{shouldShowQaTemplateDownloads(formValues) ? (
						<div className="knowledge-import-route__template-downloads">
							<span className="knowledge-import-route__template-downloads-label">模板下载</span>
							<div className="knowledge-import-route__template-downloads-actions">
								{qaTemplateDownloadOptions.map((option) => (
									<Button
										key={option.key}
										type="default"
										className="knowledge-import-route__template-download-button"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											downloadQaTemplate(option.key);
										}}
									>
										<span className={`knowledge-import-route__template-download-badge knowledge-import-route__template-download-badge--${option.tone}`}>{option.badge}</span>
										{option.label}
									</Button>
								))}
							</div>
						</div>
					) : null}
				</Dragger>
			</Form.Item>
		</LabeledRow>
	);
};

export const TagSelectionField = () => {
	const { form, formValues } = useImportContext();

	return (
		<LabeledRow
			label={renderRequiredLabel('标签选择')}
			tooltip={{
				title: '支持为文件添加标签。每个标签由标签名和标签值组成，帮助更精准地组织和检索内容',
				color: '#fff',
				icon: <InfoCircleOutlined />,
			}}
			alignStart
		>
			<Flex vertical gap={12} style={{ width: '100%' }}>
				<Form.Item name="autoTagging" valuePropName="checked" className="knowledge-import-route__form-item">
					<Switch
						onChange={(checked) => {
							if (!checked) {
								form.setFieldValue('selectedTags', []);
							}
						}}
					/>
				</Form.Item>
				{formValues.autoTagging ? (
					<Form.Item name="selectedTags" className="knowledge-import-route__form-item">
						<Select
							mode="multiple"
							showSearch
							allowClear
							placeholder="请选择标签"
							style={{ width: '100%' }}
							options={TAG_OPTIONS.map((tag) => ({ label: tag, value: tag }))}
							notFoundContent="未找到相关结果"
							popupRender={(originNode) => (
								<Flex vertical>
									{originNode}
									<Flex justify="flex-end" align="center" style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0' }}>
										<Button type="link" icon={<SettingOutlined />} className="knowledge-import-route__link-button">标签管理</Button>
									</Flex>
								</Flex>
							)}
						/>
					</Form.Item>
				) : null}
			</Flex>
		</LabeledRow>
	);
};
