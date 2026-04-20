import { DownOutlined, ExportOutlined, InfoCircleOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Flex, Form, Input, InputNumber, Popover, Radio, Select, Switch, Tag, Tooltip, Typography } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useImportContext } from '../context';
import {
	IMPORT_AUDIO_PARSER_CARD_OPTIONS,
	IMPORT_IMAGE_PARSER_CARD_OPTIONS,
	IMPORT_QA_PARSER_CARD_OPTIONS,
	IMPORT_SLICE_STRATEGY_OPTIONS,
	IMPORT_WEB_PARSER_CARD_OPTIONS,
	KNOWLEDGE_ENHANCEMENT_METHOD_OPTIONS,
} from '../../constants';
import type { ImportSliceIdentifier } from '../../types';
import type { ImportFormValues } from '../types';
import { FormOptionCards } from './FormOptionCards';
import { ImportSection, LabeledRow } from './Scaffold';
import { knowledgeGraphTooltipContent } from './VisualBlocks';
import { basicParserCardOptions, deepParserCardOptions } from '../viewConfig';

const { Text } = Typography;

const CUSTOM_SLICE_IDENTIFIER_OPTIONS = [
	{ label: '按页切分', value: 'page' },
	{ label: '自定义正则表达式', value: 'customRegex' },
	{ label: '中文句号', value: 'chinesePeriod' },
	{ label: '中文逗号', value: 'chineseComma' },
	{ label: '中文问号', value: 'chineseQuestion' },
	{ label: '英文句号', value: 'englishPeriod' },
	{ label: '英文问号', value: 'englishQuestion' },
	{ label: '省略号', value: 'ellipsis' },
	{ label: '中文双引号', value: 'chineseDoubleQuote' },
	{ label: '换行符', value: 'lineBreak' },
	{ label: '中文分号', value: 'chineseSemicolon' },
	{ label: '英文分号', value: 'englishSemicolon' },
] as const;

const CUSTOM_SLICE_REFERENCE_INFO_OPTIONS = [
	{ label: '关联文件名', value: 'fileName' },
	{ label: '关联标题及子标题', value: 'heading' },
] as const;

const DEFAULT_SLICE_REFERENCE_INFO_OPTIONS = [
	{ label: '关联文件名', value: 'fileName' },
	{ label: '关联标题及子标题', value: 'heading', disabled: true },
] as const;

const WHOLE_SLICE_REFERENCE_INFO_OPTIONS = [
	{ label: '关联文件名', value: 'fileName' },
] as const;

const CUSTOM_SLICE_REGEX_INCLUSION_OPTIONS = [
	{ label: '前序切片', value: 'prefix' },
	{ label: '后序切片', value: 'suffix' },
	{ label: '匹配后丢弃', value: 'discard' },
] as const;

const QA_DEFAULT_PARSER_VALUE = 'tableParsing';

const sliceIdentifierTooltipContent = (
	<div className="knowledge-import-route__slice-tooltip">
		<div>按照所选的标识符切分文本。切分后，按设置的切片最大长度对切分后的文本组合成单一切片内容</div>
	</div>
);

const sliceRegexTooltipContent = (
	<div className="knowledge-import-route__slice-tooltip">
		<div>通过正则表达式，自定义可匹配的分隔符。例如可匹配：</div>
		<div>· 任意句号、叹号、问号：［。!?］</div>
		<div>{'· 标题模板“第*章”： (第[一二三四五六七八九十零壹贰叁肆伍陆柒捌玖拾]{1,}章)'}</div>
	</div>
);

const sliceRegexInclusionTooltipContent = (
	<div className="knowledge-import-route__slice-tooltip">
		<div>对正则匹配的分隔符，设置包含的位置。例如当匹配到“第*章”时，可选：</div>
		<div>· 前序切片：将“第*章”拼接至前序切片末尾</div>
		<div>· 后序切片：将“第*章”拼接至后序切片开头</div>
		<div>· 匹配后丢弃：切分后，将“第*章”删除</div>
		<div>注：当表达式涉及多段分隔符时，此选项功能可能不生效</div>
	</div>
);

const sliceMaxLengthTooltipContent = (
	<div className="knowledge-import-route__slice-tooltip">
		<div>切片最大长度应匹配应用中的模型上下文长度范围。</div>
		<div>长度越大，召回的上下文越丰富。长度越小，召回的信息越精简。应用配置中开启扩大片上下文信息时，推荐设置为600</div>
	</div>
);

