import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Pagination, Space, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Key } from 'react';
import type { KnowledgeFileRecord } from '../types';
import { getFormatIcon } from '../utils';

interface KnowledgeTableProps {
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
	const columns: TableColumnsType<KnowledgeFileRecord> = [
		{
			title: '文件名称/ID',
			dataIndex: 'name',
			key: 'name',
			width: 320,
			render: (_, record) => (
				<div className="knowledge-table-list__file-cell">
					<span className="knowledge-table-list__file-icon">{getFormatIcon(record.format)}</span>
					<div className="knowledge-table-list__file-info">
						<span
							className="knowledge-table-list__file-name"
							onClick={() => {
									onOpenDocument(record);
							}}
						>
							{record.name}
						</span>
						<span className="knowledge-table-list__sub-text">{record.id}</span>
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
					{record.status === 'available' ? '可用' : '处理中'}
				</span>
			),
		},
		{
			title: '数据量',
			dataIndex: 'dataSize',
			key: 'dataSize',
			width: 132,
			render: (value) => `${value}字符`,
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
			render: (_, record) => (
				<div className="knowledge-table-list__stacked-text">
					<span>累计 {record.advancedUsageTotal ?? '-'}</span>
					<span>最新 {record.advancedUsageLatest ?? '-'}</span>
				</div>
			),
		},
		{
			title: '文件格式',
			dataIndex: 'format',
			key: 'format',
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
							onOpenTagModal([record.key], record.tags);
						}}
					/>
				</div>
			),
		},
		{
			title: '上传时间',
			dataIndex: 'uploadedAt',
			key: 'uploadedAt',
			width: 176,
			render: (_, record) => <span className="knowledge-table-list__sub-text">{record.uploadedAt}</span>,
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
							onDelete([record.key]);
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
			<Table<KnowledgeFileRecord>
				rowKey="key"
				columns={columns}
				dataSource={records}
				pagination={false}
				rowSelection={{
					selectedRowKeys,
					onChange: onSelectionChange,
				}}
				scroll={{ x: 1320 }}
			/>
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