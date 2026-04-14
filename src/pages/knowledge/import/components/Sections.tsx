import {
	AppstoreOutlined,
	CaretDownFilled,
	CloudServerOutlined,
	CloudUploadOutlined,
	DatabaseOutlined,
	FolderOpenFilled,
	InfoCircleOutlined,
	ReloadOutlined,
	SearchOutlined,
	SettingOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import { Button, Flex, Form, Input, Popover, Radio, Segmented, Select, Switch, Tree, Typography, Upload } from 'antd';
import type { UploadProps } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { MessageInstance } from 'antd/es/message/interface';
import type { TreeDataNode } from 'antd/es/tree';
import type { Key } from 'react';
import { useMemo, useState } from 'react';
import {
	IMPORT_MODE_OPTIONS,
	TAG_OPTIONS,
} from '../../constants';
import { DEFAULT_GROUPS, EMBEDDING_MODEL_PRESETS, INITIAL_RECORDS } from '../../list/constants';
import type { KnowledgeGroup } from '../../list/types';
import { collectGroupKeys, filterGroupTree, findGroupPathTitles, getGroupCounts } from '../../list/utils';
import {
	downloadQaTemplate,
	getUploadAreaClassName,
	getUploadHintText,
	getUploadTextVariant,
	qaTemplateDownloadOptions,
	shouldShowFileSourceSelector,
	shouldShowFileUploader,
	shouldShowQaTemplateDownloads,
	shouldShowWebConfig,
} from '../formConfig';
import type { ImportFormValues } from '../types';
import {
	fileTypeSelectionOptions,
	knowledgeConfigRows,
	knowledgeDefinitionRows,
	sourceSelectionOptions,
} from '../viewConfig';
import { ImportParserSection, ImportSliceSection } from './ParserSections';
import { ImportSection, LabeledRow, SelectionCardGroup } from './Scaffold';
import { TemplatePreview, templateDescriptions } from './VisualBlocks';
import { ImportWebSourceFields } from './WebImportFields';

const { Dragger } = Upload;
const { Text } = Typography;

const addKnowledgeStorageOptions = [
	{
		key: 'shared',
		title: '共享资源池',
		description: '使用共享资源池，支持小规模文件检索。',
		icon: <ShareAltOutlined />,
		active: true,
	},
	{
		key: 'bes',
		title: '百度 ElasticSearch（BES）',
		description: '使用 BES 托管资源，支持向量存储、数据隔离、高性能大规模文件检索。',
		icon: <CloudServerOutlined />,
	},
	{
		key: 'vectorDb',
		title: '百度向量数据库 VectorDB',
		description: '使用独享资源可支持百亿级向量规模托管，毫秒级混合、全文检索查询。',
		icon: <DatabaseOutlined />,
		badge: '推荐',
		badgeTone: 'hot',
	},
];

// 统一渲染必填标签，避免在多个区域重复拼接红色星号。
const renderRequiredLabel = (label: string) => (
	<span className="knowledge-import-route__required-label">
		{label}
		<span className="knowledge-import-route__required-mark">*</span>
	</span>
);

interface ImportOverviewStepProps {
	type: 'import' | 'add';
	form: FormInstance<ImportFormValues>;
	formValues: ImportFormValues;
}

const embeddingModelIcons = [<AppstoreOutlined />, <ShareAltOutlined />, <DatabaseOutlined />, <DatabaseOutlined />];

const addStepFieldNames: Array<keyof ImportFormValues> = ['name', 'groupKey', 'embeddingModel', 'storageResource'];

interface AddOverviewFieldSelectProps {
	value: string;
	onChange: (value: string) => void;
}

const renderModelSelectedLabel = (item: (typeof EMBEDDING_MODEL_PRESETS)[number], iconIndex: number) => (
	<Flex align="center" gap={10} className="knowledge-import-route__model-selected">
		<span className="knowledge-import-route__model-option-icon">{embeddingModelIcons[iconIndex] ?? <AppstoreOutlined />}</span>
		<Flex align="center" gap={8} wrap flex={1} className="knowledge-import-route__model-selected-copy">
			<span className="knowledge-import-route__model-selected-title">{item.title}</span>
			{item.badges.slice(0, 2).map((badge) => (
				<span
					key={`selected-label-${item.value}-${badge}`}
					className={`knowledge-import-route__model-option-badge knowledge-import-route__model-option-badge--${badge === '推荐' ? 'accent' : 'soft'}`}
				>
					{badge}
				</span>
			))}
		</Flex>
	</Flex>
);

const AddOverviewGroupSelect = ({ value, onChange }: AddOverviewFieldSelectProps) => {
	const groups = DEFAULT_GROUPS;
	const groupCountMap = useMemo(() => getGroupCounts(groups, INITIAL_RECORDS), [groups]);
	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState('');
	const [draftGroupKey, setDraftGroupKey] = useState(value);
	const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => collectGroupKeys(groups));

	const filteredGroups = useMemo(() => filterGroupTree(groups, keyword), [groups, keyword]);
	const selectedPath = useMemo(
		() => findGroupPathTitles(groups, value)?.join(' / ') ?? '请选择所属群组',
		[groups, value],
	);

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
				key: group.key,
				selectable: group.key !== 'all',
				title: (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						className={
							draftGroupKey === group.key
								? 'knowledge-import-route__group-tree-node knowledge-import-route__group-tree-node--selected'
								: 'knowledge-import-route__group-tree-node'
						}
					>
						<Flex align="center" gap={8} className="knowledge-import-route__group-tree-main">
							<FolderOpenFilled className="knowledge-import-route__group-tree-icon" />
							<span
								className={
									level === 0
										? 'knowledge-import-route__group-tree-title knowledge-import-route__group-tree-title--root'
										: 'knowledge-import-route__group-tree-title'
								}
							>
								{group.title}
							</span>
						</Flex>
						<span
							className={
								draftGroupKey === group.key
									? 'knowledge-import-route__group-tree-count knowledge-import-route__group-tree-count--selected'
									: 'knowledge-import-route__group-tree-count'
							}
						>
							{groupCountMap.get(group.key) ?? 0}
						</span>
					</Flex>
				),
				children: group.children ? convert(group.children, level + 1) : undefined,
			}));

		return convert(filteredGroups);
	}, [draftGroupKey, filteredGroups, groupCountMap]);

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
						<Button size="small" onClick={() => setOpen(false)}>
							取消
						</Button>
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

