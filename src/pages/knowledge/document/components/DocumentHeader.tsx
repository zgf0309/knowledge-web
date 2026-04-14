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
}

const DocumentHeader = ({ title, documentId }: DocumentHeaderProps) => {
	const navigate = useNavigate();

	return (
		<Flex justify="space-between" align="center" gap={16} wrap className="knowledge-document-page__header">
			<Flex vertical gap={4}>
				<Flex gap={10} align="center">
					<ArrowLeftOutlined onClick={() => navigate('/knowledge/list')} />
					<h1 className="knowledge-document-page__title">{title}</h1>
				</Flex>
				<Text type="secondary">文档 ID：{documentId}</Text>
			</Flex>
			<Space wrap>
				<Button icon={<DownloadOutlined />}>下载原文</Button>
				<Button icon={<RotateLeftOutlined />}>配置详情</Button>
				<Button icon={<FileSearchOutlined />}>命中测试</Button>
			</Space>
		</Flex>
	);
};

export default DocumentHeader;