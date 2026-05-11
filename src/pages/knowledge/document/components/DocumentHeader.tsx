import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  RotateLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Button, Flex, Space, Typography } from 'antd';

const { Text } = Typography;

interface DocumentHeaderProps {
  title: string;
  documentId: string;
  isAudio?: boolean;
  isImage?: boolean;
  audioUrl?: string;
  fileUrl?: string;
}

const DocumentHeader = ({
  title,
  documentId,
  isAudio,
  isImage,
  audioUrl,
  fileUrl,
}: DocumentHeaderProps) => {
  const navigate = useNavigate();
  const downloadUrl = fileUrl || audioUrl;
  const downloadLabel = isAudio
    ? '下载音频'
    : isImage
      ? '下载原图'
      : '下载原文';

  return (
    <Flex
      justify="space-between"
      align="center"
      gap={16}
      wrap
      className="knowledge-document-page__header"
    >
      <Flex vertical gap={4}>
        <Flex gap={10} align="center">
          <ArrowLeftOutlined onClick={() => navigate(-1)} />
          <h1 className="knowledge-document-page__title">{title}</h1>
        </Flex>
        <Text type="secondary">文档 ID：{documentId}</Text>
      </Flex>
      <Space wrap>
        <Button
          icon={<DownloadOutlined />}
          href={downloadUrl}
          disabled={(isAudio || isImage) && !downloadUrl}
        >
          {downloadLabel}
        </Button>
        <Button icon={<RotateLeftOutlined />}>配置详情</Button>
        <Button icon={<FileSearchOutlined />}>命中测试</Button>
      </Space>
    </Flex>
  );
};

export default DocumentHeader;
