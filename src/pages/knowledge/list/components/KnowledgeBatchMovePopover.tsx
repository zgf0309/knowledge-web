import {
	CaretDownFilled,
	FolderOpenFilled,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Flex, Input, Popover, Space, Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import type { Key, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { KnowledgeGroup } from '../types';
import { collectGroupKeys, filterGroupTree } from '../utils';

interface KnowledgeBatchMovePopoverProps {
	open: boolean;
	disabled: boolean;
	groups: KnowledgeGroup[];
	groupCountMap: Map<string, number>;
	onOpenChange: (open: boolean) => void;
	onConfirm: (targetGroupKey: string) => void;
	onCreateChildGroup: (parentKey: string, title: string) => void;
	children: ReactNode;
}

const KnowledgeBatchMovePopover = ({
	open,
	disabled,
	groups,
	groupCountMap,
	onOpenChange,
	onConfirm,
	onCreateChildGroup,
	children,
}: KnowledgeBatchMovePopoverProps) => {
	const [keyword, setKeyword] = useState('');
	const [selectedGroupKey, setSelectedGroupKey] = useState<string>();
	const [hoveredGroupKey, setHoveredGroupKey] = useState<string>();
	const [pendingChildParentKey, setPendingChildParentKey] = useState<string>();
	const [pendingChildTitle, setPendingChildTitle] = useState('');
	const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => collectGroupKeys(groups));

	useEffect(() => {
		if (!open) {
			setKeyword('');
			setSelectedGroupKey(undefined);
			setHoveredGroupKey(undefined);
			setPendingChildParentKey(undefined);
			setPendingChildTitle('');
			setExpandedKeys(collectGroupKeys(groups));
		}
	}, [groups, open]);

	useEffect(() => {
		if (open) {
			setExpandedKeys((currentKeys) => Array.from(new Set([...currentKeys, ...collectGroupKeys(groups)])));
		}
	}, [groups, open]);

	const filteredGroups = useMemo(() => filterGroupTree(groups, keyword), [groups, keyword]);

	const clearPendingChild = () => {
		setPendingChildParentKey(undefined);
		setPendingChildTitle('');
	};

	const handleAddChild = (parentKey: string) => {
		setPendingChildParentKey(parentKey);
		setPendingChildTitle('');
		setExpandedKeys((currentKeys) =>
			currentKeys.includes(parentKey) ? currentKeys : [...currentKeys, parentKey],
		);
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

		onCreateChildGroup(pendingChildParentKey, nextTitle);
		clearPendingChild();
	};

	const treeData = useMemo<TreeDataNode[]>(() => {
		const convert = (items: KnowledgeGroup[], level = 0): TreeDataNode[] =>
			items.map((group) => ({
				key: group.key,
				selectable: group.key !== 'all',
				title: (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						onMouseEnter={() => setHoveredGroupKey(group.key)}
						onMouseLeave={() => setHoveredGroupKey(undefined)}
						className={
							selectedGroupKey === group.key
								? 'knowledge-base-list__move-tree-node knowledge-base-list__move-tree-node--selected'
								: 'knowledge-base-list__move-tree-node'
						}
					>
						<Flex align="center" gap={8} className="knowledge-base-list__tree-main">
							<FolderOpenFilled className="knowledge-base-list__tree-icon" />
							<span
								className={
									level === 0
										? 'knowledge-base-list__tree-title knowledge-base-list__tree-title--root'
										: 'knowledge-base-list__tree-title'
								}
							>
								{group.title}
							</span>
						</Flex>
						<Flex align="center" gap={4} className="knowledge-base-list__tree-side">
							<Button
								type="text"
								icon={<PlusOutlined />}
								className={
									hoveredGroupKey === group.key
										? 'knowledge-base-list__tree-action-button knowledge-base-list__move-add-button knowledge-base-list__move-add-button--visible'
										: 'knowledge-base-list__tree-action-button knowledge-base-list__move-add-button'
								}
								onClick={(event) => {
									event.stopPropagation();
									handleAddChild(group.key);
								}}
							/>
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
							key: `${group.key}-popover-pending-child`,
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
										onChange={(event) => setPendingChildTitle(event.target.value)}
										onBlur={handleCommitPendingChild}
										onPressEnter={handleCommitPendingChild}
										onKeyDown={(event) => {
											if (event.key === 'Escape') {
												clearPendingChild();
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

		return convert(filteredGroups);
	}, [filteredGroups, groupCountMap, hoveredGroupKey, pendingChildParentKey, pendingChildTitle, selectedGroupKey]);

	const content = (
		<Flex vertical className="knowledge-base-list__move-popover-content">
				<Input.Search
					allowClear
					autoFocus
					placeholder="请输入群组名称搜索"
					className="knowledge-base-list__move-inline-search"
					value={keyword}
					onChange={(event) => setKeyword(event.target.value)}
				/>
			<div className="knowledge-base-list__move-popover-tree">
				<Tree
					blockNode
					switcherIcon={<CaretDownFilled className="knowledge-base-list__tree-switcher-icon" />}
					expandedKeys={expandedKeys}
					selectedKeys={selectedGroupKey ? [selectedGroupKey] : []}
					treeData={treeData}
					onExpand={(keys) => setExpandedKeys(keys)}
					onSelect={(keys) => {
						const nextKey = String(keys[0] ?? '');
						setSelectedGroupKey(nextKey || undefined);
					}}
				/>
			</div>
			<Flex justify="flex-end" gap={8} className="knowledge-base-list__move-popover-footer">
				<Space>
					<Button size="small" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button
						type="primary"
						size="small"
						disabled={!selectedGroupKey}
						onClick={() => {
							if (selectedGroupKey) {
								onConfirm(selectedGroupKey);
							}
						}}
					>
						确定
					</Button>
				</Space>
			</Flex>
		</Flex>
	);

	return (
		<Popover
			trigger="click"
			placement="bottomLeft"
			open={open}
			onOpenChange={(nextOpen) => {
				if (!disabled) {
					onOpenChange(nextOpen);
				}
			}}
			overlayClassName="knowledge-base-list__move-popover"
			content={content}
		>
			<span>
				{children}
			</span>
		</Popover>
	);
};

export default KnowledgeBatchMovePopover;