import type { FormInstance } from 'antd/es/form';
import type { MessageInstance } from 'antd/es/message/interface';
import { addKnowledgeDoc } from '@/services/knowledge/api';
import {
	addWebUrls,
	extractUrlsFromWebBatchFile,
	MAX_WEB_BATCH_URL_COUNT,
	shouldShowWebConfig,
	validateWebImportBeforeSubmit,
} from '../formConfig';
import { buildImportDocumentsPayload } from '../payload';
import type { ImportFormValues } from '../types';
import { createRecordFromUpload, createRecordFromWebUrl, persistImportedRecords } from '../../utils';

interface SubmitImportFormParams {
	form: FormInstance<ImportFormValues>;
	targetKnowledgeId: string;
	currentUser: any;
	messageApi: MessageInstance;
	goToTargetKnowledge: () => void;
}

const submitDocuments = async (
	targetKnowledgeId: string,
	values: ImportFormValues,
	tenantId?: string,
) => {
	// 根据表单值构建后端需要的导入请求体。
	const payload = buildImportDocumentsPayload(targetKnowledgeId, values);
	const response: any = await addKnowledgeDoc({ ...payload, tenant_id: tenantId });

	if (response?.code && response.code !== 200) {
		throw new Error(response?.msg || '导入失败，请稍后重试');
	}
};

export const submitImportForm = async ({
	form,
	targetKnowledgeId,
	currentUser,
	messageApi,
	goToTargetKnowledge,
}: SubmitImportFormParams) => {
	try {
		await form.validateFields();
		// 当前表单的完整值（包含隐藏字段）。
		const values = form.getFieldsValue(true) as ImportFormValues;

		if (!targetKnowledgeId) {
			messageApi.warning('未找到目标知识库 ID，请先创建或选择知识库');
			return;
		}

		if (shouldShowWebConfig(values)) {
			if (values.webUploadMode === 'batch') {
				try {
					// 从批量上传文件中提取 URL 列表。
					const extractedUrls = await extractUrlsFromWebBatchFile(values.webBatchFiles[0]);
					// 统一做 URL 清洗、去重与数量限制。
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

					// 二次校验 URL，保证提交数据符合约束。
					const validationResult = validateWebImportBeforeSubmit({
						webUrls: normalizedBatchResult.urls,
					});
					if (!validationResult.valid) {
						messageApi.warning(validationResult.message);
						return;
					}

					// 归一化后的表单值，仅用于本次提交。
					const normalizedValues: ImportFormValues = {
						...values,
						webUrls: validationResult.urls,
					};
					await submitDocuments(targetKnowledgeId, normalizedValues, currentUser?.tenant_id);

					const importedRecords = normalizedValues.webUrls.map((item) => createRecordFromWebUrl(item, normalizedValues));
					// 将导入记录写入本地，用于列表页快速展示。
					persistImportedRecords(importedRecords);
					goToTargetKnowledge();
					return;
				} catch (error) {
					messageApi.warning(error instanceof Error ? error.message : '批量上传文件解析失败');
					return;
				}
			}

			// 非批量模式下，直接校验当前表单中的 URL。
			const validationResult = validateWebImportBeforeSubmit(values);
			if (!validationResult.valid) {
				messageApi.warning(validationResult.message);
				return;
			}

			const normalizedValues: ImportFormValues = {
				...values,
				webUrls: validationResult.urls,
			};
			await submitDocuments(targetKnowledgeId, normalizedValues, currentUser?.tenant_id);

			const importedRecords = normalizedValues.webUrls.map((item) => createRecordFromWebUrl(item, normalizedValues));
			persistImportedRecords(importedRecords);
			goToTargetKnowledge();
			return;
		}

		if (!values.pendingFiles?.length) {
			messageApi.warning('请先选择要导入的文件');
			return;
		}

		await submitDocuments(targetKnowledgeId, values, currentUser?.tenant_id);
		const importedRecords = values.pendingFiles.map((file) => createRecordFromUpload(file, values));
		persistImportedRecords(importedRecords);
		goToTargetKnowledge();
	} catch {
		return;
	}
};
