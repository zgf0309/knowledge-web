import { PageContainer } from '@ant-design/pro-components';
import { useNavigate, useLocation } from '@umijs/max';
import dayjs from 'dayjs';
import { Divider, Flex, Form, Modal, message } from 'antd';
import type { Key } from 'react';
import { startTransition, useMemo, useState } from 'react';
import {
	TAG_OPTIONS,
} from './constants';
import KnowledgeConfigDrawer from './components/KnowledgeConfigDrawer';
import KnowledgeHeader from './components/KnowledgeHeader';
import KnowledgeTable from './components/KnowledgeTable';
import KnowledgeTagModal from './components/KnowledgeTagModal';
import KnowledgeToolbar from './components/KnowledgeToolbar';
import type { ImportFormValues } from './import/types';
import type { KnowledgeBaseInfo, KnowledgeFileRecord, TagFormValues } from './types';
import { getUniqueTags } from './utils';
import './index.less';
import { queryKnowledgeDocList } from '@/services/knowledge/api';
import {StorageKeys, getLocalStorage } from '@/utils/storage';
import { useQuery } from '@tanstack/react-query';

const KnowledgePage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const locationState = location.state as { knowledgeId?: string; knowledgeName?: string } | undefined;
	const knowledgeId = locationState?.knowledgeId;
	const [searchKeyword, setSearchKeyword] = useState('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [configDrawerRecord, setConfigDrawerRecord] = useState<KnowledgeFileRecord | null>(null);
	const [tagModalOpen, setTagModalOpen] = useState(false);
	const [tagTargetKeys, setTagTargetKeys] = useState<string[]>([]);
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
	const [configForm] = Form.useForm<ImportFormValues>();
	const [tagForm] = Form.useForm<TagFormValues>();
	const [messageApi, messageContextHolder] = message.useMessage();
	const [modal, modalContextHolder] = Modal.useModal();
	const userInfo:any = getLocalStorage(StorageKeys.CURRENT_USER);
	const { data: knowledgeDocList, isLoading, refetch} = useQuery({
		queryKey: ['KnowledgeDocList', pagination, searchKeyword, knowledgeId],
		queryFn: () =>
			queryKnowledgeDocList({
				tenant_id: userInfo?.tenant_id || '',
				knowledge_id: knowledgeId || '',
				document_name: searchKeyword,
				status: undefined,
				page_num: pagination.current,
				page_size: pagination.pageSize,
			}),
		select: (s: any) => s.data,
	});

	const records = useMemo<KnowledgeFileRecord[]>(() => (knowledgeDocList?.list as KnowledgeFileRecord[] | undefined) ?? [], [knowledgeDocList?.list]);
	const knowledgeUpdatedAt = useMemo(() => {
		if (!records.length) {
			return '-';
		}

		const latestUpdateTime = Math.max(...records.map((item) => Number(item.update_time || 0)));
		if (!latestUpdateTime) {
			return '-';
		}

		return dayjs(latestUpdateTime).format('YYYY-MM-DD HH:mm:ss');
	}, [records]);

	const knowledgeBase = useMemo<KnowledgeBaseInfo>(() => ({
		id: knowledgeId || '',
		name: locationState?.knowledgeName || '知识库文档列表',
		sourceType: '共享资源',
		updatedAt: knowledgeUpdatedAt,
		description: `文档数量：${knowledgeDocList?.total || 0}`,
	}), [knowledgeDocList?.total, knowledgeId, knowledgeUpdatedAt, locationState?.knowledgeName]);

	const closeConfigDrawer = () => {
		setConfigDrawerRecord(null);
		configForm.resetFields();
	};

	const closeTagModal = () => {
		setTagModalOpen(false);
		setTagTargetKeys([]);
		tagForm.resetFields();
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
		void refetch();
	};

	const handleCopyKnowledgeId = async () => {
		try {
			await navigator.clipboard.writeText(knowledgeBase.id);
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
				messageApi.warning('删除接口暂未接入');
			},
		});
	};

	const handleSubmitConfig = async (values: ImportFormValues) => {
		console.log('configForm===>', values);
		closeConfigDrawer();
		messageApi.warning('配置更新接口暂未接入');
	};

	const handleSubmitTags = async () => {
		const values = await tagForm.validateFields();
		console.log('tagForm===>', values);
		messageApi.warning('标签更新接口暂未接入');
	};

	const handleOpenDocument = (record: KnowledgeFileRecord) => {
		navigate(`/knowledge/document/${record?.document_id}`);
	};

	return (
		<PageContainer className="knowledge-table-list-page" title={false}>
			{messageContextHolder}
			{modalContextHolder}
			<Flex vertical gap={20}>
				<KnowledgeHeader
					knowledgeBase={knowledgeBase}
					knowledgeUpdatedAt={knowledgeUpdatedAt}
					onCopyKnowledgeId={handleCopyKnowledgeId}
				/>
				<Divider className="knowledge-table-list__divider" />
				<Flex vertical gap={20} className="knowledge-table-list__content">
					<KnowledgeToolbar
						knowledgeId={knowledgeId || ''}
						searchKeyword={searchKeyword}
						onSearchChange={handleSearchChange}
						onRefresh={handleRefresh}
					/>
					<KnowledgeTable
						isLoading={isLoading}x
						records={records}
						selectedRowKeys={selectedRowKeys}
						currentPage={pagination.current}
						pageSize={pagination.pageSize}
						total={knowledgeDocList?.total || 0}
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