const sliceOverlapTooltipContent = (
	<div className="knowledge-import-route__slice-tooltip">
		<div>当前切片与前后切片的“重叠部分字符数”相较于设置的“切片最大长度”的比例。如果重叠部分存在不完整的句子，则此切片会去沟通。占比越大，相邻切片重叠字符越多，占比越小，重叠字符越少。最大值为25%</div>
	</div>
);

const sliceReferenceInfoTooltipContent = (
	<div className="knowledge-import-route__slice-tooltip">
		<div>为切片补充关联元信息，便于检索结果回溯来源并在召回时携带更多上下文。</div>
		<div>· 关联文件名：为每个切片附加所属文件名</div>
		<div>· 关联标题及子标题：为每个切片附加标题层级信息</div>
	</div>
);

const renderRequiredLabel = (label: string) => (
	<span className="knowledge-import-route__required-label">
		{label}
		<span className="knowledge-import-route__required-mark">*</span>
	</span>
);

interface ImportParserSectionProps {
	form: FormInstance<ImportFormValues>;
	formValues: ImportFormValues;
}

interface SliceIdentifierSelectProps {
	value?: ImportSliceIdentifier[];
	onChange?: (value: ImportSliceIdentifier[]) => void;
}

interface SlicePanelRowProps {
	label: string;
	tooltip?: ReactNode;
	children: ReactNode;
	compact?: boolean;
}

interface SliceReferenceInfoFieldProps {
	options:
		| typeof CUSTOM_SLICE_REFERENCE_INFO_OPTIONS
		| typeof DEFAULT_SLICE_REFERENCE_INFO_OPTIONS
		| typeof WHOLE_SLICE_REFERENCE_INFO_OPTIONS;
}

interface CustomSlicePanelProps {
	form: FormInstance<ImportFormValues>;
	showCustomRegexFields: boolean;
}

const sliceIdentifierLabelMap = new Map<ImportSliceIdentifier, string>(
	CUSTOM_SLICE_IDENTIFIER_OPTIONS.map((option) => [option.value, option.label]),
);

const getSliceIdentifierSummary = (values: ImportSliceIdentifier[]) => {
	if (!values.length) {
		return '请选择标识符';
	}

	const labels = values
		.map((item) => sliceIdentifierLabelMap.get(item))
		.filter((item): item is string => Boolean(item));

	if (labels.length <= 2) {
		return labels.join(' ');
	}

	return `${labels.slice(0, 2).join(' ')} +${labels.length - 2}`;
};

const SliceIdentifierSelect = ({ value = [], onChange }: SliceIdentifierSelectProps) => {
	const [open, setOpen] = useState(false);
	const selectedValues = useMemo(() => value.filter((item) => sliceIdentifierLabelMap.has(item)), [value]);
	const summary = useMemo(() => getSliceIdentifierSummary(selectedValues), [selectedValues]);

	const getNextSelectedValues = (currentValue: ImportSliceIdentifier, checked: boolean) => {
		if (checked) {
			return selectedValues.filter((item) => item !== currentValue);
		}

		if (currentValue === 'customRegex') {
			return ['customRegex'] as ImportSliceIdentifier[];
		}

		return [...selectedValues.filter((item) => item !== 'customRegex'), currentValue];
	};

	const content = (
		<div className="knowledge-import-route__slice-selector-dropdown">
			{CUSTOM_SLICE_IDENTIFIER_OPTIONS.map((option) => {
				const checked = selectedValues.includes(option.value);

				return (
					<button
						key={option.value}
						type="button"
						className={`knowledge-import-route__slice-selector-option${checked ? ' knowledge-import-route__slice-selector-option--selected' : ''}`}
						onClick={() => {
							const nextValue = getNextSelectedValues(option.value, checked);
							onChange?.(nextValue);
						}}
					>
						<Checkbox checked={checked}>
							<span className="knowledge-import-route__slice-selector-option-label">{option.label}</span>
						</Checkbox>
					</button>
				);
			})}
		</div>
	);

	return (
		<Popover
			trigger="click"
			placement="bottomLeft"
			open={open}
			onOpenChange={setOpen}
			content={content}
			overlayClassName="knowledge-import-route__slice-selector-popover"
		>
			<button type="button" className="knowledge-import-route__slice-selector-trigger">
				<span className={`knowledge-import-route__slice-selector-summary${selectedValues.length ? '' : ' knowledge-import-route__slice-selector-summary--placeholder'}`}>
					{summary}
				</span>
				<DownOutlined className="knowledge-import-route__slice-selector-caret" />
			</button>
		</Popover>
	);
};

