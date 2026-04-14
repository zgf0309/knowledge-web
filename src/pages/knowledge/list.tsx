import { AimOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Divider, Flex, Modal, message } from 'antd';
import type { Key } from 'react';
import { useDeferredValue, useMemo, useState } from 'react';
import KnowledgeBatchMovePopover from './list/components/KnowledgeBatchMovePopover';
import KnowledgeEditorModal from './list/components/KnowledgeEditorModal';
import KnowledgeGroupTree from './list/components/KnowledgeGroupTree';
import KnowledgeListToolbar from './list/components/KnowledgeListToolbar';
import KnowledgeTableSection from './list/components/KnowledgeTableSection';
import {
	INITIAL_BATCH_MOVE_STATE,
	DEFAULT_GROUPS,
	INITIAL_EDITOR_STATE,
	INITIAL_PAGE_STATE,
	INITIAL_RECORDS,
} from './list/constants';
import type {
	KnowledgeBaseRecord,
	KnowledgeBatchMoveState,
	KnowledgeEditorState,
	KnowledgeFormValues,
} from './list/types';
import {
	appendChildGroup,
	buildGroupOptions,
	collectBranchKeys,
	collectGroupKeys,
	createKnowledgeRecord,
	filterGroups,
	filterRecords,
	findGroupPathTitles,
	getGroupCounts,
	getGroupTitleMap,
	moveKnowledgeRecords,
	paginateRecords,
	removeGroupByKey,
	updateGroupTitle,
	updateKnowledgeRecord,
} from './list/utils';
import './list.less';

