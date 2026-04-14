import { MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Flex, Input, Space } from 'antd';
import type { ReactNode } from 'react';
import { startTransition } from 'react';
import { useNavigate } from '@umijs/max';

interface KnowledgeListToolbarProps {
	sidebarCollapsed: boolean;
	searchKeyword: string;
	batchMode: boolean;
	allCurrentPageSelected: boolean;
	partialCurrentPageSelected: boolean;
	hasSelectedRows: boolean;
	batchMoveAction: ReactNode;
	onToggleSidebar: () => void;
	onSearchChange: (keyword: string) => void;
	onOpenBatchMode: () => void;
	onOpenCreateModal: () => void;
	onToggleSelectAllCurrentPage: (checked: boolean) => void;
	onBatchDelete: () => void;
	onCloseBatchMode: () => void;
}

const KnowledgeListToolbar = ({
	sidebarCollapsed,
	searchKeyword,
	batchMode,
	allCurrentPageSelected,
	partialCurrentPageSelected,
	hasSelectedRows,
	batchMoveAction,
	onToggleSidebar,
	onSearchChange,
	onOpenBatchMode,
	onOpenCreateModal,
	onToggleSelectAllCurrentPage,
	onBatchDelete,
	onCloseBatchMode,
}: KnowledgeListToolbarProps) => {
	const navigate = useNavigate();
	return <Flex align="center" justify="space-between" gap={12}>
		<Flex flex={1} style={{ minWidth: 0 }}>
			<Flex gap={8} align="center" style={{ width: '100%', maxWidth: 300 }}>
				<Button
					type="text"
					className="knowledge-base-list__menu-button"
					icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					onClick={onToggleSidebar}
				/>
				<Input.Search
					allowClear
					placeholder="请输入知识库名称或描述"
					className="knowledge-base-list__search"
					value={searchKeyword}
					onChange={(event) => {
						startTransition(() => {
							onSearchChange(event.target.value);
						});
					}}
				/>
			</Flex>
		</Flex>
		{batchMode ? (
			<Flex align="center" gap={12} className="knowledge-base-list__batch-bar">
				<Checkbox
					checked={allCurrentPageSelected}
					indeterminate={partialCurrentPageSelected}
					onChange={(event) => onToggleSelectAllCurrentPage(event.target.checked)}
				>
					全选
				</Checkbox>
				<Button disabled={!hasSelectedRows} onClick={onBatchDelete}>
					批量删除
				</Button>
				{batchMoveAction}
				<Button onClick={onCloseBatchMode}>取消</Button>
			</Flex>
		) : (
			<Space>
				<Button onClick={onOpenBatchMode}>批量操作</Button>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/knowledge/import', { state: { type: 'add' } })}>
					创建知识库
				</Button>
			</Space>
		)}
	</Flex>
};

export default KnowledgeListToolbar;