const SlicePanelLabel = ({ label, tooltip }: { label: string; tooltip?: React.ReactNode }) => (
	<Flex align="center" gap={6} className="knowledge-import-route__slice-panel-label-wrap">
		<span>{label}</span>
		{tooltip ? (
			<Tooltip
				title={tooltip}
				color="#fff"
				placement="topLeft"
				classNames={{ root: 'knowledge-import-route__slice-tooltip-overlay' }}
			>
				<QuestionCircleOutlined className="knowledge-import-route__hint-icon" />
			</Tooltip>
		) : null}
	</Flex>
);

const SlicePanelRow = ({ label, tooltip, children, compact = false }: SlicePanelRowProps) => {
	const rowClassName = `knowledge-import-route__slice-panel-row${compact ? ' knowledge-import-route__slice-panel-row--compact' : ''}`;

	return (
		<div className={rowClassName}>
			<div className="knowledge-import-route__slice-panel-label">
				<SlicePanelLabel label={label} tooltip={tooltip} />
			</div>
			<div className="knowledge-import-route__slice-panel-content">{children}</div>
		</div>
	);
};

const SliceReferenceInfoField = ({ options }: SliceReferenceInfoFieldProps) => (
	<Form.Item name="customSliceReferenceInfo" className="knowledge-import-route__form-item">
		<Checkbox.Group
			options={[...options]}
			className="knowledge-import-route__slice-checkbox-group"
		/>
	</Form.Item>
);

const validateCustomRegexPattern = async (
	form: FormInstance<ImportFormValues>,
	value: string | undefined,
) => {
	const identifiers = form.getFieldValue('customSliceIdentifiers') as ImportSliceIdentifier[];
	if (!identifiers?.includes('customRegex')) {
		return;
	}

	if (typeof value === 'string' && value.trim()) {
		return;
	}

	throw new Error('请输入正则表达式');
};

const CustomSlicePanel = ({ form, showCustomRegexFields }: CustomSlicePanelProps) => (
	<div className="knowledge-import-route__slice-panel">
		<SlicePanelRow label="标识符" tooltip={sliceIdentifierTooltipContent}>
			<Form.Item
				name="customSliceIdentifiers"
				className="knowledge-import-route__form-item"
				rules={[{ required: true, message: '请至少选择一个标识符' }]}
			>
				<SliceIdentifierSelect />
			</Form.Item>
		</SlicePanelRow>
		{showCustomRegexFields ? (
			<>
				<SlicePanelRow label="表达式" tooltip={sliceRegexTooltipContent}>
					<Form.Item
						name="customSliceRegexPattern"
						className="knowledge-import-route__form-item"
						rules={[
							{
								validator: async (_, value) => validateCustomRegexPattern(form, value),
							},
						]}
					>
						<Input placeholder="请输入表达式" className="knowledge-import-route__slice-text-input" />
					</Form.Item>
				</SlicePanelRow>
				<SlicePanelRow label="包含策略" tooltip={sliceRegexInclusionTooltipContent}>
					<Form.Item name="customSliceRegexInclusionStrategy" className="knowledge-import-route__form-item">
						<Select
							className="knowledge-import-route__slice-select"
							options={CUSTOM_SLICE_REGEX_INCLUSION_OPTIONS as unknown as Array<{ label: string; value: string }>}
						/>
					</Form.Item>
				</SlicePanelRow>
			</>
		) : null}
		<SlicePanelRow label="切片最大长度" tooltip={sliceMaxLengthTooltipContent}>
			<Form.Item
				name="customSliceMaxLength"
				className="knowledge-import-route__form-item"
				rules={[{ required: true, message: '请输入切片最大长度' }]}
			>
				<InputNumber min={100} max={10000} step={100} controls={false} className="knowledge-import-route__slice-input knowledge-import-route__slice-input--full" />
			</Form.Item>
		</SlicePanelRow>
		<SlicePanelRow label="切片重叠最大字符数占比" tooltip={sliceOverlapTooltipContent}>
			<Form.Item
				name="customSliceOverlapRatio"
				className="knowledge-import-route__form-item"
				rules={[{ required: true, message: '请输入切片重叠占比' }]}
			>
				<InputNumber
					min={0}
					max={25}
					step={1}
					controls
					suffix="%"
					style={{ width: 352 }}
					className="knowledge-import-route__slice-input knowledge-import-route__slice-input--full"
				/>
			</Form.Item>
		</SlicePanelRow>
		<SlicePanelRow label="关联信息" tooltip={sliceReferenceInfoTooltipContent}>
			<SliceReferenceInfoField options={CUSTOM_SLICE_REFERENCE_INFO_OPTIONS} />
		</SlicePanelRow>
	</div>
);

