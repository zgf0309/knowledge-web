import { Form, Modal, message } from 'antd';
import type { Key } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	addKnowledgeTree,
	delKnowledgeTree,
	queryKnowledgeGroup,
	updateKnowledgeTree,
} from '@/services/knowledge/api';
import type { KnowledgeGroup } from '../types';
import {
	buildGroupTree,
	collectGroupKeys,
	ensureRootGroup,
	findGroupPathTitles,
	getGroupTitleMap,
} from '../utils';
import KnowledgeGroupFormModal, { type GroupFormValues } from './KnowledgeGroupFormModal';
import KnowledgeGroupTree from './KnowledgeGroupTree';

type GroupModalMode = 'add' | 'edit';

interface KnowledgeGroupManagerProps {
	tenantId?: string;
	selectedGroupKey: string;
	onSelectGroup: (groupKey: string) => void;
	onCurrentGroupTitleChange: (title: string) => void;
	onGroupDataChange: (payload: { groups: KnowledgeGroup[] }) => void;
}

const KnowledgeGroupManager = ({
	tenantId,
	selectedGroupKey,
	onSelectGroup,
	onCurrentGroupTitleChange,
	onGroupDataChange,
}: KnowledgeGroupManagerProps) => {
	const emptyGroups = useMemo<KnowledgeGroup[]>(() => [], []);
	const [messageApi, messageContextHolder] = message.useMessage();
	const [modal, modalContextHolder] = Modal.useModal();
	const [groupKeyword, setGroupKeyword] = useState('');
	const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
	const [groupModalMode, setGroupModalMode] = useState<GroupModalMode>('add');
	const [groupModalOpen, setGroupModalOpen] = useState(false);
	const [groupModalTitle, setGroupModalTitle] = useState('');
	const [currentGroup, setCurrentGroup] = useState<KnowledgeGroup | null>(null);
	const [groupSubmitting, setGroupSubmitting] = useState(false);
	const [groupForm] = Form.useForm<GroupFormValues>();

	const { data, isLoading, refetch: refetchKnowledgeGroup } = useQuery({
		queryKey: ['KnowledgeTree', groupKeyword, tenantId],
		queryFn: () =>
			queryKnowledgeGroup({
				name: groupKeyword,
				tenant_id: tenantId,
			}),
		select: (s: any) => s.data,
	});

	const knowledgeGroup = useMemo<KnowledgeGroup[]>(() => {
		return ensureRootGroup(buildGroupTree((data?.list as KnowledgeGroup[] | undefined) ?? emptyGroups));
	}, [data?.list, emptyGroups]);

	useEffect(() => {
		setExpandedKeys(collectGroupKeys(knowledgeGroup));
	}, [knowledgeGroup]);

	const groupTitleMap = useMemo(() => getGroupTitleMap(knowledgeGroup), [knowledgeGroup]);

	useEffect(() => {
		onCurrentGroupTitleChange(groupTitleMap.get(selectedGroupKey) ?? '全部群组');
	}, [groupTitleMap, onCurrentGroupTitleChange, selectedGroupKey]);

	useEffect(() => {
		onGroupDataChange({ groups: knowledgeGroup });
	}, [knowledgeGroup, onGroupDataChange]);

	const closeGroupModal = useCallback(() => {
		setGroupModalOpen(false);
		setGroupModalTitle('');
		setCurrentGroup(null);
		groupForm.resetFields();
	}, [groupForm]);

	const findGroupById = useCallback((items: KnowledgeGroup[], groupId: string): KnowledgeGroup | undefined => {
		for (const group of items) {
			if (group.group_id === groupId) {
				return group;
			}
			if (group.children?.length) {
				const matchedGroup = findGroupById(group.children, groupId);
				if (matchedGroup) {
					return matchedGroup;
				}
			}
		}

		return undefined;
	}, []);

	const handleAddChild = useCallback((parentKey: string) => {
		const parentTitle = groupTitleMap.get(parentKey) ?? parentKey;
		setGroupModalMode('add');
		setGroupModalTitle(`新增子群组（父级：${parentTitle}）`);
		setCurrentGroup(findGroupById(knowledgeGroup, parentKey) ?? null);
		groupForm.setFieldsValue({
			name: '',
			description: '',
			parent_id: parentKey,
		});
		setGroupModalOpen(true);
		setExpandedKeys((currentKeys) =>
			currentKeys.includes(parentKey) ? currentKeys : [...currentKeys, parentKey],
		);
	}, [findGroupById, groupForm, groupTitleMap, knowledgeGroup]);

	const handleStartEditGroup = useCallback((group: KnowledgeGroup) => {
		if (group.group_id === 'all') {
			messageApi.warning('默认根节点不支持编辑');
			return;
		}

		setGroupModalMode('edit');
		setGroupModalTitle(`编辑群组：${group.name}`);
		setCurrentGroup(group);
		groupForm.setFieldsValue({
			name: group.name,
			description: group.description,
			parent_id: String(group.parent_id ?? ''),
		});
		setGroupModalOpen(true);
	}, [groupForm, messageApi]);

	const handleSubmitGroup = useCallback(async () => {
		const values = await groupForm.validateFields();
		setGroupSubmitting(true);

		const payload = {
			name: values.name.trim(),
			description: values.description?.trim(),
      tenant_id: tenantId,
		};

		const request =
			groupModalMode === 'add'
				? addKnowledgeTree({
					...payload,
					parent_id: values.parent_id === 'all' ? '' : values.parent_id,
				})
				: updateKnowledgeTree({
					group_id: String(currentGroup?.group_id ?? ''),
					...payload,
				});

		await request
			.then((res: any) => {
				if (res?.code === 200) {
					messageApi.success(groupModalMode === 'add' ? '节点已添加' : '节点已更新');
					closeGroupModal();
					refetchKnowledgeGroup();
				} else {
					messageApi.error(groupModalMode === 'add' ? '添加失败' : '更新失败');
				}
			})
			.catch(() => {
				messageApi.error(groupModalMode === 'add' ? '添加失败' : '更新失败');
			})
			.finally(() => {
				setGroupSubmitting(false);
			});
	}, [closeGroupModal, currentGroup?.group_id, groupForm, groupModalMode, messageApi, refetchKnowledgeGroup]);

	const handleDeleteGroup = useCallback((group: KnowledgeGroup) => {
		const groupId = String(group.group_id ?? '');
		if (groupId === 'all') {
			messageApi.warning('默认根节点不支持删除');
			return;
		}
		if (!groupId) {
			return;
		}
		modal.confirm({
			title: `确认删除“${group.name}”吗？`,
			content: '删除后，该节点及其下级节点会一并移除。',
			okText: '确认删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: async () => {
				await delKnowledgeTree({ group_id: groupId })
					.then((res: any) => {
						if (res?.code === 200) {
							messageApi.success('节点已删除');
							if (groupId === selectedGroupKey) {
								onSelectGroup('all');
							}
							refetchKnowledgeGroup();
						} else {
							messageApi.error('删除失败');
						}
					})
					.catch(() => {
						messageApi.error('删除失败');
					});
			},
		});
		}, [messageApi, modal, onSelectGroup, refetchKnowledgeGroup, selectedGroupKey]);

		const handleCopyGroupPath = useCallback(async (groupKey: string) => {
		const pathTitles = findGroupPathTitles(knowledgeGroup, groupKey);
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
	}, [knowledgeGroup, messageApi]);

	return (
		<>
			{messageContextHolder}
			{modalContextHolder}
      <KnowledgeGroupTree
        isLoading={isLoading}
        groups={knowledgeGroup}
        selectedGroupKey={selectedGroupKey}
        expandedKeys={expandedKeys}
        onSearchGroup={setGroupKeyword}
        onExpandedKeysChange={setExpandedKeys}
        onSelectGroup={onSelectGroup}
        onAddChild={handleAddChild}
        onStartEditGroup={handleStartEditGroup}
        onCopyGroupPath={(groupKey) => {
          void handleCopyGroupPath(groupKey);
        }}
        onDeleteGroup={handleDeleteGroup}
      />
			<KnowledgeGroupFormModal
				open={groupModalOpen}
				title={groupModalTitle}
				confirmLoading={groupSubmitting}
				form={groupForm}
				onCancel={closeGroupModal}
				onOk={() => {
					void handleSubmitGroup();
				}}
			/>
		</>
	);
};

export default KnowledgeGroupManager;