const AddOverviewModelSelect = ({ value, onChange }: AddOverviewFieldSelectProps) => {
	const selectedModelOption = useMemo(
		() => EMBEDDING_MODEL_PRESETS.find((item) => item.value === value) ?? EMBEDDING_MODEL_PRESETS[0],
		[value],
	);
	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState('');
	const filteredModels = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase();
		if (!normalizedKeyword) {
			return EMBEDDING_MODEL_PRESETS;
		}

		return EMBEDDING_MODEL_PRESETS.filter((item) =>
			[item.title, item.description].some((text) => text.toLowerCase().includes(normalizedKeyword)),
		);
	}, [keyword]);

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
							{filteredModels.map((item, index) => {
								const selected = value === item.value;

								return (
									<button
										key={item.value}
										type="button"
										className={selected ? 'knowledge-import-route__model-option knowledge-import-route__model-option--selected' : 'knowledge-import-route__model-option'}
										onClick={() => {
											onChange(item.value);
											setOpen(false);
										}}
									>
										<Flex gap={12} align="flex-start">
											<span className="knowledge-import-route__model-option-icon">{embeddingModelIcons[index] ?? <AppstoreOutlined />}</span>
											<Flex vertical gap={4} flex={1} className="knowledge-import-route__model-option-copy">
												<Flex align="center" gap={8} wrap>
													<Text strong className={`knowledge-import-route__model-option-title${selected ? ' knowledge-import-route__model-option-title--selected' : ''}`}>
														{item.title}
													</Text>
													{item.badges.map((badge) => (
														<span
															key={`${item.value}-${badge}`}
															className={`knowledge-import-route__model-option-badge knowledge-import-route__model-option-badge--${badge === '推荐' ? 'accent' : 'soft'}`}
														>
															{badge}
														</span>
													))}
												</Flex>
												<Text type="secondary" className="knowledge-import-route__model-option-description">
													{item.description}
												</Text>
											</Flex>
										</Flex>
									</button>
								);
							})}
						</Flex>
					</Flex>
				)}
			>
				<button type="button" className="knowledge-import-route__model-trigger">
					{renderModelSelectedLabel(selectedModelOption, EMBEDDING_MODEL_PRESETS.findIndex((item) => item.value === selectedModelOption.value))}
					<span className="knowledge-import-route__model-trigger-caret">▾</span>
				</button>
			</Popover>
			<Button
				type="text"
				size="small"
				icon={<ReloadOutlined />}
				className="knowledge-import-route__preview-refresh"
				onClick={() => {
					onChange(EMBEDDING_MODEL_PRESETS[0].value);
				}}
			/>
		</Flex>
	);
};