const PageSlicePanel = () => (
	<div className="knowledge-import-route__slice-panel">
		<SlicePanelRow label="切片最大长度" tooltip={sliceMaxLengthTooltipContent}>
			<Form.Item
				name="customSliceMaxLength"
				className="knowledge-import-route__form-item"
				rules={[{ required: true, message: '请输入切片最大长度' }]}
			>
				<InputNumber min={100} max={10000} step={100} controls={false} className="knowledge-import-route__slice-input knowledge-import-route__slice-input--full" />
			</Form.Item>
		</SlicePanelRow>
		<SlicePanelRow label="切片重叠最大字符数占比" tooltip={sliceOverlapTooltipContent}>
			<Form.Item
				name="customSliceOverlapRatio"
				className="knowledge-import-route__form-item"
				rules={[{ required: true, message: '请输入切片重叠占比' }]}
			>
				<InputNumber
					min={0}
					max={25}
					step={1}
					controls
					suffix="%"
					style={{ width: 352 }}
					className="knowledge-import-route__slice-input knowledge-import-route__slice-input--full"
				/>
			</Form.Item>
		</SlicePanelRow>
		<SlicePanelRow label="关联信息" tooltip={sliceReferenceInfoTooltipContent}>
			<SliceReferenceInfoField options={CUSTOM_SLICE_REFERENCE_INFO_OPTIONS} />
		</SlicePanelRow>
	</div>
);

const DefaultSlicePanel = () => (
	<div className="knowledge-import-route__slice-panel knowledge-import-route__slice-panel--whole">
		<SlicePanelRow label="关联信息" tooltip={sliceReferenceInfoTooltipContent} compact>
			<SliceReferenceInfoField options={DEFAULT_SLICE_REFERENCE_INFO_OPTIONS} />
		</SlicePanelRow>
	</div>
);

const WholeSlicePanel = () => (
	<div className="knowledge-import-route__slice-panel knowledge-import-route__slice-panel--whole">
		<SlicePanelRow label="关联信息" tooltip={sliceReferenceInfoTooltipContent} compact>
			<SliceReferenceInfoField options={WHOLE_SLICE_REFERENCE_INFO_OPTIONS} />
		</SlicePanelRow>
	</div>
);

/** 打开知识增强时，自动补齐一个默认增强方式，避免出现空配置。 */
const handleKnowledgeEnhancementChange = (
	checked: boolean,
	form: FormInstance<ImportFormValues>,
) => {
	if (!checked) {
		return;
	}

	const currentMethods = form.getFieldValue('enhancementMethods');
	if (!Array.isArray(currentMethods) || currentMethods.length === 0) {
		form.setFieldValue('enhancementMethods', ['questionGeneration']);
	}
};

const KnowledgeEnhancementField = ({
	form,
	formValues,
}: {
	form: FormInstance<ImportFormValues>;
	formValues: ImportFormValues;
}) => (
	<LabeledRow
		label="知识增强"
		tooltip={{
			title:
				'开启后，会调用大模型对各切片抽取更丰富的知识点以构建索引，用于检索召回对应切片。开启知识增强可提升切片检索效果，但会增加处理时长和资源消耗。',
			color: '#fff',
			icon: <InfoCircleOutlined />,
		}}
		alignStart
	>
		<Flex vertical gap={12} style={{ width: '100%' }}>
			<Form.Item name="knowledgeEnhancement" valuePropName="checked" className="knowledge-import-route__form-item">
				<Switch
					onChange={(checked) => {
						handleKnowledgeEnhancementChange(checked, form);
					}}
				/>
			</Form.Item>
			{formValues.knowledgeEnhancement ? (
				<Flex vertical gap={12} className="knowledge-import-route__enhancement-block">
					<Text type="secondary" className="knowledge-import-route__enhancement-tip">
						知识增强文档字数上限为10万字；单个切片字数上限为8千字，超出部分无法使用知识增强
					</Text>
					<div className="knowledge-import-route__enhancement-panel">
						<LabeledRow
							label={renderRequiredLabel('增强方式')}
							tooltip={{
								title: '选择知识增强后要执行的抽取能力，可用于提升检索召回质量。',
								color: '#fff',
								icon: <QuestionCircleOutlined />,
							}}
						>
							<Form.Item
								name="enhancementMethods"
								className="knowledge-import-route__form-item"
								rules={[
									{
										validator: async (_, value) => {
											if (!form.getFieldValue('knowledgeEnhancement')) {
												return;
											}

											if (Array.isArray(value) && value.length > 0) {
												return;
											}

											throw new Error('请至少选择一种增强方式');
										},
									},
								]}
							>
								<Checkbox.Group options={KNOWLEDGE_ENHANCEMENT_METHOD_OPTIONS} />
							</Form.Item>
						</LabeledRow>
					</div>
				</Flex>
			) : null}
		</Flex>
	</LabeledRow>
);

