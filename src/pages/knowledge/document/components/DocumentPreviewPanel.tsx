import { Alert, Flex } from 'antd';
import type { KnowledgeDocumentDetail } from '../mock';
import MarkdownEditor from '@/components/MarkdownEditor';

interface DocumentPreviewPanelProps {
	detail: KnowledgeDocumentDetail;
}

const DocumentPreviewPanel = ({ detail }: DocumentPreviewPanelProps) => (
	<section className="knowledge-document-page__panel knowledge-document-page__panel--full-height">
		<Flex justify="space-between" align="center" gap={12} className="knowledge-document-page__panel-header">
			<Flex vertical gap={4}>
				<div className="knowledge-document-page__panel-title">原文对照</div>
			</Flex>
		</Flex>
		<Flex vertical className="knowledge-document-page__panel-body knowledge-document-page__doc-wrap">
			<Alert
				className="knowledge-document-page__tip"
				showIcon
				type="info"
				message="通过点击右侧切片，快速查看对应原文内容"
			/>
			<article className="knowledge-document-page__doc">
        <MarkdownEditor value={detail.reportContent} editable={false} isShowMenu={false} />
			</article>
		</Flex>
	</section>
);

export default DocumentPreviewPanel;