const AddOverviewStep = ({ form, formValues }: Pick<ImportOverviewStepProps, 'form' | 'formValues'>) => (
	<Flex vertical gap={28} className="knowledge-import-route__overview knowledge-import-route__overview--add">
		<ImportSection title="定义知识库">
			<Flex vertical gap={20} className="knowledge-import-route__overview-body">
				<LabeledRow label={renderRequiredLabel('知识库名称')} alignStart>
					<Flex vertical gap={8} className="knowledge-import-route__preview-field-stack">
						<Form.Item name="name" rules={[{ required: true, message: '请输入知识库名称' }]} className="knowledge-import-route__form-item">
							<Input
								maxLength={50}
								placeholder="请输入知识库名称"
								className="knowledge-import-route__preview-input-field"
								suffix={<span className="knowledge-import-route__preview-inline-count">{formValues.name?.length ?? 0} / 50</span>}
							/>
						</Form.Item>
						<Text type="secondary" className="knowledge-import-route__preview-helper">
							支持中文、英文、数字、下划线（_）、中划线（-）、英文点（.）
						</Text>
					</Flex>
				</LabeledRow>
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
							<Button type="link" size="small" className="knowledge-import-route__link-button">
								使用模板
							</Button>
						</Flex>
					</Flex>
				</LabeledRow>
				<LabeledRow label={renderRequiredLabel('所属群组')}>
					<Form.Item hidden name="groupKey" rules={[{ required: true, message: '请选择所属群组' }]} className="knowledge-import-route__form-item">
						<Input type="hidden" />
					</Form.Item>
					<AddOverviewGroupSelect value={formValues.groupKey} onChange={(nextValue) => form.setFieldValue('groupKey', nextValue)} />
				</LabeledRow>
			</Flex>
		</ImportSection>
		<ImportSection title="配置知识库">
			<Flex vertical gap={20} className="knowledge-import-route__overview-body">
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
					<AddOverviewModelSelect value={formValues.embeddingModel} onChange={(nextValue) => form.setFieldValue('embeddingModel', nextValue)} />
				</LabeledRow>
				<LabeledRow label={renderRequiredLabel('存储检索资源')} alignStart>
					<div className="knowledge-import-route__resource-grid">
						{addKnowledgeStorageOptions.map((option) => (
							<div
								key={option.key}
								role="button"
								tabIndex={0}
								className={`knowledge-import-route__resource-card${formValues.storageResource === option.key ? ' knowledge-import-route__resource-card--active' : ''}`}
								onClick={() => {
									form.setFieldValue('storageResource', option.key);
								}}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										form.setFieldValue('storageResource', option.key);
									}
								}}
							>
								<Flex gap={12} align="flex-start">
									<span className="knowledge-import-route__resource-card-icon">{option.icon}</span>
									<Flex vertical gap={8} flex={1}>
										<Flex align="center" gap={8} wrap>
											<Text strong className="knowledge-import-route__resource-card-title">
												{option.title}
											</Text>
											{option.badge ? (
												<span className={`knowledge-import-route__resource-card-badge knowledge-import-route__resource-card-badge--${option.badgeTone}`}>
													{option.badge}
												</span>
											) : null}
										</Flex>
										<Text type="secondary" className="knowledge-import-route__resource-card-description">
											{option.description}
										</Text>
										<Button type="link" size="small" className="knowledge-import-route__link-button knowledge-import-route__resource-card-link">
											配置说明
										</Button>
									</Flex>
								</Flex>
							</div>
						))}
					</div>
					<Form.Item name="storageResource" rules={[{ required: true, message: '请选择存储检索资源' }]} className="knowledge-import-route__form-item">
						<Input type="hidden" />
					</Form.Item>
				</LabeledRow>
			</Flex>
		</ImportSection>
	</Flex>
);

export const ImportOverviewStep = ({ type, form, formValues }: ImportOverviewStepProps) => {
	return <>
		{type === 'import' ? (
			<Flex vertical gap={28} className="knowledge-import-route__overview">
				<ImportSection title="定义知识库">
					<Flex vertical gap={18} className="knowledge-import-route__overview-body">
						{knowledgeDefinitionRows.map((item) => (
							<LabeledRow key={item.label} label={item.label} alignStart>
								<div className="knowledge-import-route__overview-value">{item.value}</div>
							</LabeledRow>
						))}
					</Flex>
				</ImportSection>
				<ImportSection title="配置知识库">
					<Flex vertical gap={18} className="knowledge-import-route__overview-body">
						{knowledgeConfigRows.map((item) => (
							<LabeledRow key={item.label} label={item.label}>
								<Flex align="center" gap={8} className="knowledge-import-route__overview-value">
									{item.withDot ? <span className="knowledge-import-route__radio-dot" /> : null}
									<span>{item.value}</span>
								</Flex>
							</LabeledRow>
						))}
					</Flex>
				</ImportSection>
			</Flex>
		) : (
			<AddOverviewStep form={form} formValues={formValues} />
		)}
	</>
};