const KnowledgeListPage = () => {
	const [messageApi, messageContextHolder] = message.useMessage();
	const [modal, modalContextHolder] = Modal.useModal();
	const [groups, setGroups] = useState(DEFAULT_GROUPS);
	const [records, setRecords] = useState(INITIAL_RECORDS);
	const [selectedGroupKey, setSelectedGroupKey] = useState('all');
	const groupKeyword = '';
	const [searchKeyword, setSearchKeyword] = useState('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [batchMode, setBatchMode] = useState(false);
	const [pageState, setPageState] = useState(INITIAL_PAGE_STATE);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => collectGroupKeys(DEFAULT_GROUPS));
	const [hoveredGroupKey, setHoveredGroupKey] = useState<string>();
	const [openedMenuGroupKey, setOpenedMenuGroupKey] = useState<string>();
	const [pendingChildParentKey, setPendingChildParentKey] = useState<string>();
	const [pendingChildTitle, setPendingChildTitle] = useState('');
	const [editingGroupKey, setEditingGroupKey] = useState<string>();
	const [editingGroupTitle, setEditingGroupTitle] = useState('');
	const [editorState, setEditorState] = useState<KnowledgeEditorState>(INITIAL_EDITOR_STATE);
	const [batchMoveState, setBatchMoveState] = useState<KnowledgeBatchMoveState>(INITIAL_BATCH_MOVE_STATE);

	const deferredSearchKeyword = useDeferredValue(searchKeyword);
	const groupTitleMap = useMemo(() => getGroupTitleMap(groups), [groups]);
	const groupCountMap = useMemo(() => getGroupCounts(groups, records), [groups, records]);
	const filteredGroups = useMemo(() => filterGroups(groups, groupKeyword), [groupKeyword, groups]);
	const groupOptions = useMemo(() => buildGroupOptions(groups), [groups]);
	const currentGroupTitle = groupTitleMap.get(selectedGroupKey) ?? '全部群组';
	const editingRecord = useMemo(
		() => records.find((record) => record.key === editorState.recordKey),
		[editorState.recordKey, records],
	);

	const filteredRecords = useMemo(
		() => filterRecords(records, selectedGroupKey, deferredSearchKeyword),
		[deferredSearchKeyword, records, selectedGroupKey],
	);
	const { currentPage, pagedRecords } = useMemo(
		() => paginateRecords(filteredRecords, pageState.current, pageState.pageSize),
		[filteredRecords, pageState.current, pageState.pageSize],
	);
	const currentPageKeys = useMemo(() => pagedRecords.map((record) => record.key), [pagedRecords]);
	const allCurrentPageSelected =
		currentPageKeys.length > 0 && currentPageKeys.every((key) => selectedRowKeys.includes(key));
	const partialCurrentPageSelected =
		currentPageKeys.some((key) => selectedRowKeys.includes(key)) && !allCurrentPageSelected;

	const resetToFirstPage = () => {
		setPageState((current) => ({ ...current, current: 1 }));
	};

	const clearPendingChild = () => {
		setPendingChildParentKey(undefined);
		setPendingChildTitle('');
	};

	const clearEditingGroup = () => {
		setEditingGroupKey(undefined);
		setEditingGroupTitle('');
	};

	const closeEditor = () => {
		setEditorState(INITIAL_EDITOR_STATE);
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

	const handleCommitPendingChild = () => {
		if (!pendingChildParentKey) {
			return;
		}

		const nextTitle = pendingChildTitle.trim();
		if (!nextTitle) {
			clearPendingChild();
			return;
		}

		setGroups((currentGroups) =>
			appendChildGroup(currentGroups, pendingChildParentKey, {
				key: `group-${Date.now()}`,
				title: nextTitle,
			}),
		);
		setExpandedKeys((currentKeys) =>
			currentKeys.includes(pendingChildParentKey)
				? currentKeys
				: [...currentKeys, pendingChildParentKey],
		);
		clearPendingChild();
	};

	const createChildGroup = (parentKey: string, title: string) => {
		setGroups((currentGroups) =>
			appendChildGroup(currentGroups, parentKey, {
				key: `group-${Date.now()}`,
				title,
			}),
		);
		setExpandedKeys((currentKeys) =>
			currentKeys.includes(parentKey) ? currentKeys : [...currentKeys, parentKey],
		);
	};

	const handleAddChild = (parentKey: string) => {
		clearEditingGroup();
		setPendingChildParentKey(parentKey);
		setPendingChildTitle('');
		setExpandedKeys((currentKeys) =>
			currentKeys.includes(parentKey) ? currentKeys : [...currentKeys, parentKey],
		);
	};

	const handleCommitEditingGroup = () => {
		if (!editingGroupKey) {
			return;
		}

		const nextTitle = editingGroupTitle.trim();
		if (!nextTitle) {
			clearEditingGroup();
			return;
		}

		setGroups((currentGroups) => updateGroupTitle(currentGroups, editingGroupKey, nextTitle));
		clearEditingGroup();
	};

	const handleStartEditGroup = (groupKey: string, title: string) => {
		clearPendingChild();
		setEditingGroupKey(groupKey);
		setEditingGroupTitle(title);
	};

	const handleCopyGroupPath = async (groupKey: string) => {
		const pathTitles = findGroupPathTitles(groups, groupKey);
		if (!pathTitles?.length) {
			messageApi.error('未找到当前节点路径');
			return;
		}

		try {
			await navigator.clipboard.writeText(pathTitles.join('/'));
			messageApi.success('路径已复制');
		} catch {
			messageApi.error('复制失败，请手动复制');
		}
	};

	const handleDeleteGroup = (groupKey: string, title: string) => {
		if (groupKey === 'all') {
			messageApi.warning('默认根节点不支持删除');
			return;
		}

		const branchKeys = collectBranchKeys(groups, groupKey);
		if (!branchKeys.length) {
			return;
		}

		modal.confirm({
			title: `确认删除“${title}”吗？`,
			content: '删除后，该节点及其下级节点会一并移除。',
			okText: '确认删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: () => {
				setGroups((currentGroups) => removeGroupByKey(currentGroups, groupKey));
				setExpandedKeys((currentKeys) =>
					currentKeys.filter((key) => !branchKeys.includes(String(key))),
				);
				setRecords((currentRecords) =>
					currentRecords.filter((record) => !branchKeys.includes(record.groupKey)),
				);
				if (branchKeys.includes(selectedGroupKey)) {
					setSelectedGroupKey('all');
				}
				if (pendingChildParentKey && branchKeys.includes(pendingChildParentKey)) {
					clearPendingChild();
				}
				if (editingGroupKey && branchKeys.includes(editingGroupKey)) {
					clearEditingGroup();
				}
				messageApi.success('节点已删除');
			},
		});
	};

	const openCreateModal = () => {
		setEditorState({ open: true, mode: 'create' });
	};

	const openEditModal = (record: KnowledgeBaseRecord) => {
		setEditorState({ open: true, mode: 'edit', recordKey: record.key });
	};

	const removeRecords = (keys: string[]) => {
		setRecords((currentRecords) => currentRecords.filter((record) => !keys.includes(record.key)));
		setSelectedRowKeys((currentKeys) => currentKeys.filter((key) => !keys.includes(String(key))));
		resetToFirstPage();
	};

	const handleDelete = (keys: string[]) => {
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
			onOk: () => {
				removeRecords(keys);
				messageApi.success('删除成功');
			},
		});
	};

	const handleBatchDelete = () => {
		handleDelete(selectedRowKeys.map(String));
	};

	const handleConfirmBatchMove = (targetGroupKey: string) => {
		const keys = selectedRowKeys.map(String);
		if (!keys.length) {
			messageApi.warning('请先选择要移动的知识库');
			return;
		}

		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		setRecords((currentRecords) => moveKnowledgeRecords(currentRecords, keys, targetGroupKey, now));
		setSelectedRowKeys([]);
		closeBatchMoveModal();
		messageApi.success('知识库群组已更新');
	};

	const handleToggleSelectAllCurrentPage = (checked: boolean) => {
		if (checked) {
			setSelectedRowKeys((currentKeys) => Array.from(new Set([...currentKeys, ...currentPageKeys])));
			return;
		}

		setSelectedRowKeys((currentKeys) =>
			currentKeys.filter((key) => !currentPageKeys.includes(String(key))),
		);
	};

	const handleSubmit = async (values: KnowledgeFormValues) => {
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

		if (editorState.mode === 'create') {
			setRecords((currentRecords) => [createKnowledgeRecord(values, now), ...currentRecords]);
			messageApi.success('知识库已创建');
		} else {
			setRecords((currentRecords) =>
				currentRecords.map((record) =>
					record.key === editorState.recordKey ? updateKnowledgeRecord(record, values, now) : record,
				),
			);
			messageApi.success('知识库已更新');
		}

		closeEditor();
	};

	return (
		<PageContainer title={false} breadcrumb={false} className="knowledge-base-list-page">
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
								groupCountMap={groupCountMap}
								onOpenChange={handleBatchMovePopoverOpenChange}
								onConfirm={handleConfirmBatchMove}
								onCreateChildGroup={createChildGroup}
							>
								<Button disabled={!selectedRowKeys.length}>批量移动至</Button>
							</KnowledgeBatchMovePopover>
						}
						onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
						onSearchChange={handleSearchChange}
						onOpenBatchMode={() => setBatchMode(true)}
						onOpenCreateModal={openCreateModal}
						onToggleSelectAllCurrentPage={handleToggleSelectAllCurrentPage}
						onBatchDelete={handleBatchDelete}
						onCloseBatchMode={closeBatchMode}
					/>
					<Flex align="flex-start" gap={10}>
						{!sidebarCollapsed ? (
							<KnowledgeGroupTree
								groups={filteredGroups}
								selectedGroupKey={selectedGroupKey}
								expandedKeys={expandedKeys}
								groupCountMap={groupCountMap}
								hoveredGroupKey={hoveredGroupKey}
								openedMenuGroupKey={openedMenuGroupKey}
								pendingChildParentKey={pendingChildParentKey}
								pendingChildTitle={pendingChildTitle}
								editingGroupKey={editingGroupKey}
								editingGroupTitle={editingGroupTitle}
								onExpandedKeysChange={setExpandedKeys}
								onSelectGroup={handleSelectGroup}
								onHoveredGroupKeyChange={setHoveredGroupKey}
								onOpenedMenuGroupKeyChange={setOpenedMenuGroupKey}
								onPendingChildTitleChange={setPendingChildTitle}
								onEditingGroupTitleChange={setEditingGroupTitle}
								onCommitPendingChild={handleCommitPendingChild}
								onClearPendingChild={clearPendingChild}
								onAddChild={handleAddChild}
								onCommitEditingGroup={handleCommitEditingGroup}
								onClearEditingGroup={clearEditingGroup}
								onStartEditGroup={(group) => handleStartEditGroup(group.key, group.title)}
								onCopyGroupPath={(groupKey) => {
									void handleCopyGroupPath(groupKey);
								}}
								onDeleteGroup={(group) => handleDeleteGroup(group.key, group.title)}
							/>
						) : null}
						<KnowledgeTableSection
							currentGroupTitle={currentGroupTitle}
							dataSource={pagedRecords}
							selectedRowKeys={selectedRowKeys}
							total={filteredRecords.length}
							currentPage={currentPage}
							pageSize={pageState.pageSize}
							onSelectionChange={setSelectedRowKeys}
							onEdit={openEditModal}
							onDelete={handleDelete}
							onPageChange={(page, pageSize) => {
								setPageState({ current: page, pageSize });
							}}
						/>
					</Flex>
				</Flex>
			</Flex>
			<KnowledgeEditorModal
				editorState={editorState}
				record={editingRecord}
				groupOptions={groupOptions}
				defaultGroupKey={selectedGroupKey === 'all' ? groupOptions[0]?.value : selectedGroupKey}
				onCancel={closeEditor}
				onSubmit={handleSubmit}
			/>
		</PageContainer>
	);
};

export default KnowledgeListPage;
