import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Pagination, Space, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Key } from 'react';
import type { KnowledgeFileRecord } from '../types';
import { getFormatFromName, getFormatIcon } from '../utils';
import Loading from '../list/components/Loading';

interface KnowledgeTableProps {
	isLoading: boolean;
	records: KnowledgeFileRecord[];
	selectedRowKeys: Key[];
	currentPage: number;
	pageSize: number;
	total: number;
	onSelectionChange: (keys: Key[]) => void;
	onPageChange: (page: number, pageSize: number) => void;
	onOpenDocument: (record: KnowledgeFileRecord) => void;
	onOpenTagModal: (keys: string[], tags?: string[]) => void;
	onOpenConfigModal: (record: KnowledgeFileRecord) => void;
	onDelete: (keys: string[]) => void;
}

const KnowledgeTable = ({
	isLoading,
	records,
	selectedRowKeys,
	currentPage,
	pageSize,
	total,
	onSelectionChange,
	onPageChange,
	onOpenDocument,
	onOpenTagModal,
	onOpenConfigModal,
	onDelete,
}: KnowledgeTableProps) => {
	const getRecordFormat = (record: KnowledgeFileRecord) => {
		if (record.doc_type === 'web') {
			return 'url' as const;
		}

		return getFormatFromName(record.doc_name);
	};

	const columns: TableColumnsType<KnowledgeFileRecord> = [
		{
			title: '文件名称/ID',
			dataIndex: 'doc_name',
			key: 'doc_name',
			width: 320,
			render: (_, record) => (
				<div className="knowledge-table-list__file-cell">
					<span className="knowledge-table-list__file-icon">{getFormatIcon(getRecordFormat(record))}</span>
					<div className="knowledge-table-list__file-info">
						<span
							className="knowledge-table-list__file-name"
							onClick={() => {
									onOpenDocument(record);
							}}
						>
							{record.doc_name}
						</span>
						<span className="knowledge-table-list__sub-text">{record.document_id}</span>
					</div>
				</div>
			),
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 110,
			render: (_, record) => (
				<span className="knowledge-table-list__status">
					<span className="knowledge-table-list__status-dot" />
					{record.status === 'success' ? '可用' : '处理中'}
				</span>
			),
		},
		{
			title: '数据量',
			dataIndex: 'doc_size',
			key: 'doc_size',
			width: 132,
			render: (value) => `${Number(value || 0).toLocaleString()}字节`,
		},
		{
			title: (
				<Space size={4}>
					高级解析用量
					<Tooltip title="展示该文档高级解析策略累计与最近一次使用情况">
						<QuestionCircleOutlined />
					</Tooltip>
				</Space>
			),
			key: 'advancedUsage',
			width: 156,
			render: () => (
				<div className="knowledge-table-list__stacked-text">
					<span>累计 -</span>
					<span>最新 -</span>
				</div>
			),
		},
		{
			title: '文件格式',
			dataIndex: 'doc_type',
			key: 'doc_type',
			width: 104,
		},
		{
			title: (
				<Space size={4}>
					文件标签
					<Tooltip title="支持对单个文件或批量文件维护标签">
						<QuestionCircleOutlined />
					</Tooltip>
				</Space>
			),
			dataIndex: 'tags',
			key: 'tags',
			width: 180,
			render: (_, record) => (
				<div className="knowledge-table-list__tag-cell">
					{record.tags.length ? (
						record.tags.map((tag) => (
							<Tag key={tag} color="blue">
								{tag}
							</Tag>
						))
					) : (
						<span className="knowledge-table-list__placeholder">-</span>
					)}
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => {
							onOpenTagModal([record.document_id], record.tags);
						}}
					/>
				</div>
			),
		},
		{
			title: '上传时间',
			dataIndex: 'create_time',
			key: 'create_time',
			width: 176,
			render: (_, record) => <span className="knowledge-table-list__sub-text">{record.create_time ? new Date(record.create_time).toLocaleString() : '-'}</span>,
		},
		{
			title: '操作',
			key: 'actions',
			fixed: 'right',
      width: 160,
			render: (_, record) => (
				<Flex gap={10}>
					<Button
						type="link"
						onClick={() => {
							onOpenConfigModal(record);
						}}
					>
						修改配置
					</Button>
					<Button
						danger
						type="link"
						onClick={() => {
							onDelete([record.document_id]);
						}}
					>
						删除
					</Button>
				</Flex>
			),
		},
	];

	return (
		<Flex vertical className="knowledge-table-list__table-wrapper">
			<Flex>
				{isLoading ? (
					<Flex justify='center' align='center' style={{ width: '100%', height: 100 }}>
						<Loading />
					</Flex>
				) : (
					<Table<KnowledgeFileRecord>
						rowKey="document_id"
						columns={columns}
						dataSource={records}
						pagination={false}
						rowSelection={{
							selectedRowKeys,
							onChange: onSelectionChange,
						}}
						scroll={{ x: 1320 }}
					/>
				)}
			</Flex>
			<Flex justify="flex-end" className="knowledge-table-list__pagination">
				<Pagination
					size="small"
					current={currentPage}
					pageSize={pageSize}
					total={total}
					showSizeChanger
					pageSizeOptions={[10, 20, 50]}
					showQuickJumper={false}
					showTotal={(value) => `共 ${value} 条`}
					onChange={onPageChange}
				/>
			</Flex>
		</Flex>
	);
};

export default KnowledgeTable;