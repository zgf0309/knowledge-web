import { CheckCircleFilled } from '@ant-design/icons';
import { Alert, Button, Drawer, Flex, Form, Segmented, Select, Switch, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import type { ImportFormValues } from '../import/types';
import { ImportParserSectionWithForm, ImportSliceSectionWithForm } from '../import/components/ParserSections';
import { ImportSection } from '../import/components/Scaffold/ImportSection';
import { LabeledRow } from '../import/components/Scaffold/LabeledRow';
import { TAG_OPTIONS } from '../constants';
import type { KnowledgeFileRecord } from '../types';
import { createConfigDrawerInitialValues } from '../utils';
import '../index.less';
import '../import/index.less';

const { Text } = Typography;

interface KnowledgeConfigDrawerProps {
	open: boolean;
	record: KnowledgeFileRecord | null;
	onCancel: () => void;
	onSubmit: (values: ImportFormValues) => void;
}

const renderRequiredLabel = (label: string) => (
	<span className="knowledge-import-route__required-label">
		{label}
		<span className="knowledge-import-route__required-mark">*</span>
	</span>
);

const getFileTypeLabel = (doc_category: ImportFormValues['doc_category']) => {
	if (doc_category === 'table') {
		return '导入表格型知识数据';
	}

	if (doc_category === 'web') {
		return '读取网页数据源';
	}

	if (doc_category === 'image') {
		return '导入图片文件';
	}

	if (doc_category === 'audio') {
		return '导入音频文件';
	}

	return '导入文本数据';
};

const getSourceTypeLabel = (sourceType: ImportFormValues['sourceType']) =>
	sourceType === 'bos' ? '百度对象存储（BOS）' : '本地上传';

const KnowledgeConfigDrawer = ({ open, record, onCancel, onSubmit }: KnowledgeConfigDrawerProps) => {
	const [form] = Form.useForm<ImportFormValues>();
	const initialValues = useMemo(
		() => createConfigDrawerInitialValues(record ?? undefined),
		[record],
	);
	const formValues = Form.useWatch([], form) ?? initialValues;

	useEffect(() => {
		if (!open) {
			return;
		}

		form.setFieldsValue(initialValues);
	}, [form, initialValues, open]);

	const handleFinish = (values: ImportFormValues) => {
		onSubmit(values);
		form.resetFields();
	};

	return (
		<Drawer
			open={open}
			width={860}
			title="修改配置"
			destroyOnHidden
			className="knowledge-table-list__config-drawer"
			onClose={() => {
				form.resetFields();
				onCancel();
			}}
			footer={(
				<Flex gap={12} className="knowledge-table-list__config-footer">
					<Button
						type="primary"
						onClick={() => {
							void form.submit();
						}}
					>
						确认
					</Button>
					<Button
						onClick={() => {
							form.resetFields();
							onCancel();
						}}
					>
						取消
					</Button>
				</Flex>
			)}
		>
			<div className="knowledge-import-route knowledge-table-list__config-shell">
				<Alert
					type="warning"
					showIcon
					message="修改配置会重新进行文件处理并消耗模型资源"
					className="knowledge-table-list__config-banner"
				/>
				<Form<ImportFormValues> form={form} layout="horizontal" initialValues={initialValues} onFinish={handleFinish}>
					<Form.Item name="mode" hidden>
						<input />
					</Form.Item>
					<Form.Item name="fileType" hidden>
						<input />
					</Form.Item>
					<Form.Item name="sourceType" hidden>
						<input />
					</Form.Item>
					<Flex vertical gap={24} className="knowledge-table-list__config-body">
						<ImportSection title="托管切片">
							<Flex vertical gap={14} className="knowledge-table-list__config-hosted">
								<LabeledRow label={renderRequiredLabel('向量模型')}>
									<Flex align="center" gap={8} className="knowledge-table-list__config-model">
										<CheckCircleFilled className="knowledge-table-list__config-model-icon" />
										<Text className="knowledge-table-list__config-static-text">multilingual-embedding</Text>
									</Flex>
								</LabeledRow>
								<LabeledRow label="选择资源">
									<Segmented
										value="shared"
										className="knowledge-table-list__config-resource-tabs"
										options={[
											{ label: '选择资源', value: 'resource' },
											{ label: '共享资源', value: 'shared' },
										]}
										onChange={() => undefined}
									/>
								</LabeledRow>
							</Flex>
						</ImportSection>
						<ImportSection title="导入文件源">
							<Flex vertical gap={16} className="knowledge-table-list__config-section-body">
								<LabeledRow label="导入方式">
									<Text className="knowledge-table-list__config-static-text">按文件类型导入</Text>
								</LabeledRow>
								<LabeledRow label={renderRequiredLabel('选择文件类型')}>
									<Text className="knowledge-table-list__config-static-text">{getFileTypeLabel(formValues.doc_category)}</Text>
								</LabeledRow>
								<LabeledRow label={renderRequiredLabel('导入来源')}>
									<Text className="knowledge-table-list__config-static-text">{getSourceTypeLabel(formValues.sourceType)}</Text>
								</LabeledRow>
								<LabeledRow label="标签选择" tooltip="支持为文件添加标签，便于后续筛选和检索" alignStart>
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
													mode="tags"
													showSearch
													allowClear
													placeholder="请选择标签"
													options={TAG_OPTIONS.map((value) => ({ label: value, value }))}
													notFoundContent="未找到相关结果"
													style={{ width: '100%' }}
												/>
											</Form.Item>
										) : null}
									</Flex>
								</LabeledRow>
							</Flex>
						</ImportSection>
						<ImportParserSectionWithForm form={form} formValues={formValues} />
						{formValues.doc_category !== 'table' && formValues.doc_category !== 'image' ? (
							<ImportSliceSectionWithForm form={form} formValues={formValues} />
						) : null}
					</Flex>
				</Form>
			</div>
		</Drawer>
	);
};

export default KnowledgeConfigDrawer;