import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, Tooltip } from 'antd';
import type { KnowledgeInsightItem } from '../mock';

interface DocumentInsightPanelProps {
	visibleInsights: KnowledgeInsightItem[];
	onCreateInsight: () => void;
	onEditInsight: (insightId: string) => void;
	onDeleteInsight: (insightId: string) => void;
}

const DocumentInsightPanel = ({
	visibleInsights,
	onCreateInsight,
	onEditInsight,
	onDeleteInsight,
}: DocumentInsightPanelProps) => (
	<section className="knowledge-document-page__panel knowledge-document-page__panel--full-height">
		<Flex justify="space-between" align="center" gap={12} wrap className="knowledge-document-page__panel-header">
			<Flex vertical gap={4}>
				<div className="knowledge-document-page__panel-title">切片知识点（{visibleInsights.length}）</div>
				<div className="knowledge-document-page__panel-subtitle">跟随当前切片联动展示</div>
			</Flex>
			<Button icon={<PlusOutlined />} onClick={onCreateInsight}>
				新建
			</Button>
		</Flex>
		<div className="knowledge-document-page__panel-body knowledge-document-page__insight-list">
			{visibleInsights.length ? (
				visibleInsights.map((item) => (
					<div key={item.id} className="knowledge-document-page__insight-card">
						<Flex justify="space-between" align="center" gap={12} wrap>
							<div className="knowledge-document-page__insight-title">{item.title}</div>
							<Flex align="center" gap={4}>
								<Tooltip title="编辑知识点">
									<Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEditInsight(item.id)} />
								</Tooltip>
								<Tooltip title="删除知识点">
									<Button
										type="text"
										danger
										size="small"
										icon={<DeleteOutlined />}
										onClick={() => onDeleteInsight(item.id)}
									/>
								</Tooltip>
							</Flex>
						</Flex>
						<p className="knowledge-document-page__insight-content">{item.content}</p>
						<Flex justify="space-between" align="center" gap={12} wrap className="knowledge-document-page__insight-footer">
							<span>{item.source}</span>
							<span>{item.actionLabel}</span>
						</Flex>
					</div>
				))
			) : (
				<Empty description="当前切片暂无知识点" />
			)}
		</div>
	</section>
);

export default DocumentInsightPanel;