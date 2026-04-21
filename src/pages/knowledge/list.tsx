import { AimOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Divider, Flex, Modal, message } from 'antd';
import type { Key } from 'react';
import { useCallback, useMemo, useState } from 'react';
import KnowledgeBatchMovePopover from './list/components/KnowledgeBatchMovePopover';
import KnowledgeEditorModal from './list/components/KnowledgeEditorModal';
import KnowledgeGroupManager from './list/components/KnowledgeGroupManager';
import KnowledgeListToolbar from './list/components/KnowledgeListToolbar';
import KnowledgeTableSection from './list/components/KnowledgeTableSection';
import {
	INITIAL_BATCH_MOVE_STATE,
	DEFAULT_GROUPS,
} from './list/constants';
import type {
	KnowledgeBaseRecord,
	KnowledgeBatchMoveState,
	KnowledgeFormValues,
	KnowledgeGroup,
} from './list/types';
import './list.less';
import {queryKnowledgeList, delKnowledgeList} from '@/services/knowledge/api';
import { getLocalStorage, StorageKeys } from '@/utils/storage';
import { useQuery } from '@tanstack/react-query';

const KnowledgeListPage = () => {
	const emptyRecords = useMemo<KnowledgeBaseRecord[]>(() => [], []);
	const current_user: any = getLocalStorage(StorageKeys.CURRENT_USER);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
	});
	const [messageApi, messageContextHolder] = message.useMessage();
	const [groups, setGroups] = useState<KnowledgeGroup[]>(DEFAULT_GROUPS);
	const [selectedGroupKey, setSelectedGroupKey] = useState('all'); // 当前选中的群组
	const [searchKeyword, setSearchKeyword] = useState(''); // 当前知识库搜索关键字
	const [currentGroupTitle, setCurrentGroupTitle] = useState('全部群组'); // 当前选中群组标题
	const [selectRow, setSelectRow] = useState<KnowledgeBaseRecord | null>(null); // 当前选中知识库记录
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]); // 当前选中知识库记录的 key 列表
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 侧边栏折叠状态
	const [editorOpen, setEditorOpen] = useState<boolean>(false); // 当前知识库编辑模态框状态

	
	const [batchMode, setBatchMode] = useState(false);
	
	
	const [batchMoveState, setBatchMoveState] = useState<KnowledgeBatchMoveState>(INITIAL_BATCH_MOVE_STATE);
	const [modal, modalContextHolder] = Modal.useModal();

	// 知识库列表数据
	const { data: knowledgeList, isLoading, refetch} = useQuery({
		queryKey: ['KnowledgeList', pagination, searchKeyword, selectedGroupKey],
		queryFn: () =>
			queryKnowledgeList({
				knowledge_name: searchKeyword,
				group_id: selectedGroupKey === 'all' ? '' : selectedGroupKey,
				tenant_id: current_user?.tenant_id,
				scope: undefined,
				page_num: pagination.current,
				page_size: pagination.pageSize,
			}),
		select: (s: any) => s.data,
	});

	const knowledgeRecords = useMemo<KnowledgeBaseRecord[]>(() => knowledgeList?.list ?? emptyRecords, [emptyRecords, knowledgeList?.list]);
	
	// 计算当前页知识库的 key 列表
	const currentPageKeys = useMemo(() => {
		return knowledgeRecords.map((record) => record.knowledge_id);
	}, [knowledgeRecords]);

	const allCurrentPageSelected = currentPageKeys.length > 0 && currentPageKeys.every((key: string) => selectedRowKeys.includes(key));
	const partialCurrentPageSelected = currentPageKeys.some((key: string) => selectedRowKeys.includes(key)) && !allCurrentPageSelected;

	// 重置到第一页
	const resetToFirstPage = () => {
		setPagination({
			...pagination,
			current: 1,
		});
	};

  // 关闭知识库编辑模态框
	const closeEditor = () => {
		setEditorOpen(false);
	};

	const closeBatchMode = () => {
		setBatchMode(false);
		setSelectedRowKeys([]);
	};

	const closeBatchMoveModal = () => {
		setBatchMoveState(INITIAL_BATCH_MOVE_STATE);
	};

	const handleBatchMovePopoverOpenChange = (open: boolean) => {
		setBatchMoveState(open ? { open: true } : INITIAL_BATCH_MOVE_STATE);
	};

	const handleSearchChange = (keyword: string) => {
		setSearchKeyword(keyword);
		resetToFirstPage();
	};

	const handleSelectGroup = (groupKey: string) => {
		setSelectedGroupKey(groupKey);
		resetToFirstPage();
	};

	const handleGroupDataChange = useCallback(
		({ groups: nextGroups }: { groups: KnowledgeGroup[] }) => {
			setGroups(nextGroups);
		},
		[],
	);

  // 打开编辑模态框
	const openEditModal = (record: KnowledgeBaseRecord) => {
		setSelectRow(record);
		setEditorOpen(true);
	};
	// 删除知识库
	const handleDelete = (keys: string[]) => {
		console.log('要删除的知识库 ID 列表', keys);
		if (!keys.length) {
			messageApi.warning('请先选择要删除的知识库');
			return;
		}

		modal.confirm({
			title: `确认删除 ${keys.length} 个知识库吗？`,
			content: '删除后知识库将从当前列表移除，该操作不可撤销。',
			okText: '确认删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: async () => {

				const res: any = await delKnowledgeList({ knowledge_id: keys[0], tenant_id: current_user?.tenant_id, });
				if (res?.code === 200) {
					setSelectedRowKeys([]);
					refetch();
					messageApi.success('删除成功');
				} else {
					messageApi.error(res?.msg || '删除失败，请稍后重试');
				}
			},
		});
	};

	// 批量删除知识库
	const handleBatchDelete = () => {
		handleDelete(selectedRowKeys.map(String));
	};

	// 移动知识库
	const handleConfirmBatchMove = (targetGroupKey: string) => {
		console.log('批量移动到分组', targetGroupKey);
		const keys = selectedRowKeys.map(String);
		if (!keys.length) {
			messageApi.warning('请先选择要移动的知识库');
			return;
		}
		console.log('要移动的知识库 ID 列表', keys);
		setSelectedRowKeys([]);
		closeBatchMoveModal();
		messageApi.success('知识库群组已更新');
	};

	// 批量选择/取消选择当前页知识库
	const handleToggleSelectAllCurrentPage = (checked: boolean) => {
		if (checked) {
			setSelectedRowKeys((currentKeys) => Array.from(new Set([...currentKeys, ...currentPageKeys])));
			return;
		}
		setSelectedRowKeys((currentKeys) => currentKeys.filter((key) => !currentPageKeys.includes(String(key))));
	};

	const handleSubmit = async (values: KnowledgeFormValues) => {
		void values;
		messageApi.success('知识库已更新');
		closeEditor();
	};

	return (
		<PageContainer title={false} breadcrumb={undefined} className="knowledge-base-list-page">
			{messageContextHolder}
			{modalContextHolder}
			<Flex vertical>
				<Flex align="center" justify="space-between">
					<div className="knowledge-base-list__page-title">知识库</div>
					<Button icon={<AimOutlined />} className="knowledge-base-list__test-button">
						命中测试
					</Button>
				</Flex>
				<Divider />
				<Flex vertical gap={10} className="knowledge-base-list__shell">
					<KnowledgeListToolbar
						sidebarCollapsed={sidebarCollapsed}
						searchKeyword={searchKeyword}
						batchMode={batchMode}
						allCurrentPageSelected={allCurrentPageSelected}
						partialCurrentPageSelected={partialCurrentPageSelected}
						hasSelectedRows={selectedRowKeys.length > 0}
						batchMoveAction={
							<KnowledgeBatchMovePopover
								open={batchMoveState.open}
								disabled={!selectedRowKeys.length}
								groups={groups}
								onOpenChange={handleBatchMovePopoverOpenChange}
								onConfirm={handleConfirmBatchMove}
							>
								<Button disabled={!selectedRowKeys.length}>批量移动至</Button>
							</KnowledgeBatchMovePopover>
						}
						onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
						onSearchChange={handleSearchChange}
						onOpenBatchMode={() => setBatchMode(true)}
						onToggleSelectAllCurrentPage={handleToggleSelectAllCurrentPage}
						onBatchDelete={handleBatchDelete}
						onCloseBatchMode={closeBatchMode}
					/>
					<Flex align="flex-start" gap={10}>
						{!sidebarCollapsed ? (
							<KnowledgeGroupManager
								tenantId={current_user?.tenant_id}
								selectedGroupKey={selectedGroupKey}
								onSelectGroup={handleSelectGroup}
								onCurrentGroupTitleChange={setCurrentGroupTitle}
								onGroupDataChange={handleGroupDataChange}
							/>
						) : null}
						<KnowledgeTableSection
						  isLoading={isLoading}
							currentGroupTitle={currentGroupTitle}
							dataSource={knowledgeRecords}
							selectedRowKeys={selectedRowKeys}
							total={knowledgeList?.total ?? 0}
							currentPage={pagination.current}
							pageSize={pagination.pageSize}
							onSelectionChange={setSelectedRowKeys}
							onEdit={openEditModal}
							onDelete={handleDelete}
							onPageChange={(page, pageSize) => {
								setPagination({ current: page, pageSize });
							}}
						/>
					</Flex>
				</Flex>
			</Flex>
			{selectRow?.knowledge_id && <KnowledgeEditorModal
				editorOpen={editorOpen}
				record={selectRow}
				onCancel={closeEditor}
				onSubmit={handleSubmit}
			/>}
		</PageContainer>
	);
};

export default KnowledgeListPage;
