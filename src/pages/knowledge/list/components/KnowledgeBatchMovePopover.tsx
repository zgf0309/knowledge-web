import {
	CaretDownFilled,
	FolderOpenFilled,
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
	onOpenChange: (open: boolean) => void;
	onConfirm: (targetGroupKey: string) => void;
	children: ReactNode;
}

const KnowledgeBatchMovePopover = ({
	open,
	disabled,
	groups,
	onOpenChange,
	onConfirm,
	children,
}: KnowledgeBatchMovePopoverProps) => {
	const [keyword, setKeyword] = useState('');
	const [selectedGroupKey, setSelectedGroupKey] = useState<string>();
	const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => collectGroupKeys(groups));

	useEffect(() => {
		if (!open) {
			setKeyword('');
			setSelectedGroupKey(undefined);
			setExpandedKeys(collectGroupKeys(groups));
		}
	}, [groups, open]);

	useEffect(() => {
		if (open) {
			setExpandedKeys((currentKeys) => Array.from(new Set([...currentKeys, ...collectGroupKeys(groups)])));
		}
	}, [groups, open]);

	const filteredGroups = useMemo(() => filterGroupTree(groups, keyword), [groups, keyword]);

	const treeData = useMemo<TreeDataNode[]>(() => {
		const convert = (items: KnowledgeGroup[], level = 0): TreeDataNode[] =>
			items.map((group) => ({
				key: String(group.group_id ?? ''),
				selectable: group.group_id !== 'all',
				title: (
					<Flex
						align="center"
						justify="space-between"
						gap={15}
					>
						<Flex align="center" gap={8}>
							<FolderOpenFilled style={{color: '#faad14'}} />
							<span>
								{group.name}
							</span>
						</Flex>
						<Flex align="center" gap={4} className="knowledge-base-list__tree-side">
							<span>
								{group.kb_count ?? 0}
							</span>
						</Flex>
					</Flex>
				),
				children: group.children ? convert(group.children, level + 1) : undefined,
			}));

		return convert(filteredGroups);
	}, [filteredGroups, selectedGroupKey]);

	const content = (
		<Flex vertical gap={10}>
			<Input
				allowClear
				autoFocus
				placeholder="请输入群组名称搜索"
				value={keyword}
				onChange={(event) => setKeyword(event.target.value)}
			/>
			<Flex>
				<Tree
					blockNode
					switcherIcon={<CaretDownFilled color='red' />}
					expandedKeys={expandedKeys}
					selectedKeys={selectedGroupKey ? [selectedGroupKey] : []}
					treeData={treeData}
					onExpand={(keys) => setExpandedKeys(keys)}
					onSelect={(keys) => {
						const nextKey = String(keys[0] ?? '');
						setSelectedGroupKey(nextKey || undefined);
					}}
				/>
			</Flex>
			<Flex justify="flex-end" gap={8}>
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