import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import dayjs from 'dayjs';
import { Divider, Flex, Form, Modal, message } from 'antd';
import type { Key } from 'react';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import {
	INITIAL_RECORDS,
	KNOWLEDGE_BASE,
	TAG_OPTIONS,
} from './constants';
import KnowledgeConfigDrawer from './components/KnowledgeConfigDrawer';
import KnowledgeHeader from './components/KnowledgeHeader';
import KnowledgeTable from './components/KnowledgeTable';
import KnowledgeTagModal from './components/KnowledgeTagModal';
import KnowledgeToolbar from './components/KnowledgeToolbar';
import type { ImportFormValues } from './import/types';
import type { KnowledgeFileRecord, TagFormValues } from './types';
import { consumeImportedRecords, getConfigDrawerParserLabel, getConfigDrawerSourceLabel, getUniqueTags } from './utils';
import './index.less';

const KnowledgePage = () => {
	const navigate = useNavigate();
	const [records, setRecords] = useState(INITIAL_RECORDS);
	const [knowledgeUpdatedAt, setKnowledgeUpdatedAt] = useState(KNOWLEDGE_BASE.updatedAt);
	const [searchKeyword, setSearchKeyword] = useState('');
	const deferredSearchKeyword = useDeferredValue(searchKeyword);
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [configDrawerRecord, setConfigDrawerRecord] = useState<KnowledgeFileRecord | null>(null);
	const [tagModalOpen, setTagModalOpen] = useState(false);
	const [tagTargetKeys, setTagTargetKeys] = useState<string[]>([]);
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
	const [configForm] = Form.useForm<ImportFormValues>();
	const [tagForm] = Form.useForm<TagFormValues>();
	const [messageApi, messageContextHolder] = message.useMessage();
	const [modal, modalContextHolder] = Modal.useModal();

	useEffect(() => {
		const importedRecords = consumeImportedRecords();
		if (!importedRecords.length) {
			return;
		}

		setRecords((currentRecords) => [...importedRecords, ...currentRecords]);
		setKnowledgeUpdatedAt(dayjs().format('YYYY-MM-DD HH:mm:ss'));
		setPagination((current) => ({
			...current,
			current: 1,
		}));
		messageApi.success(`已导入 ${importedRecords.length} 个文件`);
	}, [messageApi]);

	const filteredRecords = records.filter((record) => {
		const keyword = deferredSearchKeyword.trim().toLowerCase();
		if (!keyword) {
			return true;
		}

		return [record.name, record.id, record.uploader].some((value) =>
			value.toLowerCase().includes(keyword),
		);
	});

	const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pagination.pageSize));
	const currentPage = Math.min(pagination.current, totalPages);
	const pagedRecords = filteredRecords.slice(
		(currentPage - 1) * pagination.pageSize,
		currentPage * pagination.pageSize,
	);

	const closeConfigDrawer = () => {
		setConfigDrawerRecord(null);
		configForm.resetFields();
	};

	const closeTagModal = () => {
		setTagModalOpen(false);
		setTagTargetKeys([]);
		tagForm.resetFields();
	};

	const removeRecords = (keys: string[]) => {
		setRecords((currentRecords) => currentRecords.filter((record) => !keys.includes(record.key)));
		setSelectedRowKeys((currentKeys) => currentKeys.filter((key) => !keys.includes(String(key))));
		setKnowledgeUpdatedAt(dayjs().format('YYYY-MM-DD HH:mm:ss'));

		const nextTotal = filteredRecords.length - keys.length;
		const nextPages = Math.max(1, Math.ceil(Math.max(nextTotal, 0) / pagination.pageSize));
		setPagination((current) => ({
			...current,
			current: Math.min(current.current, nextPages),
		}));
	};

	const openConfigDrawer = (record: KnowledgeFileRecord) => {
		setConfigDrawerRecord(record);
	};

	const openTagModal = (keys: string[], tags?: string[]) => {
		if (!keys.length) {
			messageApi.warning('请先选择要管理标签的文件');
			return;
		}

		const mergedTags = tags ?? getUniqueTags(records, keys);

		setTagTargetKeys(keys);
		tagForm.setFieldsValue({ tags: mergedTags });
		setTagModalOpen(true);
	};

	const handleSearchChange = (value: string) => {
		startTransition(() => {
			setSearchKeyword(value);
			setPagination((current) => ({
				...current,
				current: 1,
			}));
		});
	};

	const handleRefresh = () => {
		setKnowledgeUpdatedAt(dayjs().format('YYYY-MM-DD HH:mm:ss'));
		messageApi.success('列表已刷新');
	};

	const handleCopyKnowledgeId = async () => {
		try {
			await navigator.clipboard.writeText(KNOWLEDGE_BASE.id);
			messageApi.success('知识库 ID 已复制');
		} catch {
			messageApi.error('复制失败，请手动复制');
		}
	};

	const handleDelete = (keys: string[]) => {
		if (!keys.length) {
			messageApi.warning('请先选择要删除的文件');
			return;
		}

		modal.confirm({
			title: `确认删除 ${keys.length} 个文件吗？`,
			content: '删除后列表会立即更新，该操作不可撤销。',
			okText: '确认删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: () => {
				removeRecords(keys);
				messageApi.success('删除成功');
			},
		});
	};

	const handleSubmitConfig = async (values: ImportFormValues) => {
		if (!configDrawerRecord) {
			return;
		}

		const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
		const parserConfig = getConfigDrawerParserLabel(values);
		const sourceType = getConfigDrawerSourceLabel(values.sourceType);
		const tags = values.autoTagging ? (values.selectedTags ?? []) : [];
		setRecords((currentRecords) =>
			currentRecords.map((record) =>
				record.key === configDrawerRecord.key
					? {
						...record,
						parserConfig,
						sourceType,
						tags,
						updatedAt: now,
					}
					: record,
			),
		);
		setKnowledgeUpdatedAt(now);
		closeConfigDrawer();
		messageApi.success('配置已更新');
	};

	const handleSubmitTags = async () => {
		const values = await tagForm.validateFields();
		setRecords((currentRecords) =>
			currentRecords.map((record) =>
				tagTargetKeys.includes(record.key)
					? {
							...record,
							tags: values.tags ?? [],
							updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
						}
					: record,
			),
		);
		setKnowledgeUpdatedAt(dayjs().format('YYYY-MM-DD HH:mm:ss'));
		closeTagModal();
		messageApi.success('标签已更新');
	};

	const handleOpenDocument = (record: KnowledgeFileRecord) => {
		navigate(`/knowledge/document/${record.id}`);
	};

	return (
		<PageContainer className="knowledge-table-list-page" title={false}>
			{messageContextHolder}
			{modalContextHolder}
			<Flex vertical gap={20}>
				<KnowledgeHeader
					knowledgeBase={KNOWLEDGE_BASE}
					knowledgeUpdatedAt={knowledgeUpdatedAt}
					onCopyKnowledgeId={handleCopyKnowledgeId}
				/>
				<Divider className="knowledge-table-list__divider" />
				<Flex vertical gap={20} className="knowledge-table-list__content">
					<KnowledgeToolbar
						searchKeyword={searchKeyword}
						onSearchChange={handleSearchChange}
						onRefresh={handleRefresh}
						onOpenBatchConfig={() => {
							if (selectedRowKeys.length !== 1) {
								messageApi.warning('请先选择一个文件后再修改配置');
								return;
							}

							const targetRecord = records.find((record) => record.key === String(selectedRowKeys[0]));
							if (!targetRecord) {
								messageApi.warning('未找到要修改配置的文件');
								return;
							}

							openConfigDrawer(targetRecord);
						}}
						onDeleteSelected={() => handleDelete(selectedRowKeys.map(String))}
						onOpenTagModal={() => openTagModal(selectedRowKeys.map(String))}
					/>
					<KnowledgeTable
						records={pagedRecords}
						selectedRowKeys={selectedRowKeys}
						currentPage={currentPage}
						pageSize={pagination.pageSize}
						total={filteredRecords.length}
						onSelectionChange={setSelectedRowKeys}
						onPageChange={(page, pageSize) => {
							setPagination({ current: page, pageSize });
						}}
						onOpenDocument={handleOpenDocument}
						onOpenTagModal={openTagModal}
						onOpenConfigModal={openConfigDrawer}
						onDelete={handleDelete}
					/>
				</Flex>
			</Flex>
			<KnowledgeConfigDrawer
				open={Boolean(configDrawerRecord)}
				record={configDrawerRecord}
				onCancel={closeConfigDrawer}
				onSubmit={handleSubmitConfig}
			/>
			<KnowledgeTagModal
				open={tagModalOpen}
				targetCount={tagTargetKeys.length}
				form={tagForm}
				tagOptions={TAG_OPTIONS}
				onCancel={closeTagModal}
				onSubmit={handleSubmitTags}
			/>
		</PageContainer>
	);
};

export default KnowledgePage;
