import {
	CaretDownFilled,
	EllipsisOutlined,
	FolderOpenFilled,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Flex, Input, Tree } from 'antd';
import type { Key } from 'react';
import { useMemo, useState } from 'react';
import type { TreeDataNode } from 'antd';
import type { KnowledgeGroup } from '../types';
import Loading from './Loading';

interface KnowledgeGroupTreeProps {
	isLoading?: boolean;
	groups: KnowledgeGroup[];
	selectedGroupKey: string;
	expandedKeys: Key[];
	onSearchGroup: (keyword: string) => void;
	onExpandedKeysChange: (keys: Key[]) => void;
	onSelectGroup: (groupKey: string) => void;
	onAddChild: (parentKey: string) => void;
	onStartEditGroup: (group: KnowledgeGroup) => void;
	onCopyGroupPath: (groupKey: string) => void;
	onDeleteGroup: (group: KnowledgeGroup) => void;
}

const KnowledgeGroupTree = ({
	groups,
	isLoading = false,
	selectedGroupKey,
	expandedKeys,
	onSearchGroup,
	onExpandedKeysChange,
	onSelectGroup,
	onAddChild,
	onStartEditGroup,
	onCopyGroupPath,
	onDeleteGroup,
}: KnowledgeGroupTreeProps) => {
	const [searching, setSearching] = useState(false);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [hoveredGroupKey, setHoveredGroupKey] = useState<string>();
	const [openedMenuGroupKey, setOpenedMenuGroupKey] = useState<string>();

	const submitSearch = (keyword: string, closeSearch = true) => {
		onSearchGroup(keyword.trim());
		if (closeSearch) {
			setSearching(false);
		}
	};

	const treeData = useMemo<TreeDataNode[]>(() => {
		const convert = (items: KnowledgeGroup[], level = 0): TreeDataNode[] =>
			items.map((group) => ({
				key: String(group.group_id ?? ''),
				title: (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						onMouseEnter={() => setHoveredGroupKey(String(group.group_id ?? ''))}
						onMouseLeave={() => setHoveredGroupKey(undefined)}
						className={
							selectedGroupKey === String(group.group_id ?? '')
								? 'knowledge-base-list__tree-node knowledge-base-list__tree-node--selected'
								: 'knowledge-base-list__tree-node'
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
								{group.name}
							</span>
						</Flex>
						<Flex align="center" gap={4} className="knowledge-base-list__tree-side">
							<Flex
								align="center"
								gap={2}
								className={
									hoveredGroupKey === String(group.group_id ?? '') ||
									openedMenuGroupKey === String(group.group_id ?? '')
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
										onAddChild(String(group.group_id ?? ''));
									}}
								/>
								<Dropdown
									trigger={['click']}
									placement="bottomLeft"
									overlayClassName="knowledge-base-list__tree-dropdown"
									onOpenChange={(open) => {
										setOpenedMenuGroupKey(open ? String(group.group_id ?? '') : undefined);
									}}
									menu={{
										items: [
											...(group.group_id === 'all' ? [] : [{ key: 'edit', label: '编辑' }]),
											{ key: 'copy-path', label: '复制路径' },
											...(group.group_id === 'all' ? [] : [{ key: 'delete', label: '删除', danger: true }]),
										],
										onClick: ({ key, domEvent }) => {
											domEvent.stopPropagation();
											if (key === 'edit') {
												onStartEditGroup(group);
												return;
											}
											if (key === 'copy-path') {
												onCopyGroupPath(String(group.group_id ?? ''));
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
									selectedGroupKey === String(group.group_id ?? '')
										? 'knowledge-base-list__tree-count knowledge-base-list__tree-count--selected'
										: 'knowledge-base-list__tree-count'
								}
							>
								{group?.kb_count ?? 0}
							</span>
						</Flex>
					</Flex>
				),
				children: group.children ? convert(group.children, level + 1) : undefined,
			}));

		return convert(groups);
	}, [
		groups,
		hoveredGroupKey,
		onAddChild,
		onCopyGroupPath,
		onDeleteGroup,
		onStartEditGroup,
		openedMenuGroupKey,
		selectedGroupKey,
	]);

	return (
		<div className="knowledge-base-list__sidebar">
			{searching ? (
				<div className="knowledge-base-list__sidebar-search-row">
					<Input
						autoFocus
						allowClear
						placeholder="请输入群组名称搜索"
						className="knowledge-base-list__sidebar-search"
						prefix={
							<span
								style={{ cursor: 'pointer' }}
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => submitSearch(searchKeyword, false)}
							>
								<SearchOutlined className="knowledge-base-list__sidebar-search-icon" />
							</span>
						}
						value={searchKeyword}
						onChange={(event) => {
							const nextKeyword = event.target.value;
							setSearchKeyword(nextKeyword);
							if (!nextKeyword) {
								onSearchGroup('');
							}
						}}
						onBlur={() => {
							if (!searchKeyword.trim()) {
								setSearching(false);
							}
						}}
						onPressEnter={() => submitSearch(searchKeyword)}
						onKeyDown={(event) => {
							if (event.key === 'Escape') {
								onSearchGroup('');
								setSearchKeyword('');
								setSearching(false);
							}
						}}
					/>
				</div>
			) : (
				<Flex align="center" justify="space-between" className="knowledge-base-list__sidebar-title-row">
					<div className="knowledge-base-list__sidebar-title">知识库群组</div>
					<Button
						type="text"
						className="knowledge-base-list__sidebar-title-action"
						icon={<SearchOutlined />}
						onClick={() => setSearching(true)}
					/>
				</Flex>
			)}
			{isLoading ? (
				<Flex
					align="center"
					justify="center"
					style={{width: '100%', height: '200px'}}
				> 
					<Loading />
				</Flex>	
			) : (
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
			/>)}
		</div>
	);
};

export default KnowledgeGroupTree;
