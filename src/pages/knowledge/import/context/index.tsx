import { useNavigate, useLocation } from '@umijs/max';
import { Form, message } from 'antd';
import type { UploadProps } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { MessageInstance } from 'antd/es/message/interface';
import { useQuery } from '@tanstack/react-query';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addKnowledgeDoc, queryEmbeddingModels, queryKnowledgeGroup } from '@/services/knowledge/api';
import { getLocalStorage, StorageKeys } from '@/utils/storage';
import type { KnowledgeGroup } from '../../list/types';
import { buildGroupTree, ensureRootGroup } from '../../list/utils';
import {
	addWebUrls,
	createInitialImportFormValues,
	createUploadProps,
	extractUrlsFromWebBatchFile,
	getUploadFileList,
	MAX_WEB_BATCH_URL_COUNT,
	shouldShowWebConfig,
	validateWebImportBeforeSubmit,
} from '../formConfig';
import { buildImportDocumentsPayload } from '../payload';
import type { EmbeddingModelOption, ImportFormValues } from '../types';
import { createRecordFromUpload, createRecordFromWebUrl, persistImportedRecords } from '../../utils';

type ImportPageType = 'import' | 'add';

interface ImportLocationState {
	type?: ImportPageType;
	knowledgeId?: string;
}

interface ImportContextValue {
  currentUser: any;
	pageType: ImportPageType;
	targetKnowledgeId: string;
	setTargetKnowledgeId: Dispatch<SetStateAction<string>>;
	form: FormInstance<ImportFormValues>;
	formValues: ImportFormValues;
	initialFormValues: ImportFormValues;
	currentStep: number;
	setCurrentStep: Dispatch<SetStateAction<number>>;
	messageApi: MessageInstance;
	messageContextHolder: ReactNode;
	uploadProps: UploadProps;
	modelList: EmbeddingModelOption[];
	knowledgeGroup: KnowledgeGroup[];
	getUploadFileList: typeof getUploadFileList;
	handleSubmit: () => Promise<void>;
	goBack: () => void;
	goToKnowledgeList: () => void;
	goToTargetKnowledge: () => void;
}

const ImportContext = createContext<ImportContextValue | null>(null);