export const validateAddOverviewStep = async (form: FormInstance<ImportFormValues>) => {
	await form.validateFields(addStepFieldNames);
};

interface ImportSourceSectionProps {
	form: FormInstance<ImportFormValues>;
	formValues: ImportFormValues;
	uploadProps: UploadProps;
	messageApi: MessageInstance;
	getUploadFileList: (event: { fileList?: ImportFormValues['pendingFiles'] } | ImportFormValues['pendingFiles']) => ImportFormValues['pendingFiles'];
}

export const ImportSourceSection = ({
	form,
	formValues,
	uploadProps,
	messageApi,
	getUploadFileList,
}: ImportSourceSectionProps) => (
	<ImportSection title="导入文件源">
		<Flex vertical gap={16}>
			<LabeledRow label="导入方式">
				<Form.Item name="mode" noStyle>
					<Segmented
						options={IMPORT_MODE_OPTIONS.map((item) => ({ label: item.label, value: item.value }))}
						onChange={(value) => {
							if (value === 'byTemplate') {
								form.setFieldsValue({
									templateType: form.getFieldValue('templateType') ?? 'structuredQa',
									fileType: 'document',
								});
							}
						}}
					/>
				</Form.Item>
			</LabeledRow>
			{formValues.mode === 'byType' ? (
				<LabeledRow label={renderRequiredLabel('选择文件类型')} alignStart>
					<Form.Item name="fileType" hidden>
						<input />
					</Form.Item>
					<SelectionCardGroup
						options={fileTypeSelectionOptions}
						value={formValues.fileType}
						onChange={(value) => {
							form.setFieldValue('fileType', value);
						}}
						columns={3}
					/>
				</LabeledRow>
			) : (
				<LabeledRow label="模板类型" alignStart>
					<Flex vertical gap={16} style={{ width: '100%' }}>
						<Form.Item name="templateType" className="knowledge-import-route__form-item">
							<Radio.Group className="knowledge-import-route__template-radio-group">
								{Object.values(templateDescriptions).map((option) => (
									<Radio key={option.value} value={option.value} className="knowledge-import-route__template-radio">
										{option.label}
									</Radio>
								))}
							</Radio.Group>
						</Form.Item>
						<div className="knowledge-import-route__template-panel">
							<Flex vertical gap={10} className="knowledge-import-route__template-panel-copy">
								<Text strong className="knowledge-import-route__template-panel-title">
									{templateDescriptions[formValues.templateType]?.title}
								</Text>
								<Text type="secondary" className="knowledge-import-route__template-panel-description">
									{templateDescriptions[formValues.templateType]?.description}
								</Text>
								<Text type="secondary" className="knowledge-import-route__template-panel-formats">
									{templateDescriptions[formValues.templateType]?.supportedFormats}
								</Text>
							</Flex>
							<TemplatePreview templateType={formValues.templateType} />
						</div>
					</Flex>
				</LabeledRow>
			)}
			{shouldShowFileSourceSelector(formValues) ? (
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
			) : null}
			{shouldShowWebConfig(formValues) ? <ImportWebSourceFields form={form} formValues={formValues} messageApi={messageApi} /> : null}
			{shouldShowFileUploader(formValues) ? (
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
							<p className="ant-upload-drag-icon">
								<CloudUploadOutlined />
							</p>
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
												<span className={`knowledge-import-route__template-download-badge knowledge-import-route__template-download-badge--${option.tone}`}>
													{option.badge}
												</span>
												{option.label}
											</Button>
										))}
									</div>
								</div>
							) : null}
						</Dragger>
					</Form.Item>
				</LabeledRow>
			) : null}
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
											<Button type="link" icon={<SettingOutlined />} className="knowledge-import-route__link-button">
												标签管理
											</Button>
										</Flex>
									</Flex>
								)}
							/>
						</Form.Item>
					) : null}
				</Flex>
			</LabeledRow>
		</Flex>
	</ImportSection>
);

export { ImportParserSection, ImportSliceSection };
