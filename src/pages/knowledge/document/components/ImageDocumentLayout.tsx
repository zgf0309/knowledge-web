import {
  CopyOutlined,
  EditOutlined,
  FileImageOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Empty, Flex, Image, Switch, Tooltip, Typography } from 'antd';
import type { KnowledgeChunkItem, KnowledgeInsightItem } from '../models';
import { CHUNK_TYPE_LABEL } from '../models';
import type { ImageSourceInfo } from '../types';
import DocumentInsightPanel from './DocumentInsightPanel';

const { Paragraph, Text } = Typography;

interface ImageDocumentLayoutProps {
  image: ImageSourceInfo;
  currentChunk?: KnowledgeChunkItem;
  chunkCount: number;
  visibleInsights: KnowledgeInsightItem[];
  onCreateChunk: () => void;
  onEditChunk: (chunk: KnowledgeChunkItem) => void;
  onCopyChunk: (chunk: KnowledgeChunkItem) => void;
  onToggleChunk: (chunkId: string, enabled: boolean) => void;
  onCreateInsight: () => void;
  onEditInsight: (insightId: string) => void;
  onDeleteInsight: (insightId: string) => void;
}

const getChunkTitle = (chunk?: KnowledgeChunkItem) =>
  chunk?.important_keywords?.[0] || chunk?.docnm_kwd || '暂无标题';

const getChunkDescription = (chunk?: KnowledgeChunkItem) =>
  chunk?.content?.trim() || '暂无详细信息';

const ImageDocumentLayout = ({
  image,
  currentChunk,
  chunkCount,
  visibleInsights,
  onCreateChunk,
  onEditChunk,
  onCopyChunk,
  onToggleChunk,
  onCreateInsight,
  onEditInsight,
  onDeleteInsight,
}: ImageDocumentLayoutProps) => (
  <div className="knowledge-document-page__layout knowledge-document-page__layout--image">
    <section className="knowledge-document-page__image-workspace">
      <div className="knowledge-document-page__image-card">
        <Flex
          justify="space-between"
          align="center"
          gap={12}
          className="knowledge-document-page__image-card-header"
        >
          <Flex align="center" gap={8} wrap>
            <span className="knowledge-document-page__chunk-label">
              {currentChunk?.label ?? '#1'}
            </span>
            <span className="knowledge-document-page__chunk-info">
              ·{' '}
              {currentChunk
                ? CHUNK_TYPE_LABEL[currentChunk.chunk_type]
                : '原文切片'}{' '}
              · {currentChunk?.charCount ?? 0}字符
            </span>
          </Flex>
          <Flex align="center" gap={4}>
            {currentChunk ? (
              <>
                <Tooltip title="复制切片">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => onCopyChunk(currentChunk)}
                  />
                </Tooltip>
                <Tooltip title="编辑切片">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditChunk(currentChunk)}
                  />
                </Tooltip>
                <Switch
                  size="small"
                  checked={currentChunk.available}
                  onChange={(checked) =>
                    onToggleChunk(currentChunk.id, checked)
                  }
                />
              </>
            ) : (
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreateChunk}
              >
                新建切片
              </Button>
            )}
          </Flex>
        </Flex>

        <div className="knowledge-document-page__image-preview">
          {image.url ? (
            <Image
              src={image.url}
              alt={image.title}
              className="knowledge-document-page__image"
              preview
            />
          ) : (
            <Empty
              image={<FileImageOutlined />}
              description="暂无可预览图片地址"
            />
          )}
        </div>

        <div className="knowledge-document-page__image-meta">
          <div className="knowledge-document-page__image-meta-title">
            {getChunkTitle(currentChunk)}
          </div>
          <Paragraph
            type="secondary"
            className="knowledge-document-page__image-meta-description"
            ellipsis={{ rows: 2 }}
          >
            {getChunkDescription(currentChunk)}
          </Paragraph>
          {chunkCount > 1 ? (
            <Text type="secondary">
              共 {chunkCount} 个切片，当前展示首个切片
            </Text>
          ) : null}
        </div>
      </div>
    </section>

    <DocumentInsightPanel
      visibleInsights={visibleInsights}
      showSubtitle={false}
      onCreateInsight={onCreateInsight}
      onEditInsight={onEditInsight}
      onDeleteInsight={onDeleteInsight}
    />
  </div>
);

export default ImageDocumentLayout;