export const ImportContextProvider = ({ children }: { children: ReactNode }) => {
	const currentUser: any = getLocalStorage(StorageKeys.CURRENT_USER);
	const navigate = useNavigate();
	const location = useLocation();
	const locationType = location.state as ImportLocationState | undefined;
	const pageType = locationType?.type ?? 'import';
	const [targetKnowledgeId, setTargetKnowledgeId] = useState(locationType?.knowledgeId ?? '');
	const [form] = Form.useForm<ImportFormValues>();
	const [currentStep, setCurrentStep] = useState(pageType === 'add' ? 0 : 1);
	const [messageApi, messageContextHolder] = message.useMessage();
	const initialFormValues = useMemo(() => createInitialImportFormValues(), []);
	const watchedValues = Form.useWatch([], form);
	const formValues = watchedValues ?? initialFormValues;
	const uploadProps = createUploadProps(formValues, messageApi);
	const [modelList, setModelList] = useState<EmbeddingModelOption[]>([]);

	const { data: modelsList } = useQuery({
		queryKey: ['KnowledgeList'],
		queryFn: () => queryEmbeddingModels({}),
		select: (response: any) => response.data,
	});

	const { data: knowledgeTree } = useQuery({
		queryKey: ['KnowledgeTree', currentUser?.tenant_id],
		queryFn: () =>
			queryKnowledgeGroup({
				tenant_id: currentUser?.tenant_id,
			}),
		select: (response: any) => response.data,
	});

	const knowledgeGroup = useMemo<KnowledgeGroup[]>(() => {
		return ensureRootGroup(buildGroupTree((knowledgeTree?.list as KnowledgeGroup[] | undefined) ?? []));
	}, [knowledgeTree?.list]);

	useEffect(() => {
		if (Array.isArray(modelsList?.models)) {
			setModelList(modelsList.models);

			const currentEmbeddingModel = form.getFieldValue('embeddingModel');
			const hasMatchedModel = modelsList.models.some(
				(item: EmbeddingModelOption) => item?.model_name === currentEmbeddingModel || item?.value === currentEmbeddingModel,
			);

			if (!hasMatchedModel && modelsList.models[0]) {
				form.setFieldValue(
					'embeddingModel',
					modelsList.models[0].model_name ?? modelsList.models[0].value ?? currentEmbeddingModel,
				);
			}
		}
	}, [form, modelsList?.models]);

	const goBack = () => {
		navigate(-1);
	};

	const goToKnowledgeList = () => {
		navigate('/knowledge/list');
	};

	const goToTargetKnowledge = () => {
		if (!targetKnowledgeId) {
			goToKnowledgeList();
			return;
		}

		navigate('/knowledge/index', { state: { knowledgeId: targetKnowledgeId } });
	};

	const handleSubmit = async () => {
		try {
			await form.validateFields();
			const values = form.getFieldsValue(true) as ImportFormValues;
      console.log('submit form values', values);
			if (!targetKnowledgeId) {
				messageApi.warning('未找到目标知识库 ID，请先创建或选择知识库');
				return;
			}

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
						const payload = buildImportDocumentsPayload(targetKnowledgeId, normalizedValues);
						const response: any = await addKnowledgeDoc({ ...payload, tenant_id: currentUser?.tenant_id });
						if (response?.code && response.code !== 200) {
							messageApi.warning(response?.msg || '导入失败，请稍后重试');
							return;
						}

						const importedRecords = normalizedValues.webUrls.map((item) => createRecordFromWebUrl(item, normalizedValues));
						persistImportedRecords(importedRecords);
						goToTargetKnowledge();
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
				const payload = buildImportDocumentsPayload(targetKnowledgeId, normalizedValues);
				const response: any = await addKnowledgeDoc({ ...payload, tenant_id: currentUser?.tenant_id });
				if (response?.code && response.code !== 200) {
					messageApi.warning(response?.msg || '导入失败，请稍后重试');
					return;
				}

				const importedRecords = normalizedValues.webUrls.map((item) => createRecordFromWebUrl(item, normalizedValues));
				persistImportedRecords(importedRecords);
				goToTargetKnowledge();
				return;
			}

			if (!values.pendingFiles?.length) {
				messageApi.warning('请先选择要导入的文件');
				return;
			}

			const payload = buildImportDocumentsPayload(targetKnowledgeId, values);
			const response: any = await addKnowledgeDoc({ ...payload, tenant_id: currentUser?.tenant_id });
			if (response?.code && response.code !== 200) {
				messageApi.warning(response?.msg || '导入失败，请稍后重试');
				return;
			}

			const importedRecords = values.pendingFiles.map((file) => createRecordFromUpload(file, values));
			persistImportedRecords(importedRecords);
			goToTargetKnowledge();
		} catch {
			return;
		}
	};

	const contextValue = useMemo<ImportContextValue>(() => ({
    currentUser,
		pageType,
		targetKnowledgeId,
		setTargetKnowledgeId,
		form,
		formValues,
		initialFormValues,
		currentStep,
		setCurrentStep,
		messageApi,
		messageContextHolder,
		uploadProps,
		modelList,
		knowledgeGroup,
		getUploadFileList,
		handleSubmit,
		goBack,
		goToKnowledgeList,
		goToTargetKnowledge,
	}), [
    currentUser,
		pageType,
		targetKnowledgeId,
		form,
		formValues,
		initialFormValues,
		currentStep,
		messageApi,
		messageContextHolder,
		uploadProps,
		modelList,
		knowledgeGroup,
		setTargetKnowledgeId,
	]);

	return <ImportContext.Provider value={contextValue}>{children}</ImportContext.Provider>;
};

export const useImportContext = () => {
	const context = useContext(ImportContext);
	if (!context) {
		throw new Error('useImportContext must be used within ImportContextProvider');
	}

	return context;
};