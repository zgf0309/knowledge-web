import { FileTextOutlined } from '@ant-design/icons';
import { Button, Flex, Pagination, Space, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Key } from 'react';
import { useMemo } from 'react';
import type { KnowledgeBaseRecord } from '../types';
import { useNavigate } from '@umijs/max';
import Loading from './Loading';

const { Text } = Typography;

interface KnowledgeTableSectionProps {
	isLoading?: boolean;
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
	isLoading = false,
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
				dataIndex: 'knowledge_name',
				key: 'knowledge_name',
				width: 260,
				render: (_, record) => (
					<Flex vertical gap={2} style={{ minWidth: 0 }}>
						<Flex align="center" gap={8} style={{ minWidth: 0 }} onClick={() => navigate(`/knowledge/index`, { state: { knowledgeId: record.knowledge_id }} )}>
							<span className="knowledge-base-list__name-icon">
								<FileTextOutlined />
							</span>
							<a className="knowledge-base-list__name-link">{record.knowledge_name}</a>
						</Flex>
						<Text className="knowledge-base-list__subtext">{record.knowledge_id}</Text>
					</Flex>
				),
			},
			{
				title: '描述',
				dataIndex: 'knowledge_desc',
				key: 'knowledge_desc',
				width: 220,
				render: (value) => <span className="knowledge-base-list__ellipsis">{value || '-'}</span>,
			},
			{
				title: '类型',
				dataIndex: 'scope',
				key: 'scope',
				width: 100,
			},
			{
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				width: 100,
				render: (value) => value ?? '-',
			},
			{
				title: '语言',
				dataIndex: 'language',
				key: 'language',
				width: 120,
			},
			{
				title: '创建时间',
				dataIndex: 'create_date',
				key: 'create_date',
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
						<Button danger type="link" onClick={() => onDelete([record.knowledge_id])}>
							删除
						</Button>
					</Space>
				),
			},
		],
		[navigate, onDelete, onEdit],
	);

	return (
		<div className="knowledge-base-list__main">
			<Text className="knowledge-base-list__group-hint">当前群组：{currentGroupTitle}</Text>
			<Flex>
				{isLoading ? (
					<Flex justify='center' align='center' style={{ width: '100%', height: 100 }}>
						<Loading />
					</Flex>
				) : (
					<Table<KnowledgeBaseRecord>
						className="knowledge-base-list__table"
						rowKey="knowledge_id"
						columns={columns}
						dataSource={dataSource}
						pagination={false}
						rowSelection={{
							selectedRowKeys,
							onChange: onSelectionChange,
						}}
						scroll={{ x: 1600 }}
					/>
				)}
			</Flex>
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