const KnowledgeGraphField = () => (
	<LabeledRow
		label="知识图谱"
		tooltip={{
			title: knowledgeGraphTooltipContent,
			color: '#ffffff',
			icon: <InfoCircleOutlined />,
			rootClassName: 'knowledge-import-route__graph-tooltip-overlay',
		}}
		alignStart
	>
		<Form.Item
			name="knowledgeGraph"
			valuePropName="checked"
			extra="当前最多支持 10 个知识库启用图谱"
			className="knowledge-import-route__form-item"
		>
			<Flex align="center" gap={15} wrap>
				<Switch />
				<Flex gap={4}>
					<Tag color="red">NEW</Tag>
					<Tag color="blue">beta</Tag>
				</Flex>
			</Flex>
		</Form.Item>
	</LabeledRow>
);

const QaParserSection = () => (
	<ImportSection title="配置解析策略">
		<Flex vertical gap={16}>
			<Flex vertical gap={4}>
				<Flex align="center" gap={8}>
					<Text strong>基础解析</Text>
					<Text type="secondary">免费，不消耗高级解析用量</Text>
				</Flex>
			</Flex>
			<LabeledRow label={renderRequiredLabel('解析策略')} alignStart>
				<Radio.Group className="knowledge-import-route__radio-group" value={QA_DEFAULT_PARSER_VALUE}>
					{IMPORT_QA_PARSER_CARD_OPTIONS.map((option) => (
						<Flex key={option.value} vertical gap={4} className="knowledge-import-route__radio-card">
							<Radio value={option.value} disabled={option.disabled} className="knowledge-import-route__radio">
								<Text strong>{option.title}</Text>
							</Radio>
							<Text type="secondary">{option.description}</Text>
						</Flex>
					))}
				</Radio.Group>
			</LabeledRow>
			<Flex align="center" gap={8} wrap>
				<Text strong>高级解析</Text>
				<Text type="secondary">消耗高级解析用量</Text>
				<Button type="link" icon={<ExportOutlined />} className="knowledge-import-route__link-button">
					计费说明
				</Button>
			</Flex>
			<LabeledRow
				label="知识增强"
				tooltip={{
					title:
						'开启后，会调用大模型对各切片抽取更丰富的知识点以构建索引，用于检索召回对应切片。开启知识增强可提升检索效果，但会增加处理时长和资源消耗。',
					color: '#fff',
					icon: <InfoCircleOutlined />,
				}}
				alignStart
			>
				<Form.Item name="knowledgeEnhancement" valuePropName="checked" className="knowledge-import-route__form-item">
					<Switch />
				</Form.Item>
			</LabeledRow>
		</Flex>
	</ImportSection>
);

