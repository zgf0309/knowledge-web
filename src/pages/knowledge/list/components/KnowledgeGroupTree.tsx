import {
	CaretDownFilled,
	EllipsisOutlined,
	FolderOpenFilled,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Flex, Input, Tree } from 'antd';
import type { Key } from 'react';
import { useMemo } from 'react';
import type { TreeDataNode } from 'antd';
import type { KnowledgeGroup } from '../types';

interface KnowledgeGroupTreeProps {
	groups: KnowledgeGroup[];
	selectedGroupKey: string;
	expandedKeys: Key[];
	groupCountMap: Map<string, number>;
	hoveredGroupKey?: string;
	openedMenuGroupKey?: string;
	pendingChildParentKey?: string;
	pendingChildTitle: string;
	editingGroupKey?: string;
	editingGroupTitle: string;
	onExpandedKeysChange: (keys: Key[]) => void;
	onSelectGroup: (groupKey: string) => void;
	onHoveredGroupKeyChange: (groupKey?: string) => void;
	onOpenedMenuGroupKeyChange: (groupKey?: string) => void;
	onPendingChildTitleChange: (title: string) => void;
	onEditingGroupTitleChange: (title: string) => void;
	onCommitPendingChild: () => void;
	onClearPendingChild: () => void;
	onAddChild: (parentKey: string) => void;
	onCommitEditingGroup: () => void;
	onClearEditingGroup: () => void;
	onStartEditGroup: (group: KnowledgeGroup) => void;
	onCopyGroupPath: (groupKey: string) => void;
	onDeleteGroup: (group: KnowledgeGroup) => void;
}

