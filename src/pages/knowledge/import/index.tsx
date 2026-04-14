import { PageContainer } from '@ant-design/pro-components';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { useNavigate, useLocation } from '@umijs/max';
import { Button, Flex, Form, message, Typography } from 'antd';
const { Title } = Typography;
import { useMemo, useState } from 'react';
import { createRecordFromUpload, createRecordFromWebUrl, persistImportedRecords } from '../utils';
import { ImportFooter, ImportPageHeader } from './components/Scaffold';
import {
	ImportOverviewStep,
	ImportParserSection,
	ImportSliceSection,
	ImportSourceSection,
	validateAddOverviewStep,
} from './components/Sections';
import {
	addWebUrls,
	shouldShowWebConfig,
	createUploadProps,
	createInitialImportFormValues,
	extractUrlsFromWebBatchFile,
	getUploadFileList,
	MAX_WEB_BATCH_URL_COUNT,
	validateWebImportBeforeSubmit,
} from './formConfig';
import type { ImportFormValues } from './types';
import './index.less';

const KnowledgeImportPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const locationType = location.state as {
		type: 'import' | 'add';
	};
	const pageType = locationType?.type ?? 'import';
	const [form] = Form.useForm<ImportFormValues>();
	const [currentStep, setCurrentStep] = useState(pageType === 'add' ? 0 : 1);
	const [messageApi, messageContextHolder] = message.useMessage();
	const initialFormValues = useMemo(() => createInitialImportFormValues(), []);
	const watchedValues = Form.useWatch([], form);
	const formValues = watchedValues ?? initialFormValues;

	const uploadProps = createUploadProps(formValues, messageApi);

	const handleSubmit = async () => {
		try {
			const validate = await form.validateFields();
			console.log('当前step的表单验证数据', validate);
			const values = form.getFieldsValue(true) as ImportFormValues;
			console.log('整个form表单数据', values);
			if (shouldShowWebConfig(values)) {
				if (values.webUploadMode === 'batch') {
					try {
						const extractedUrls = await extractUrlsFromWebBatchFile(values.webBatchFiles[0]);
						const normalizedBatchResult = addWebUrls({
							existingUrls: [],
							urlList: extractedUrls,
							updateFrequency: values.webUpdateFrequency,
							deduplicate: values.webDeduplicate,
							maxCount: MAX_WEB_BATCH_URL_COUNT,
						});

						if (normalizedBatchResult.invalidUrls.length) {
							messageApi.warning('部分 URL 格式不合法，已自动忽略');
						}

						if (normalizedBatchResult.duplicateUrls.length) {
							messageApi.warning('知识库内 URL 去重已开启，重复链接已忽略');
						}

						if (normalizedBatchResult.overflow > 0) {
							messageApi.warning(`批量上传模式下最多导入${MAX_WEB_BATCH_URL_COUNT}条 URL`);
						}

						if (!normalizedBatchResult.urls.length) {
							messageApi.warning('上传文件中未解析到可用的 URL');
							return;
						}

						const validationResult = validateWebImportBeforeSubmit({
							webUrls: normalizedBatchResult.urls,
						});
						if (!validationResult.valid) {
							messageApi.warning(validationResult.message);
							return;
						}

						const normalizedValues: ImportFormValues = {
							...values,
							webUrls: validationResult.urls,
						};

						const importedRecords = normalizedValues.webUrls.map((item) => createRecordFromWebUrl(item, normalizedValues));
						persistImportedRecords(importedRecords);
						navigate('/knowledge/list');
						return;
					} catch (error) {
						messageApi.warning(error instanceof Error ? error.message : '批量上传文件解析失败');
						return;
					}
				}

				const validationResult = validateWebImportBeforeSubmit(values);
				if (!validationResult.valid) {
					messageApi.warning(validationResult.message);
					return;
				}

				const normalizedValues: ImportFormValues = {
					...values,
					webUrls: validationResult.urls,
				};

				const importedRecords = normalizedValues.webUrls.map((item) => createRecordFromWebUrl(item, normalizedValues));
				persistImportedRecords(importedRecords);
				navigate('/knowledge/list');
				return;
			}

			if (!values.pendingFiles?.length) {
				messageApi.warning('请先选择要导入的文件');
				return;
			}

			const importedRecords = values.pendingFiles.map((file) => createRecordFromUpload(file, values));
			persistImportedRecords(importedRecords);
			navigate('/knowledge/list');
		} catch {
			console.log('handleSubmit error');
		}
	};

	return (
		<PageContainer className="knowledge-import-route" title={<Flex align="center" gap={10}>
			<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
			<Title level={5} className="knowledge-import-route__title">
				{pageType === 'add' ? '创建知识库' : '导入文件'}
			</Title>
		</Flex>}>
			{messageContextHolder}
			<div className="knowledge-import-route__shell">
				<Flex vertical gap={20} className="knowledge-import-route__layout">
					<ImportPageHeader
						currentStep={currentStep}
					/>
					<div className="knowledge-import-route__content">
						<Flex gap={20} className="knowledge-import-route__content-wrapper"> 
							<Form<ImportFormValues>
								form={form}
								layout="horizontal"
								className="knowledge-import-route__form"
								initialValues={initialFormValues}
							>
								{currentStep === 0 ? (
									<ImportOverviewStep type={pageType} form={form} formValues={formValues} />
								) : (
									<Flex vertical gap={24}>
										<ImportSourceSection
											form={form}
											formValues={formValues}
											uploadProps={uploadProps}
											messageApi={messageApi}
											getUploadFileList={getUploadFileList}
										/>
										{formValues.mode === 'byType' ? (
											<>
												<ImportParserSection form={form} formValues={formValues} />
												{formValues.fileType !== 'qa' && formValues.fileType !== 'image' ? (
													<ImportSliceSection form={form} formValues={formValues} />
												) : null}
											</>
										) : null}
									</Flex>
								)}
							</Form>
						</Flex>
					</div>
					<ImportFooter
						currentStep={currentStep}
						type={pageType}
						onCancel={() => {
							if (currentStep === 1) {
								setCurrentStep(0);
								return;
							}

							navigate('/knowledge/list');
						}}
						onPrev={() => {
							setCurrentStep(0);
						}}
						onNext={() => {
							if (pageType === 'add') {
								void validateAddOverviewStep(form).then(() => {
									setCurrentStep(1);
								}).catch(() => undefined);
								return;
							}

							setCurrentStep(1);
						}}
						onSubmit={handleSubmit}
					/>
				</Flex>
			</div>
		</PageContainer>
	);
};

export default KnowledgeImportPage;