const WebParserSection = ({
	form,
	formValues,
}: ImportParserSectionProps) => (
	<ImportSection title="配置解析策略">
		<Flex vertical gap={16}>
			<Flex vertical gap={4}>
				<Flex align="center" gap={8}>
					<Text strong>基础解析</Text>
					<Text type="secondary">免费，不消耗高级解析用量</Text>
				</Flex>
			</Flex>
			<LabeledRow label={renderRequiredLabel('解析策略')} alignStart>
				<Flex gap={12} wrap>
					<Radio.Group className="knowledge-import-route__radio-group" value="webContentParsing">
						{IMPORT_WEB_PARSER_CARD_OPTIONS.map((option) => (
							<Flex key={option.value} vertical gap={4} className="knowledge-import-route__radio-card">
								<Radio value={option.value} disabled={option.disabled} className="knowledge-import-route__radio">
									<Text strong>{option.title}</Text>
								</Radio>
								<Text type="secondary">{option.description}</Text>
							</Flex>
						))}
					</Radio.Group>
				</Flex>
			</LabeledRow>
			<Flex align="center" gap={8} wrap>
				<Text strong>高级解析</Text>
				<Text type="secondary">消耗高级解析用量</Text>
			</Flex>
			<KnowledgeEnhancementField form={form} formValues={formValues} />
			<KnowledgeGraphField />
		</Flex>
	</ImportSection>
);

const ImageParserSection = ({
	form,
	formValues,
}: ImportParserSectionProps) => (
	<ImportSection title="配置解析策略">
		<Flex vertical gap={16}>
			<Flex vertical gap={4}>
				<Flex align="center" gap={8}>
					<Text strong>基础解析</Text>
					<Text type="secondary">免费，不消耗高级解析用量</Text>
				</Flex>
			</Flex>
			<LabeledRow label={renderRequiredLabel('解析策略')} alignStart>
				<Flex gap={12} wrap>
					<Radio.Group className="knowledge-import-route__radio-group" defaultValue="manualParse">
						{IMPORT_IMAGE_PARSER_CARD_OPTIONS.map((option) => (
							<Flex key={option.value} vertical gap={4} className="knowledge-import-route__radio-card">
								<Radio value={option.value} disabled={option.disabled} className="knowledge-import-route__radio">
									<Text strong>{option.title}</Text>
								</Radio>
								<Text type="secondary">{option.description}</Text>
							</Flex>
						))}
					</Radio.Group>
				</Flex>
			</LabeledRow>
			<Flex align="center" gap={8} wrap>
				<Text strong>高级解析</Text>
				<Text type="secondary">消耗高级解析用量</Text>
				<Button type="link" icon={<ExportOutlined />} className="knowledge-import-route__link-button">
					计费说明
				</Button>
			</Flex>
			<LabeledRow label="深度解析策略" alignStart>
				<FormOptionCards
					options={deepParserCardOptions.filter((option) => option.key === 'vlm')}
					columns={1}
				/>
			</LabeledRow>
			<KnowledgeEnhancementField form={form} formValues={formValues} />
		</Flex>
	</ImportSection>
);

const AudioParserSection = ({
	form,
	formValues,
}: ImportParserSectionProps) => (
	<ImportSection title="配置解析策略">
		<Flex vertical gap={16}>
			<Flex align="center" gap={8} wrap>
				<Text strong>高级解析</Text>
				<Text type="secondary">消耗高级解析用量</Text>
				<Button type="link" icon={<ExportOutlined />} className="knowledge-import-route__link-button">
					计费说明
				</Button>
			</Flex>
			<LabeledRow label="深度解析策略" alignStart>
				<Flex gap={12} wrap>
					<Radio.Group className="knowledge-import-route__radio-group" value="asr">
						{IMPORT_AUDIO_PARSER_CARD_OPTIONS.map((option) => (
							<Flex key={option.value} vertical gap={4} className="knowledge-import-route__radio-card">
								<Radio value={option.value} disabled={option.disabled} className="knowledge-import-route__radio">
									<Text strong>{option.title}</Text>
								</Radio>
								<Text type="secondary">{option.description}</Text>
							</Flex>
						))}
					</Radio.Group>
				</Flex>
			</LabeledRow>
			<KnowledgeEnhancementField form={form} formValues={formValues} />
			<KnowledgeGraphField />
		</Flex>
	</ImportSection>
);

const DefaultParserSection = ({
	form,
	formValues,
}: ImportParserSectionProps) => (
	<ImportSection title="配置解析策略">
		<Flex vertical gap={16}>
			<Flex vertical gap={4}>
				<Flex align="center" gap={8}>
					<Text strong>基础解析</Text>
					<Text type="secondary">免费，不消耗高级解析用量</Text>
				</Flex>
			</Flex>
			<LabeledRow label={renderRequiredLabel('解析策略')} alignStart>
				<FormOptionCards options={basicParserCardOptions} columns={3} />
			</LabeledRow>
			<Flex align="center" gap={8} wrap>
				<Text strong>高级解析</Text>
				<Text type="secondary">消耗高级解析用量</Text>
			</Flex>
			<LabeledRow label="深度解析策略" alignStart>
				<FormOptionCards options={deepParserCardOptions} columns={3} />
			</LabeledRow>
			<KnowledgeEnhancementField form={form} formValues={formValues} />
			<KnowledgeGraphField />
		</Flex>
	</ImportSection>
);

