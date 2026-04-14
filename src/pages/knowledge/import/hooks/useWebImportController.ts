import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import type { FormInstance } from 'antd/es/form';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ImportFormValues } from '../types';
import {
	MAX_WEB_SINGLE_URL_COUNT,
	createEmptyWebImportItem,
	extractUrlsFromWebBatchFile,
	isValidWebUrl,
	removeWebUrl,
	updateWebUrlItem,
	updateWebUrlsFrequency,
} from '../formConfig';

interface UseWebImportControllerParams {
	form: FormInstance<ImportFormValues>;
	formValues: ImportFormValues;
	messageApi: MessageInstance;
}

/**
 * 统一管理网页导入区域的表单状态与交互逻辑，避免组件内部同时承担大量状态和业务判断。
 */
export const useWebImportController = ({
	form,
	formValues,
	messageApi,
}: UseWebImportControllerParams) => {
	// 当前网页导入方式下的核心表单数据。
	const webUrls = formValues.webUrls ?? [];
	const webUploadMode = formValues.webUploadMode ?? 'single';
	const webUpdateFrequency = formValues.webUpdateFrequency ?? 'manual';
	const webBatchFiles = formValues.webBatchFiles ?? [];
	const currentBatchFileName = webBatchFiles[0]?.name ?? '';
	const currentBatchFileUid = webBatchFiles[0]?.uid ?? '';

	// 控制更新频率弹窗与批量解析结果展示。
	const [frequencyModalOpen, setFrequencyModalOpen] = useState(false);
	const [batchFrequencyValue, setBatchFrequencyValue] = useState(webUpdateFrequency);
	const [batchParseLoading, setBatchParseLoading] = useState(false);
	const [batchParseResultCount, setBatchParseResultCount] = useState<number | null>(null);

	const getCurrentWebUrls = () =>
		(form.getFieldValue('webUrls') as ImportFormValues['webUrls'] | undefined) ?? [];

	const getCurrentWebUpdateFrequency = () =>
		(form.getFieldValue('webUpdateFrequency') as ImportFormValues['webUpdateFrequency'] | undefined) ?? 'manual';

	// 统一通过表单写入 URL 列表，避免多处直接 setFieldValue。
	const setWebUrls = (nextUrls: ImportFormValues['webUrls']) => {
		form.setFieldValue('webUrls', nextUrls);
	};

	const ensureSingleModeRows = (
		urls: ImportFormValues['webUrls'],
		updateFrequency: ImportFormValues['webUpdateFrequency'],
	) => (urls.length ? urls : [createEmptyWebImportItem(updateFrequency)]);

	// 根据当前 URL 输入内容，决定是否允许触发一键解析。
	const hasInvalidWebUrl = webUrls.some((item) => {
		const normalizedUrl = item.url.trim();
		return normalizedUrl.length > 0 && !isValidWebUrl(normalizedUrl);
	});

	const hasValidWebUrl = webUrls.some((item) => {
		const normalizedUrl = item.url.trim();
		return normalizedUrl.length > 0 && isValidWebUrl(normalizedUrl);
	});

	const parseActionDisabled = hasInvalidWebUrl || !hasValidWebUrl;

	useEffect(() => {
		if (webUploadMode !== 'single') {
			return;
		}

		const currentWebUrls = getCurrentWebUrls();
		if (currentWebUrls.length > 0) {
			return;
		}

		setWebUrls([createEmptyWebImportItem(getCurrentWebUpdateFrequency())]);
	}, [form, webUploadMode]);

	// 文件切换或上传方式切换后，清空批量解析结果，避免展示旧状态。
	useEffect(() => {
		setBatchParseLoading(false);
		setBatchParseResultCount(null);
	}, [currentBatchFileUid, webUploadMode]);

	/** 新增单条 URL 输入行。 */
	const handleAddUrlRow = () => {
		const currentWebUrls = getCurrentWebUrls();
		const currentUpdateFrequency = getCurrentWebUpdateFrequency();

		if (currentWebUrls.length >= MAX_WEB_SINGLE_URL_COUNT) {
			messageApi.warning(`逐个上传模式下最多添加${MAX_WEB_SINGLE_URL_COUNT}条 URL`);
			return;
		}

		setWebUrls([...currentWebUrls, createEmptyWebImportItem(currentUpdateFrequency)]);
	};

	/** 更新单条 URL 的输入值。 */
	const handleUpdateUrlValue = (id: string, value: string) => {
		setWebUrls(updateWebUrlItem(getCurrentWebUrls(), id, { url: value, parseStatus: 'idle' }));
	};

	/** 更新单条 URL 的更新频率。 */
	const handleUpdateUrlFrequency = (id: string, value: ImportFormValues['webUpdateFrequency']) => {
		setWebUrls(updateWebUrlItem(getCurrentWebUrls(), id, { updateFrequency: value, parseStatus: 'idle' }));
	};

	/** 删除单条 URL，删除后保留至少一个空输入框。 */
	const handleRemoveUrl = (id: string) => {
		setWebUrls(
			ensureSingleModeRows(removeWebUrl(getCurrentWebUrls(), id), getCurrentWebUpdateFrequency()),
		);
	};

	/** 打开批量同步更新频率弹窗。 */
	const handleApplyFrequency = () => {
		const currentWebUrls = getCurrentWebUrls();
		if (!currentWebUrls.length) {
			messageApi.warning('请先添加 URL');
			return;
		}

		setBatchFrequencyValue(getCurrentWebUpdateFrequency());
		setFrequencyModalOpen(true);
	};

	/** 将弹窗中选择的频率同步到全部 URL。 */
	const handleConfirmApplyFrequency = () => {
		setWebUrls(updateWebUrlsFrequency(getCurrentWebUrls(), batchFrequencyValue));
		form.setFieldValue('webUpdateFrequency', batchFrequencyValue);
		setFrequencyModalOpen(false);
		messageApi.success('更新频率已同步到全部 URL');
	};

	/**
	 * 单条 URL 场景的模拟解析逻辑。
	 * 当前仍然沿用前端模拟状态，便于后续平滑替换成真实接口。
	 */
	const handleParseWebUrls = () => {
		const currentWebUrls = getCurrentWebUrls();
		const validItems = currentWebUrls.filter((item) => item.url.trim() && isValidWebUrl(item.url.trim()));
		const validUrlIds = validItems.map((item) => item.id);

		if (!validUrlIds.length) {
			messageApi.warning('请先填写至少一个合法的 URL');
			return;
		}

		setWebUrls(
			currentWebUrls.map((item) => ({
				...item,
				parseStatus: validUrlIds.includes(item.id) ? 'parsing' : 'idle',
			})),
		);

		void Promise.all(
			validItems.map(
				(item) =>
					new Promise<{ id: string; url: string; status: 'success' | 'failure' }>((resolve) => {
						window.setTimeout(() => {
							resolve({
								id: item.id,
								url: item.url.trim(),
								status: /fail|error/i.test(item.url) ? 'failure' : 'success',
							});
						}, 900);
					}),
			),
		).then((results) => {
			const latestWebUrls = getCurrentWebUrls();
			const resultMap = new Map(results.map((item) => [item.id, item]));

			setWebUrls(
				latestWebUrls.map((item) => {
					const matchedResult = resultMap.get(item.id);
					if (!matchedResult) {
						return item;
					}

					if (item.url.trim() !== matchedResult.url) {
						return { ...item, parseStatus: 'idle' };
					}

					return { ...item, parseStatus: matchedResult.status };
				}),
			);

			const successCount = results.filter((item) => item.status === 'success').length;
			const failureCount = results.filter((item) => item.status === 'failure').length;
			if (failureCount > 0) {
				messageApi.warning(`解析完成，成功${successCount}条，失败${failureCount}条`);
				return;
			}

			messageApi.success(`已完成${successCount}条 URL 解析`);
		});
	};

	/** 解析批量上传文件中的 URL 数量，并生成结果摘要。 */
	const handleParseBatchFile = async () => {
		if (!webBatchFiles.length) {
			return;
		}

		setBatchParseLoading(true);
		try {
			const extractedUrls = await extractUrlsFromWebBatchFile(webBatchFiles[0]);
			const validUrls = extractedUrls.filter((item) => isValidWebUrl(item.trim()));
			const uniqueValidUrls = Array.from(new Set(validUrls));
			setBatchParseResultCount(uniqueValidUrls.length);
			messageApi.success(`已解析${uniqueValidUrls.length}条 URL`);
		} catch (error) {
			setBatchParseResultCount(null);
			messageApi.warning(error instanceof Error ? error.message : '文件解析失败');
		} finally {
			setBatchParseLoading(false);
		}
	};

	/** 清空当前已选批量文件，并恢复到初始上传态。 */
	const handleClearBatchFile = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		form.setFieldValue('webBatchFiles', []);
		setBatchParseLoading(false);
		setBatchParseResultCount(null);
	};

	return {
		webUrls,
		webUploadMode,
		webUpdateFrequency,
		webBatchFiles,
		currentBatchFileName,
		frequencyModalOpen,
		batchFrequencyValue,
		batchParseLoading,
		batchParseResultCount,
		parseActionDisabled,
		setFrequencyModalOpen,
		setBatchFrequencyValue,
		handleAddUrlRow,
		handleUpdateUrlValue,
		handleUpdateUrlFrequency,
		handleRemoveUrl,
		handleApplyFrequency,
		handleConfirmApplyFrequency,
		handleParseWebUrls,
		handleParseBatchFile,
		handleClearBatchFile,
	};
};