const KnowledgeGroupTree = ({
	groups,
	selectedGroupKey,
	expandedKeys,
	groupCountMap,
	hoveredGroupKey,
	openedMenuGroupKey,
	pendingChildParentKey,
	pendingChildTitle,
	editingGroupKey,
	editingGroupTitle,
	onExpandedKeysChange,
	onSelectGroup,
	onHoveredGroupKeyChange,
	onOpenedMenuGroupKeyChange,
	onPendingChildTitleChange,
	onEditingGroupTitleChange,
	onCommitPendingChild,
	onClearPendingChild,
	onAddChild,
	onCommitEditingGroup,
	onClearEditingGroup,
	onStartEditGroup,
	onCopyGroupPath,
	onDeleteGroup,
}: KnowledgeGroupTreeProps) => {
	const treeData = useMemo<TreeDataNode[]>(() => {
		const convert = (items: KnowledgeGroup[], level = 0): TreeDataNode[] =>
			items.map((group) => ({
				key: group.key,
				title: (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						onMouseEnter={() => onHoveredGroupKeyChange(group.key)}
						onMouseLeave={() => onHoveredGroupKeyChange(undefined)}
						className={
							selectedGroupKey === group.key
								? 'knowledge-base-list__tree-node knowledge-base-list__tree-node--selected'
								: 'knowledge-base-list__tree-node'
						}
					>
						<Flex align="center" gap={8} className="knowledge-base-list__tree-main">
							<FolderOpenFilled className="knowledge-base-list__tree-icon" />
							{editingGroupKey === group.key ? (
								<Input
									autoFocus
									size="small"
									value={editingGroupTitle}
									className="knowledge-base-list__tree-input"
									onChange={(event) => onEditingGroupTitleChange(event.target.value)}
									onBlur={onCommitEditingGroup}
									onPressEnter={onCommitEditingGroup}
									onKeyDown={(event) => {
										if (event.key === 'Escape') {
											onClearEditingGroup();
										}
									}}
									onClick={(event) => event.stopPropagation()}
								/>
							) : (
								<span
									className={
										level === 0
											? 'knowledge-base-list__tree-title knowledge-base-list__tree-title--root'
											: 'knowledge-base-list__tree-title'
									}
								>
									{group.title}
								</span>
							)}
						</Flex>
						<Flex align="center" gap={4} className="knowledge-base-list__tree-side">
							<Flex
								align="center"
								gap={2}
								className={
									hoveredGroupKey === group.key || openedMenuGroupKey === group.key
										? 'knowledge-base-list__tree-actions knowledge-base-list__tree-actions--visible'
										: 'knowledge-base-list__tree-actions'
								}
							>
								<Button
									type="text"
									icon={<PlusOutlined />}
									className="knowledge-base-list__tree-action-button"
									onClick={(event) => {
										event.stopPropagation();
										onAddChild(group.key);
									}}
								/>
								<Dropdown
									trigger={['click']}
									placement="bottomLeft"
									overlayClassName="knowledge-base-list__tree-dropdown"
									onOpenChange={(open) => {
										onOpenedMenuGroupKeyChange(open ? group.key : undefined);
									}}
									menu={{
										items: [
											{ key: 'edit', label: '编辑' },
											{ key: 'copy-path', label: '复制路径' },
											{ key: 'delete', label: '删除', danger: group.key !== 'all' },
										],
										onClick: ({ key, domEvent }) => {
											domEvent.stopPropagation();
											if (key === 'edit') {
												onStartEditGroup(group);
												return;
											}
											if (key === 'copy-path') {
												onCopyGroupPath(group.key);
												return;
											}
											if (key === 'delete') {
												onDeleteGroup(group);
											}
										},
									}}
								>
									<Button
										type="text"
										icon={<EllipsisOutlined />}
										className="knowledge-base-list__tree-action-button"
										onClick={(event) => event.stopPropagation()}
									/>
								</Dropdown>
							</Flex>
							<span
								className={
									selectedGroupKey === group.key
										? 'knowledge-base-list__tree-count knowledge-base-list__tree-count--selected'
										: 'knowledge-base-list__tree-count'
								}
							>
								{groupCountMap.get(group.key) ?? 0}
							</span>
						</Flex>
					</Flex>
				),
				children: (() => {
					const children = group.children ? convert(group.children, level + 1) : [];

					if (pendingChildParentKey === group.key) {
						children.push({
							key: `${group.key}-pending-child`,
							selectable: false,
							title: (
								<Flex align="center" gap={8} className="knowledge-base-list__tree-input-row">
									<FolderOpenFilled className="knowledge-base-list__tree-icon" />
									<Input
										autoFocus
										size="small"
										placeholder="请输入"
										value={pendingChildTitle}
										className="knowledge-base-list__tree-input"
										onChange={(event) => onPendingChildTitleChange(event.target.value)}
										onBlur={onCommitPendingChild}
										onPressEnter={onCommitPendingChild}
										onKeyDown={(event) => {
											if (event.key === 'Escape') {
												onClearPendingChild();
											}
										}}
										onClick={(event) => event.stopPropagation()}
									/>
								</Flex>
							),
						});
					}

					return children;
				})(),
			}));

		return convert(groups);
	}, [
		editingGroupKey,
		editingGroupTitle,
		groupCountMap,
		groups,
		hoveredGroupKey,
		onAddChild,
		onClearEditingGroup,
		onClearPendingChild,
		onCommitEditingGroup,
		onCommitPendingChild,
		onCopyGroupPath,
		onDeleteGroup,
		onEditingGroupTitleChange,
		onHoveredGroupKeyChange,
		onOpenedMenuGroupKeyChange,
		onPendingChildTitleChange,
		onStartEditGroup,
		openedMenuGroupKey,
		pendingChildParentKey,
		pendingChildTitle,
		selectedGroupKey,
	]);

	return (
		<div className="knowledge-base-list__sidebar">
			<Flex align="center" justify="space-between" className="knowledge-base-list__sidebar-title-row">
				<div className="knowledge-base-list__sidebar-title">知识库群组</div>
				<Button
					type="text"
					className="knowledge-base-list__sidebar-title-action"
					icon={<SearchOutlined />}
				/>
			</Flex>
			<Tree
				blockNode
				switcherIcon={<CaretDownFilled className="knowledge-base-list__tree-switcher-icon" />}
				expandedKeys={expandedKeys}
				selectedKeys={[selectedGroupKey]}
				treeData={treeData}
				onExpand={onExpandedKeysChange}
				onSelect={(keys) => {
					onSelectGroup(String(keys[0] ?? 'all'));
				}}
			/>
		</div>
	);
};

export default KnowledgeGroupTree;