export const ImportParserSection = () => {
	const { form, formValues } = useImportContext();

	// QA 类型的解析配置与普通文档差异较大，单独拆分组件便于扩展。
	const isQaFileType = formValues.mode === 'byType' && formValues.doc_category === 'table';
	const isWebFileType = formValues.mode === 'byType' && formValues.doc_category === 'web';
	const isImageFileType = formValues.mode === 'byType' && formValues.doc_category === 'image';
	const isAudioFileType = formValues.mode === 'byType' && formValues.doc_category === 'audio';

	if (isQaFileType) {
		return <QaParserSection />;
	}

	if (isWebFileType) {
		return <WebParserSection form={form} formValues={formValues} />;
	}

	if (isImageFileType) {
		return <ImageParserSection form={form} formValues={formValues} />;
	}

	if (isAudioFileType) {
		return <AudioParserSection form={form} formValues={formValues} />;
	}

	return <DefaultParserSection form={form} formValues={formValues} />;
};

export const ImportSliceSection = () => {
	const { form, formValues } = useImportContext();

	const customSliceIdentifiers = formValues.customSliceIdentifiers ?? [];
	const showCustomRegexFields = customSliceIdentifiers.includes('customRegex');
	const isDefaultSliceStrategy = formValues.sliceStrategy === 'default';
	const isCustomSliceStrategy = formValues.sliceStrategy === 'custom';
	const isPageSliceStrategy = formValues.sliceStrategy === 'page';
	const isWholeSliceStrategy = formValues.sliceStrategy === 'whole';

	useEffect(() => {
		if (!isDefaultSliceStrategy && !isWholeSliceStrategy) {
			return;
		}

		const currentReferenceInfo = form.getFieldValue('customSliceReferenceInfo') as ImportFormValues['customSliceReferenceInfo'] | undefined;
		const shouldResetReferenceInfo =
			!Array.isArray(currentReferenceInfo) ||
			currentReferenceInfo.length !== 1 ||
			currentReferenceInfo[0] !== 'fileName';

		if (shouldResetReferenceInfo) {
			form.setFieldValue('customSliceReferenceInfo', ['fileName']);
		}
	}, [form, isDefaultSliceStrategy, isWholeSliceStrategy]);

	return (
	<ImportSection title="配置切片策略">
		<Flex vertical gap={16}>
			<LabeledRow label={renderRequiredLabel('切片策略')} alignStart>
				<Form.Item
					name="sliceStrategy"
					className="knowledge-import-route__form-item"
					rules={[{ required: true, message: '请选择切片策略' }]}
				>
					<Radio.Group className="knowledge-import-route__radio-group">
						{IMPORT_SLICE_STRATEGY_OPTIONS.map((option) => (
							<Flex key={option.value} vertical gap={4} className="knowledge-import-route__radio-card">
								<Radio value={option.value}>
									<Text strong>{option.title}</Text>
								</Radio>
								<Text type="secondary">{option.description}</Text>
							</Flex>
						))}
					</Radio.Group>
				</Form.Item>
			</LabeledRow>
			{isCustomSliceStrategy ? (
				<LabeledRow label="">
					<CustomSlicePanel form={form} showCustomRegexFields={showCustomRegexFields} />
				</LabeledRow>
			) : null}
			{isPageSliceStrategy ? (
				<LabeledRow label="">
					<PageSlicePanel />
				</LabeledRow>
			) : null}
			{isDefaultSliceStrategy ? (
				<LabeledRow label="">
					<DefaultSlicePanel />
				</LabeledRow>
			) : null}
			{isWholeSliceStrategy ? (
				<LabeledRow label="">
					<WholeSlicePanel />
				</LabeledRow>
			) : null}
			{formValues.mode === 'byTemplate' ? (
				<div className="knowledge-import-route__template-tip">
					<UploadOutlined />
					<Text>模板导入模式下会沿用统一上传流程，并在后续接入模板匹配规则。</Text>
				</div>
			) : null}
		</Flex>
	</ImportSection>
);
};