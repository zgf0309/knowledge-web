import {
	ApiOutlined,
	CheckCircleFilled,
	CloseOutlined,
	CloseCircleFilled,
	DeploymentUnitOutlined,
	FileTextOutlined,
	InfoCircleOutlined,
	LoadingOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Flex, Form, Input, Modal, Radio, Segmented, Select, Switch, Tooltip, Typography, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { MessageInstance } from 'antd/es/message/interface';
import { useImportContext } from '../context';
import type { ImportFormValues } from '../types';
import {
	WEB_BATCH_MODE_HINT,
	WEB_PARSE_MODE_OPTIONS,
	WEB_SINGLE_MODE_HINT,
	WEB_UPDATE_FREQUENCY_OPTIONS,
	WEB_UPLOAD_MODE_OPTIONS,
	createWebBatchUploadProps,
	downloadWebBatchTemplate,
	getWebBatchUploadFileList,
	isValidWebUrl,
} from '../formConfig';
import { useWebImportController } from '../hooks/useWebImportController';
import { LabeledRow } from './Scaffold/LabeledRow';

const { Text } = Typography;

// 更新频率说明在单条和批量模式下共用，集中维护便于后续统一替换文案。
const webUpdateFrequencyTooltipContent = (
	<div className="knowledge-import-route__web-frequency-tooltip">
		<div>1. 设置更新频率后，将会在每周期0点开始采集url内容并入库，新内容将会覆盖原始自动切分的切片及知识点</div>
		<div>2. 如果7天未调用知识库，url自动更新将暂停，直至调用后继续执行自动更新</div>
		<div>3. 若使用高级解析，每次更新均会消耗高级解析用量</div>
	</div>
);

const renderRequiredLabel = (label: string) => (
	<span className="knowledge-import-route__required-label">
		{label}
		<span className="knowledge-import-route__required-mark">*</span>
	</span>
);

interface WebSingleModePanelProps {
	webUrls: ImportFormValues['webUrls'];
	parseActionDisabled: boolean;
	handleAddUrlRow: () => void;
	handleUpdateUrlValue: (id: string, value: string) => void;
	handleUpdateUrlFrequency: (id: string, value: ImportFormValues['webUpdateFrequency']) => void;
	handleRemoveUrl: (id: string) => void;
	handleParseWebUrls: () => void;
	handleApplyFrequency: () => void;
}

const WebSingleModePanel = ({
	webUrls,
	parseActionDisabled,
	handleAddUrlRow,
	handleUpdateUrlValue,
	handleUpdateUrlFrequency,
	handleRemoveUrl,
	handleParseWebUrls,
	handleApplyFrequency,
}: WebSingleModePanelProps) => (
	<>
		<div className="knowledge-import-route__web-single-list">
			{webUrls.map((item) => {
				const hasValue = item.url.trim().length > 0;
				const showInvalid = hasValue && !isValidWebUrl(item.url.trim());
				const rowClassName = `knowledge-import-route__web-single-item${showInvalid ? ' knowledge-import-route__web-single-item--invalid' : ''}`;

				return (
					<div key={item.id} className={rowClassName}>
						<div className="knowledge-import-route__web-input-field">
							<Input
								value={item.url}
								status={showInvalid ? 'error' : undefined}
								placeholder="请输入一个需要解析的url链接"
								onChange={(event) => {
									handleUpdateUrlValue(item.id, event.target.value);
								}}
							/>
							{showInvalid ? <div className="knowledge-import-route__web-input-error">url格式不正确</div> : null}
						</div>
						<Select
							className="knowledge-import-route__web-frequency-select"
							value={item.updateFrequency}
							options={WEB_UPDATE_FREQUENCY_OPTIONS}
							onChange={(value) => {
								handleUpdateUrlFrequency(item.id, value);
							}}
						/>
						<Tooltip
							title={webUpdateFrequencyTooltipContent}
							color="#fff"
							placement="top"
							classNames={{ root: 'knowledge-import-route__web-frequency-tooltip-overlay' }}
						>
							<Button type="text" className="knowledge-import-route__web-help-button" icon={<QuestionCircleOutlined />} />
						</Tooltip>
						<Button type="link" className="knowledge-import-route__web-delete-link" onClick={() => handleRemoveUrl(item.id)}>
							删除
						</Button>
						<div className="knowledge-import-route__web-parse-slot">
							{item.parseStatus === 'parsing' ? (
								<div className="knowledge-import-route__web-parse-status knowledge-import-route__web-parse-status--parsing">
									<LoadingOutlined />
									<span>解析中</span>
								</div>
							) : null}
							{item.parseStatus === 'success' ? (
								<div className="knowledge-import-route__web-parse-status knowledge-import-route__web-parse-status--success">
									<CheckCircleFilled />
									<span>解析成功</span>
								</div>
							) : null}
							{item.parseStatus === 'failure' ? (
								<div className="knowledge-import-route__web-parse-status knowledge-import-route__web-parse-status--failure">
									<CloseCircleFilled />
									<span>解析失败</span>
								</div>
							) : null}
						</div>
					</div>
				);
			})}
		</div>
		<Flex gap={18} align="center" wrap className="knowledge-import-route__web-actions">
			<Button type="link" icon={<PlusOutlined />} className="knowledge-import-route__web-action-link" onClick={handleAddUrlRow}>
				添加链接
			</Button>
			<Button
				type="link"
				icon={<ApiOutlined />}
				disabled={parseActionDisabled}
				className={`knowledge-import-route__web-action-link${parseActionDisabled ? ' knowledge-import-route__web-action-link--disabled' : ''}`}
				onClick={handleParseWebUrls}
			>
				一键解析
			</Button>
			<Button type="link" icon={<DeploymentUnitOutlined />} className="knowledge-import-route__web-action-link" onClick={handleApplyFrequency}>
				一键设置更新频率
			</Button>
		</Flex>
	</>
);

interface WebBatchModePanelProps {
	form: FormInstance<ImportFormValues>;
	messageApi: MessageInstance;
	currentBatchFileName: string;
	webBatchFiles: ImportFormValues['webBatchFiles'];
	batchParseLoading: boolean;
	batchParseResultCount: number | null;
	handleClearBatchFile: (event: React.MouseEvent<HTMLButtonElement>) => void;
	handleParseBatchFile: () => Promise<void>;
}

const WebBatchModePanel = ({
	form,
	messageApi,
	currentBatchFileName,
	webBatchFiles,
	batchParseLoading,
	batchParseResultCount,
	handleClearBatchFile,
	handleParseBatchFile,
}: WebBatchModePanelProps) => {
	// 上传属性与当前渲染态绑定，便于后续替换真实上传策略。
	const webBatchUploadProps = createWebBatchUploadProps(messageApi);
	const shouldShowBatchParseResult = batchParseResultCount !== null;

	if (!webBatchFiles.length) {
		return (
			<>
				<Flex gap={12} align="center" wrap>
					<Form.Item
						name="webBatchFiles"
						valuePropName="fileList"
						getValueFromEvent={getWebBatchUploadFileList}
						className="knowledge-import-route__form-item"
					>
						<Upload {...webBatchUploadProps} showUploadList={false}>
							<Button icon={<UploadOutlined />}>文件上传</Button>
						</Upload>
					</Form.Item>
					<Button onClick={downloadWebBatchTemplate}>xlsx模板下载</Button>
				</Flex>
				<Text type="secondary" className="knowledge-import-route__web-batch-file-hint">
					批量解析总数不超过800条，只支持.xlsx文件，点击下载excel模板，只支持上传一个文件，单个文件不超过15MB
				</Text>
				<Flex gap={12} align="center" className="knowledge-import-route__web-batch-actions">
					<Button
						type="link"
						icon={<ApiOutlined />}
						disabled
						className="knowledge-import-route__web-action-link knowledge-import-route__web-action-link--disabled knowledge-import-route__web-batch-parse-link"
					>
						一键解析
					</Button>
					<Text type="secondary" className="knowledge-import-route__web-batch-file-hint">
						获取网页数量，以准确预估解析消耗
					</Text>
				</Flex>
			</>
		);
	}

	return (
		<>
			<Flex gap={12} align="center" wrap className="knowledge-import-route__web-batch-row">
				<Form.Item
					name="webBatchFiles"
					valuePropName="fileList"
					getValueFromEvent={getWebBatchUploadFileList}
					className="knowledge-import-route__form-item knowledge-import-route__web-batch-upload-item"
					rules={[
						{
							validator: async (_, value) => {
								const currentValues = form.getFieldsValue(true) as ImportFormValues;
								if (currentValues.webUploadMode !== 'batch') {
									return;
								}

								if (Array.isArray(value) && value.length > 0) {
									return;
								}

								throw new Error('请先选择批量上传文件');
							},
						},
					]}
				>
					<Upload {...webBatchUploadProps} showUploadList={false}>
						<div className="knowledge-import-route__web-batch-file-card">
							<span className="knowledge-import-route__web-batch-file-icon">
								<FileTextOutlined />
							</span>
							<span className="knowledge-import-route__web-batch-file-name">{currentBatchFileName}</span>
							<button type="button" className="knowledge-import-route__web-batch-file-clear" onClick={handleClearBatchFile}>
								<CloseOutlined />
							</button>
						</div>
					</Upload>
				</Form.Item>
				<Form.Item name="webUpdateFrequency" className="knowledge-import-route__form-item knowledge-import-route__web-batch-frequency-item">
					<Select className="knowledge-import-route__web-batch-frequency-select" options={WEB_UPDATE_FREQUENCY_OPTIONS} />
				</Form.Item>
				<Tooltip
					title={webUpdateFrequencyTooltipContent}
					color="#fff"
					placement="top"
					classNames={{ root: 'knowledge-import-route__web-frequency-tooltip-overlay' }}
				>
					<Button type="text" className="knowledge-import-route__web-help-button" icon={<QuestionCircleOutlined />} />
				</Tooltip>
			</Flex>
			<Flex gap={12} align="center" className="knowledge-import-route__web-batch-actions">
				<Button
					type="link"
					icon={batchParseLoading ? <LoadingOutlined /> : <ApiOutlined />}
					className="knowledge-import-route__web-action-link knowledge-import-route__web-batch-parse-link"
					onClick={() => {
						void handleParseBatchFile();
					}}
				>
					{batchParseLoading ? '解析中' : batchParseResultCount === null ? '一键解析' : '重新解析'}
				</Button>
				<Text type="secondary" className="knowledge-import-route__web-batch-file-hint">
					获取网页数量，以准确预估解析消耗
				</Text>
			</Flex>
			{shouldShowBatchParseResult ? (
				<div className="knowledge-import-route__web-batch-result-card">
					<div className="knowledge-import-route__web-batch-result-title">解析结果</div>
					<Flex align="center" gap={16} wrap className="knowledge-import-route__web-batch-result-content">
						<Flex align="center" gap={8} className="knowledge-import-route__web-batch-result-summary">
							<span>解析结果：</span>
							<span className="knowledge-import-route__web-batch-file-icon">
								<FileTextOutlined />
							</span>
							<span>已解析 {batchParseResultCount} 条url</span>
						</Flex>
						<Button type="link" className="knowledge-import-route__web-batch-result-link">
							查看解析结果
						</Button>
					</Flex>
				</div>
			) : null}
		</>
	);
};

const WebOptionalConfigFields = ({ formValues }: { formValues: ImportFormValues }) => (
	<>
		<LabeledRow label="去重方式">
			<Form.Item name="webDeduplicate" valuePropName="checked" className="knowledge-import-route__form-item">
				<Checkbox>知识库内URL去重</Checkbox>
			</Form.Item>
		</LabeledRow>
		<LabeledRow
			label="HTML内容筛选"
			alignStart
			tooltip={{ title: '可基于 DOM 结构筛选网页中的目标内容区域。', color: '#fff', icon: <InfoCircleOutlined /> }}
		>
			<Flex vertical gap={10} className="knowledge-import-route__web-filter-block">
				<Form.Item name="webHtmlFilter" valuePropName="checked" className="knowledge-import-route__form-item">
					<Switch />
				</Form.Item>
				<Text type="secondary" className="knowledge-import-route__web-helper-copy">
					可批量指定相同结构的网页内容范围进行解析。例如，可筛选新闻、产品文档、商品详情页中特定位置的内容，忽略顶部导航、广告、推荐等无关信息
				</Text>
				{formValues.webHtmlFilter ? (
					<Form.Item name="webHtmlFilterSelector" className="knowledge-import-route__form-item knowledge-import-route__web-filter-input-item">
						<Input placeholder="请输入CSS选择器，例如div.container p" />
					</Form.Item>
				) : null}
			</Flex>
		</LabeledRow>
		<LabeledRow label="抽取链接" alignStart>
			<Flex vertical gap={6}>
				<Form.Item name="webExtractLinks" valuePropName="checked" className="knowledge-import-route__form-item">
					<Switch />
				</Form.Item>
				<Text type="secondary" className="knowledge-import-route__web-helper-copy">
					保留解析内容中文本与图片的超链接
				</Text>
			</Flex>
		</LabeledRow>
	</>
);

export const ImportWebSourceFields = () => {
	const { form, formValues, messageApi } = useImportContext();
	const controller = useWebImportController({ form, formValues, messageApi });

	return (
		<Flex vertical gap={16}>
			<Form.Item name="webUrls" hidden>
				<input />
			</Form.Item>
			<Form.Item name="webUpdateFrequency" hidden>
				<input />
			</Form.Item>
			<LabeledRow label={renderRequiredLabel('URL解析方式')} alignStart>
				<Form.Item name="webParseMode" className="knowledge-import-route__form-item">
					<Radio.Group className="knowledge-import-route__web-parse-group">
						{WEB_PARSE_MODE_OPTIONS.map((option) => (
							<div key={option.value} className="knowledge-import-route__web-parse-card">
								<Radio value={option.value}>{option.label}</Radio>
								<Text type="secondary" className="knowledge-import-route__web-parse-description">
									{option.description}
								</Text>
							</div>
						))}
					</Radio.Group>
				</Form.Item>
			</LabeledRow>
			<LabeledRow label="">
				<div className="knowledge-import-route__web-panel">
					<LabeledRow label="上传方式：">
						<Form.Item name="webUploadMode" className="knowledge-import-route__form-item">
							<Segmented options={WEB_UPLOAD_MODE_OPTIONS} />
						</Form.Item>
					</LabeledRow>
					<Text type="secondary" className="knowledge-import-route__web-upload-hint">
						{controller.webUploadMode === 'single' ? WEB_SINGLE_MODE_HINT : WEB_BATCH_MODE_HINT}
					</Text>
					{controller.webUploadMode === 'single' ? (
						<WebSingleModePanel
							webUrls={controller.webUrls}
							parseActionDisabled={controller.parseActionDisabled}
							handleAddUrlRow={controller.handleAddUrlRow}
							handleUpdateUrlValue={controller.handleUpdateUrlValue}
							handleUpdateUrlFrequency={controller.handleUpdateUrlFrequency}
							handleRemoveUrl={controller.handleRemoveUrl}
							handleParseWebUrls={controller.handleParseWebUrls}
							handleApplyFrequency={controller.handleApplyFrequency}
						/>
					) : (
						<LabeledRow label={renderRequiredLabel('选择文件')} alignStart>
							<Flex vertical gap={10} className="knowledge-import-route__web-batch-panel">
								<WebBatchModePanel
									form={form}
									messageApi={messageApi}
									currentBatchFileName={controller.currentBatchFileName}
									webBatchFiles={controller.webBatchFiles}
									batchParseLoading={controller.batchParseLoading}
									batchParseResultCount={controller.batchParseResultCount}
									handleClearBatchFile={controller.handleClearBatchFile}
									handleParseBatchFile={controller.handleParseBatchFile}
								/>
							</Flex>
						</LabeledRow>
					)}
					<WebOptionalConfigFields formValues={formValues} />
				</div>
			</LabeledRow>
			<Modal
				open={controller.frequencyModalOpen}
				title="一键设置更新频率"
				onCancel={() => {
					controller.setFrequencyModalOpen(false);
				}}
				onOk={controller.handleConfirmApplyFrequency}
				okText="确定"
				cancelText="取消"
				destroyOnHidden
			>
				<Flex vertical gap={12} className="knowledge-import-route__web-frequency-modal">
					<Select
						value={controller.batchFrequencyValue}
						options={WEB_UPDATE_FREQUENCY_OPTIONS}
						onChange={(value) => {
							controller.setBatchFrequencyValue(value);
						}}
					/>
					{webUpdateFrequencyTooltipContent}
				</Flex>
			</Modal>
		</Flex>
	);
};