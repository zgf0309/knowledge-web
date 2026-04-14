import {
	CopyOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Empty, Flex, Input, Pagination, Segmented, Select, Switch, Tag, Tooltip, Typography } from 'antd';
import type { KnowledgeChunkItem } from '../mock';
import type { SourceFilterValue, StatusFilterValue } from '../types';
import { CHUNK_PAGE_SIZE } from '../utils';

const { Paragraph, Text } = Typography;

interface DocumentChunkPanelProps {
	filteredChunks: KnowledgeChunkItem[];
	pagedChunks: KnowledgeChunkItem[];
	chunkCount: number;
	chunkPage: number;
	currentChunkId: string;
	searchKeyword: string;
	sourceFilter: SourceFilterValue;
	statusFilter: StatusFilterValue;
	sourceSummary: {
		all: number;
		original: number;
		custom: number;
	};
	onSearchChange: (value: string) => void;
	onSourceFilterChange: (value: SourceFilterValue) => void;
	onStatusFilterChange: (value: StatusFilterValue) => void;
	onCreateChunk: () => void;
	onSelectChunk: (chunkId: string) => void;
	onEditChunk: (chunk: KnowledgeChunkItem) => void;
	onCopyChunk: (chunk: KnowledgeChunkItem) => void;
	onToggleChunk: (chunkId: string, enabled: boolean) => void;
	onDeleteChunk: (chunk: KnowledgeChunkItem) => void;
	onPageChange: (page: number) => void;
}

const DocumentChunkPanel = ({
	filteredChunks,
	pagedChunks,
	chunkCount,
	chunkPage,
	currentChunkId,
	searchKeyword,
	sourceFilter,
	statusFilter,
	sourceSummary,
	onSearchChange,
	onSourceFilterChange,
	onStatusFilterChange,
	onCreateChunk,
	onSelectChunk,
	onEditChunk,
	onCopyChunk,
	onToggleChunk,
	onDeleteChunk,
	onPageChange,
}: DocumentChunkPanelProps) => (
	<section className="knowledge-document-page__panel knowledge-document-page__panel--full-height knowledge-document-page__middle">
		<Flex justify="space-between" align="flex-start" gap={12} wrap className="knowledge-document-page__panel-header">
			<Flex vertical gap={4}>
				<div className="knowledge-document-page__panel-title">切片信息</div>
				<div className="knowledge-document-page__panel-subtitle">共 {chunkCount} 个切片</div>
			</Flex>
			<Flex gap={12} wrap flex={1} justify="flex-end">
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="搜索切片内容"
					className="knowledge-document-page__search"
					value={searchKeyword}
					onChange={(event) => {
						onSearchChange(event.target.value);
					}}
				/>
				<Select
					value={statusFilter}
					onChange={onStatusFilterChange}
					options={[
						{ label: '全部状态', value: '全部状态' },
						{ label: '已启用', value: '已启用' },
						{ label: '已停用', value: '已停用' },
					]}
					style={{ width: 120 }}
				/>
				<Button icon={<PlusOutlined />} onClick={onCreateChunk}>
					新建
				</Button>
			</Flex>
		</Flex>
		<Flex style={{ padding: '0 20px', flex: 'none' }}>
			<Segmented
				className="knowledge-document-page__segment-control"
				value={sourceFilter}
				onChange={(value) => {
					onSourceFilterChange(value as SourceFilterValue);
				}}
				options={[
					{ label: `全部 (${sourceSummary.all})`, value: '全部' },
					{ label: `原文切片 (${sourceSummary.original})`, value: '原文切片' },
					{ label: `自定义切片 (${sourceSummary.custom})`, value: '自定义切片' },
				]}
			/>
		</Flex>
		<Flex vertical className="knowledge-document-page__panel-body">
			<div className="knowledge-document-page__chunk-list">
				{filteredChunks.length ? (
					pagedChunks.map((item) => (
						<div
							key={item.id}
							className={`knowledge-document-page__chunk-card${item.id === currentChunkId ? ' knowledge-document-page__chunk-card--active' : ''}`}
							onClick={() => {
								onSelectChunk(item.id);
							}}
						>
							<Flex justify="space-between" align="center" gap={12} className="knowledge-document-page__chunk-meta" wrap>
								<Flex align="center" gap={8} wrap>
									<span className="knowledge-document-page__chunk-label">{item.label}</span>
									<span className="knowledge-document-page__chunk-info"> · {item.sourceType} · {item.charCount}字符</span>
								</Flex>
								<Flex align="center" gap={4} onClick={(event) => event.stopPropagation()}>
									<Tooltip title="复制切片">
										<Button type="text" size="small" icon={<CopyOutlined />} onClick={() => onCopyChunk(item)} />
									</Tooltip>
									<Tooltip title="编辑切片">
										<Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEditChunk(item)} />
									</Tooltip>
									<Switch size="small" checked={item.enabled} onChange={(checked) => onToggleChunk(item.id, checked)} />
								</Flex>
							</Flex>
							<Paragraph className="knowledge-document-page__chunk-content" ellipsis={{ rows: 4 }}>
								{item.content}
							</Paragraph>
							<Flex justify="space-between" align="center" gap={12} className="knowledge-document-page__chunk-footer" wrap>
								<Tag color={item.enabled ? 'success' : 'default'}>{item.statusText}</Tag>
								<Flex align="center" gap={8} onClick={(event) => event.stopPropagation()}>
									<Text type="secondary">点击卡片查看关联知识点</Text>
									<Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => onDeleteChunk(item)}>
										删除
									</Button>
								</Flex>
							</Flex>
						</div>
					))
				) : (
					<Empty description="暂无匹配切片" />
				)}
			</div>
			{filteredChunks.length > CHUNK_PAGE_SIZE ? (
				<Flex justify="end" className="knowledge-document-page__chunk-pagination">
					<Pagination
						size="small"
						current={chunkPage}
						pageSize={CHUNK_PAGE_SIZE}
						total={filteredChunks.length}
						showSizeChanger={false}
						showQuickJumper={false}
						showTotal={(total) => `共 ${total} 条`}
						onChange={onPageChange}
					/>
				</Flex>
			) : null}
		</Flex>
	</section>
);

export default DocumentChunkPanel;