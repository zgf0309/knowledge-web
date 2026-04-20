import {
	CheckCircleFilled,
	CloudUploadOutlined,
	InfoCircleOutlined,
	InboxOutlined,
	LeftOutlined,
	QuestionCircleOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Button, Checkbox, Flex, Modal, Radio, Segmented, Steps, Switch, Tag, Typography, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
	IMPORT_DEEP_PARSER_OPTIONS,
	IMPORT_FILE_TYPE_OPTIONS,
	IMPORT_MODE_OPTIONS,
	IMPORT_SLICE_STRATEGY_OPTIONS,
	IMPORT_SOURCE_OPTIONS,
} from '../constants';
import type { ImportConfig, KnowledgeBaseInfo } from '../types';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

interface KnowledgeImportModalProps {
	open: boolean;
	knowledgeBase: KnowledgeBaseInfo;
	pendingFiles: UploadFile[];
	importConfig: ImportConfig;
	onCancel: () => void;
	onSubmit: () => void;
	onImportConfigChange: (config: ImportConfig) => void;
	onPendingFilesChange: (files: UploadFile[]) => void;
}

const KnowledgeImportModal = ({
	open,
	knowledgeBase,
	pendingFiles,
	importConfig,
	onCancel,
	onSubmit,
	onImportConfigChange,
	onPendingFilesChange,
}: KnowledgeImportModalProps) => {
	const [currentStep, setCurrentStep] = useState(1);

	useEffect(() => {
		if (!open) {
			setCurrentStep(1);
		}
	}, [open]);

	const uploadProps: UploadProps = {
		multiple: true,
		beforeUpload: () => false,
		fileList: pendingFiles,
		onChange: ({ fileList }) => {
			onPendingFilesChange(fileList);
		},
	};

	const updateConfig = (patch: Partial<ImportConfig>) => {
		onImportConfigChange({
			...importConfig,
			...patch,
		});
	};

	const updateParserOptions = (patch: Partial<ImportConfig['parserOptions']>) => {
		onImportConfigChange({
			...importConfig,
			parserOptions: {
				...importConfig.parserOptions,
				...patch,
			},
		});
	};

	const updateDeepParserOptions = (patch: Partial<ImportConfig['deepParserOptions']>) => {
		onImportConfigChange({
			...importConfig,
			deepParserOptions: {
				...importConfig.deepParserOptions,
				...patch,
			},
		});
	};

	const footer = (
		<Flex justify="space-between" align="center" className="knowledge-import-modal__footer">
			<Button onClick={onCancel}>取消</Button>
			<Flex gap={12}>
				{currentStep === 1 ? (
					<Button
						onClick={() => {
							setCurrentStep(0);
						}}
					>
						上一步
					</Button>
				) : null}
				{currentStep === 0 ? (
					<Button
						type="primary"
						onClick={() => {
							setCurrentStep(1);
						}}
					>
						下一步
					</Button>
				) : (
					<Button type="primary" onClick={onSubmit}>
						确认导入
					</Button>
				)}
			</Flex>
		</Flex>
	);

	return (
		<Modal
			className="knowledge-import-modal"
			title={
				<Flex vertical gap={18} className="knowledge-import-modal__header">
					<Flex align="center" gap={10}>
						<Button
							type="text"
							icon={<LeftOutlined />}
							onClick={() => {
								if (currentStep === 1) {
									setCurrentStep(0);
									return;
								}

								onCancel();
							}}
						/>
						<Title level={4} className="knowledge-import-modal__title">
							导入文件
						</Title>
					</Flex>
					<Steps
						current={currentStep}
						items={[
							{ title: '定义知识库' },
							{ title: '导入文件' },
						]}
					/>
				</Flex>
			}
			open={open}
			onCancel={onCancel}
			footer={footer}
			width={1100}
			destroyOnHidden
			styles={{ body: { paddingTop: 8 } }}
		>
			{currentStep === 0 ? (
				<Flex vertical gap={16} className="knowledge-import-modal__step-panel">
					<div className="knowledge-import-modal__summary-card">
						<Text className="knowledge-import-modal__section-label">知识库概览</Text>
						<Title level={5} className="knowledge-import-modal__summary-title">
							{knowledgeBase.name}
						</Title>
						<Paragraph className="knowledge-import-modal__summary-description">
							{knowledgeBase.description || '当前知识库暂无描述，将沿用现有知识库信息导入文件。'}
						</Paragraph>
						<Flex wrap gap={12}>
							<div className="knowledge-import-modal__summary-item">
								<Text type="secondary">知识库 ID</Text>
								<Text>{knowledgeBase.id}</Text>
							</div>
							<div className="knowledge-import-modal__summary-item">
								<Text type="secondary">知识来源</Text>
								<Text>{knowledgeBase.sourceType}</Text>
							</div>
							<div className="knowledge-import-modal__summary-item">
								<Text type="secondary">最近更新</Text>
								<Text>{knowledgeBase.updatedAt}</Text>
							</div>
						</Flex>
					</div>
					<div className="knowledge-import-modal__info-banner">
						<CheckCircleFilled />
						<Text>当前知识库已完成定义，可直接进入文件导入和解析策略配置。</Text>
					</div>
				</Flex>
			) : (
				<Flex vertical gap={24} className="knowledge-import-modal__step-panel">
					<div className="knowledge-import-modal__section">
						<Flex align="center" gap={8} className="knowledge-import-modal__section-header">
							<span className="knowledge-import-modal__section-marker" />
							<Text strong>导入文件源</Text>
						</Flex>
						<Flex vertical gap={16} className="knowledge-import-modal__section-body">
							<Flex align="center" gap={12} wrap>
								<Text className="knowledge-import-modal__field-label">导入方式</Text>
								<Segmented
									options={IMPORT_MODE_OPTIONS.map((item) => ({
										label: item.label,
										value: item.value,
									}))}
									value={importConfig.mode}
									onChange={(value) => {
										updateConfig({ mode: value as ImportConfig['mode'] });
									}}
								/>
							</Flex>
							<div className="knowledge-import-modal__grid knowledge-import-modal__grid--types">
								{IMPORT_FILE_TYPE_OPTIONS.map((option) => {
									const selected = importConfig.doc_category === option.value;

									return (
										<button
											key={option.value}
											type="button"
											className={`knowledge-import-modal__option-card${selected ? ' knowledge-import-modal__option-card--active' : ''}`}
											onClick={() => {
												updateConfig({ doc_category: option.value });
											}}
										>
											<Text strong>{option.title}</Text>
											<Text type="secondary">{option.description}</Text>
										</button>
									);
								})}
							</div>
							<Flex align="center" gap={12} wrap>
								<Text className="knowledge-import-modal__field-label">导入来源</Text>
								<div className="knowledge-import-modal__grid knowledge-import-modal__grid--source">
									{IMPORT_SOURCE_OPTIONS.map((option) => {
										const selected = importConfig.sourceType === option.value;

										return (
											<button
												key={option.value}
												type="button"
												className={`knowledge-import-modal__option-card${selected ? ' knowledge-import-modal__option-card--active' : ''}`}
												onClick={() => {
													updateConfig({ sourceType: option.value });
												}}
											>
												<Text strong>{option.title}</Text>
												<Text type="secondary">{option.description}</Text>
											</button>
										);
									})}
								</div>
							</Flex>
							<Dragger {...uploadProps} className="knowledge-import-modal__uploader">
								<p className="ant-upload-drag-icon">
									<CloudUploadOutlined />
								</p>
								<p className="ant-upload-text">将文档拖到此处，或点击上传</p>
								<p className="ant-upload-hint">
									支持 doc、docx、pdf、ppt、pptx、md、txt 等格式文件，单次最多 100 个文件。
								</p>
							</Dragger>
							<Flex align="center" gap={12}>
								<Text className="knowledge-import-modal__field-label">标签选择</Text>
								<Switch
									checked={importConfig.autoTagging}
									onChange={(checked) => {
										updateConfig({ autoTagging: checked });
									}}
								/>
								<Text type="secondary">开启后会为导入文件附加自动标签</Text>
							</Flex>
						</Flex>
					</div>
					<div className="knowledge-import-modal__section">
						<Flex align="center" gap={8} className="knowledge-import-modal__section-header">
							<span className="knowledge-import-modal__section-marker" />
							<Text strong>配置解析策略</Text>
						</Flex>
						<Flex vertical gap={16} className="knowledge-import-modal__section-body">
							<Flex vertical gap={4}>
								<Flex align="center" gap={8}>
									<Text strong>基础解析</Text>
									<Text type="secondary">免费，不消耗高级解析用量</Text>
								</Flex>
							</Flex>
							<div className="knowledge-import-modal__parser-grid">
								<div className="knowledge-import-modal__parser-option knowledge-import-modal__parser-option--checked">
									<Checkbox checked disabled>
										文字提取
									</Checkbox>
									<Text type="secondary">基于规则和 OCR 自动完成文字提取</Text>
								</div>
								<div className="knowledge-import-modal__parser-option">
									<Checkbox
										checked={importConfig.parserOptions.layoutAnalysis}
										onChange={(event) => {
											updateParserOptions({ layoutAnalysis: event.target.checked });
										}}
									>
										版面分析
									</Checkbox>
									<Text type="secondary">识别文档中的表格、段落和版面位置信息</Text>
								</div>
								<div className="knowledge-import-modal__parser-option">
									<Checkbox
										checked={importConfig.parserOptions.ocr}
										onChange={(event) => {
											updateParserOptions({ ocr: event.target.checked });
										}}
									>
										图片文字识别（OCR）
									</Checkbox>
									<Text type="secondary">识别图片中的文字，适用于扫描件和拍照件内容导入</Text>
								</div>
							</div>
							<Flex align="center" gap={8} className="knowledge-import-modal__advanced-header">
								<Text strong>高级解析</Text>
								<Text type="secondary">消耗高级解析用量</Text>
								<Button type="link" className="knowledge-import-modal__text-link">
									计费说明
								</Button>
							</Flex>
							<div className="knowledge-import-modal__notice-bar">
								<InboxOutlined />
								<Text>免费额度剩余 100/100 标准页。为保障高级解析服务持续可用，建议您提前开通按量后付。</Text>
								<Button
									type="link"
									onClick={() => {
										updateConfig({
											advancedParsing: true,
											parserOptions: {
												textExtraction: true,
												layoutAnalysis: true,
												ocr: true,
											},
										});
									}}
								>
									一键开启
								</Button>
							</div>
							<div className="knowledge-import-modal__deep-parser-section">
								<Text className="knowledge-import-modal__field-label">深度解析策略</Text>
								<div className="knowledge-import-modal__parser-grid">
									{IMPORT_DEEP_PARSER_OPTIONS.map((option) => (
										<div
											key={option.value}
											className={`knowledge-import-modal__parser-option${!importConfig.advancedParsing ? ' knowledge-import-modal__parser-option--disabled' : ''}`}
										>
											<Checkbox
												disabled={!importConfig.advancedParsing}
												checked={importConfig.deepParserOptions[option.value]}
												onChange={(event) => {
													updateDeepParserOptions({ [option.value]: event.target.checked });
												}}
											>
												{option.title}
											</Checkbox>
											<Text type="secondary">{option.description}</Text>
										</div>
									))}
								</div>
							</div>
							<div className="knowledge-import-modal__toggle-row">
								<Flex align="center" gap={6}>
									<Text className="knowledge-import-modal__field-label">知识增强</Text>
									<QuestionCircleOutlined className="knowledge-import-modal__hint-icon" />
								</Flex>
								<Switch
									checked={importConfig.knowledgeEnhancement}
									onChange={(checked) => {
										updateConfig({ knowledgeEnhancement: checked });
									}}
								/>
							</div>
							<div className="knowledge-import-modal__graph-row">
								<Flex vertical gap={6}>
									<Flex align="center" gap={8} wrap>
										<Text className="knowledge-import-modal__field-label">知识图谱</Text>
										<QuestionCircleOutlined className="knowledge-import-modal__hint-icon" />
										<Switch
											checked={importConfig.knowledgeGraph}
											onChange={(checked) => {
												updateConfig({ knowledgeGraph: checked });
											}}
										/>
										<Tag color="red">NEW</Tag>
										<Tag color="blue">beta</Tag>
									</Flex>
									<Text type="secondary">当前最多支持 10 个知识库启用图谱</Text>
								</Flex>
							</div>
						</Flex>
					</div>
					<div className="knowledge-import-modal__section">
						<Flex align="center" gap={8} className="knowledge-import-modal__section-header">
							<span className="knowledge-import-modal__section-marker" />
							<Text strong>配置切片策略</Text>
						</Flex>
						<Flex vertical gap={16} className="knowledge-import-modal__section-body">
							<div className="knowledge-import-modal__slice-row">
								<Flex align="center" gap={6}>
									<Text className="knowledge-import-modal__field-label">切片策略</Text>
									<InfoCircleOutlined className="knowledge-import-modal__hint-icon" />
								</Flex>
								<Radio.Group
									value={importConfig.sliceStrategy}
									onChange={(event) => {
										updateConfig({ sliceStrategy: event.target.value });
									}}
									className="knowledge-import-modal__slice-group"
								>
									{IMPORT_SLICE_STRATEGY_OPTIONS.map((option) => (
										<Radio key={option.value} value={option.value} className="knowledge-import-modal__slice-option">
											<Flex vertical gap={4}>
												<Text strong>{option.title}</Text>
												<Text type="secondary">{option.description}</Text>
											</Flex>
										</Radio>
									))}
								</Radio.Group>
							</div>
							{importConfig.mode === 'byTemplate' ? (
								<div className="knowledge-import-modal__template-tip">
									<UploadOutlined />
									<Text>模板导入模式下会沿用统一上传流程，并在后续接入模板匹配规则。</Text>
								</div>
							) : null}
						</Flex>
					</div>
				</Flex>
			)}
		</Modal>
	);
};

export default KnowledgeImportModal;