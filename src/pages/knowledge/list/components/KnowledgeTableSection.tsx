import { FileTextOutlined, FilterOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Pagination, Space, Table, Tooltip, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Key } from 'react';
import { useMemo } from 'react';
import type { KnowledgeBaseRecord } from '../types';
import { useNavigate } from '@umijs/max';

const { Text } = Typography;

interface KnowledgeTableSectionProps {
	currentGroupTitle: string;
	dataSource: KnowledgeBaseRecord[];
	selectedRowKeys: Key[];
	total: number;
	currentPage: number;
	pageSize: number;
	onSelectionChange: (keys: Key[]) => void;
	onEdit: (record: KnowledgeBaseRecord) => void;
	onDelete: (keys: string[]) => void;
	onPageChange: (page: number, pageSize: number) => void;
}

const KnowledgeTableSection = ({
	currentGroupTitle,
	dataSource,
	selectedRowKeys,
	total,
	currentPage,
	pageSize,
	onSelectionChange,
	onEdit,
	onDelete,
	onPageChange,
}: KnowledgeTableSectionProps) => {
  const navigate = useNavigate();
	const columns = useMemo<TableColumnsType<KnowledgeBaseRecord>>(
		() => [
			{
				title: '知识库名称/ID',
				dataIndex: 'name',
				key: 'name',
				width: 260,
				render: (_, record) => (
					<Flex vertical gap={2} style={{ minWidth: 0 }}>
						<Flex align="center" gap={8} style={{ minWidth: 0 }} onClick={() => navigate(`/knowledge/index`)}>
							<span className="knowledge-base-list__name-icon">
								<FileTextOutlined />
							</span>
							<a className="knowledge-base-list__name-link">{record.name}</a>
						</Flex>
						<Text className="knowledge-base-list__subtext">{record.id}</Text>
					</Flex>
				),
			},
			{
				title: '描述',
				dataIndex: 'description',
				key: 'description',
				width: 220,
				render: (value) => <span className="knowledge-base-list__ellipsis">{value || '-'}</span>,
			},
			{
				title: '文件数量',
				dataIndex: 'documentCount',
				key: 'documentCount',
				width: 100,
			},
			{
				title: (
					<Space size={4}>
						<span>高级解析累计用量</span>
						<Tooltip title="展示知识库高级解析累计使用量">
							<QuestionCircleOutlined className="knowledge-base-list__column-icon" />
						</Tooltip>
					</Space>
				),
				dataIndex: 'advancedUsage',
				key: 'advancedUsage',
				width: 140,
				render: (value) => value ?? '-',
			},
			{
				title: (
					<Space size={4}>
						<span>托管资源</span>
						<FilterOutlined className="knowledge-base-list__column-icon" />
					</Space>
				),
				dataIndex: 'sourceType',
				key: 'sourceType',
				width: 120,
			},
			{
				title: '向量模型',
				dataIndex: 'embeddingModel',
				key: 'embeddingModel',
				width: 180,
			},
			{
				title: '集群实例名称',
				dataIndex: 'clusterName',
				key: 'clusterName',
				width: 180,
			},
			{
				title: '更新时间',
				dataIndex: 'updatedAt',
				key: 'updatedAt',
				width: 180,
			},
			{
				title: '创建时间',
				dataIndex: 'createdAt',
				key: 'createdAt',
				width: 180,
			},
			{
				title: '操作',
				key: 'actions',
				fixed: 'right',
				width: 120,
				render: (_, record) => (
					<Space size={4}>
						<Button type="link" onClick={() => onEdit(record)}>
							编辑
						</Button>
						<Button danger type="link" onClick={() => onDelete([record.key])}>
							删除
						</Button>
					</Space>
				),
			},
		],
		[onDelete, onEdit],
	);

	return (
		<div className="knowledge-base-list__main">
			<Text className="knowledge-base-list__group-hint">当前群组：{currentGroupTitle}</Text>
			<Table<KnowledgeBaseRecord>
				className="knowledge-base-list__table"
				rowKey="key"
				columns={columns}
				dataSource={dataSource}
				pagination={false}
				rowSelection={{
					selectedRowKeys,
					onChange: onSelectionChange,
				}}
				scroll={{ x: 1600 }}
			/>
			<Flex justify="flex-end" className="knowledge-base-list__pagination">
				<Pagination
					current={currentPage}
					pageSize={pageSize}
					total={total}
					showSizeChanger
					pageSizeOptions={[10, 20, 50]}
					showQuickJumper={false}
					showTotal={(nextTotal) => `共 ${nextTotal} 条`}
					onChange={onPageChange}
				/>
			</Flex>
		</div>
	);
};

export default KnowledgeTableSection;
