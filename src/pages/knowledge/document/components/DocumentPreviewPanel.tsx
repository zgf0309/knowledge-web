import { Alert, Flex, Spin } from 'antd';
import MarkdownEditor from '@/components/MarkdownEditor';

interface DocumentPreviewPanelProps {
  reportContent?: string;
  loading?: boolean;
}

const DocumentPreviewPanel = ({
  reportContent,
  loading,
}: DocumentPreviewPanelProps) => (
  <section className="knowledge-document-page__panel knowledge-document-page__panel--full-height">
    <Flex
      justify="space-between"
      align="center"
      gap={12}
      className="knowledge-document-page__panel-header"
    >
      <Flex vertical gap={4}>
        <div className="knowledge-document-page__panel-title">原文对照</div>
      </Flex>
    </Flex>
    <Spin
      spinning={!!loading}
      wrapperClassName="knowledge-document-page__preview-spin"
    >
      <Flex
        vertical
        className="knowledge-document-page__panel-body knowledge-document-page__doc-wrap"
      >
        <Alert
          className="knowledge-document-page__tip"
          showIcon
          type="info"
          message="通过点击右侧切片，快速查看对应原文内容"
        />
        <article className="knowledge-document-page__doc">
          <MarkdownEditor
            value={reportContent}
            editable={false}
            isShowMenu={false}
          />
        </article>
      </Flex>
    </Spin>
  </section>
);

export default DocumentPreviewPanel;
