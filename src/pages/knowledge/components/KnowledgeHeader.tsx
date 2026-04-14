import { AimOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Button, Flex, Typography } from 'antd';
import type { KnowledgeBaseInfo } from '../types';

const { Text, Title } = Typography;

interface KnowledgeHeaderProps {
	knowledgeBase: KnowledgeBaseInfo;
	knowledgeUpdatedAt: string;
	onCopyKnowledgeId: () => void;
}

const KnowledgeHeader = ({
	knowledgeBase,
	knowledgeUpdatedAt,
	onCopyKnowledgeId,
}: KnowledgeHeaderProps) => {
	const navigate = useNavigate();

	return (
		<Flex justify="space-between" align="center" gap={24} wrap>
			<Flex vertical gap={12}>
				<Title level={5} style={{ margin: 0 }}>
					{knowledgeBase.name}
				</Title>
				<Flex className="knowledge-table-list__meta" gap={12} wrap>
					<span className="knowledge-table-list__meta-item">
						<Text type="secondary">知识库 ID:</Text>
						<span>{knowledgeBase.id}</span>
						<Button
							type="text"
							size="small"
							className="knowledge-table-list__meta-button"
							icon={<CopyOutlined />}
							onClick={onCopyKnowledgeId}
						/>
					</span>
					<span className="knowledge-table-list__dot" />
					<span className="knowledge-table-list__meta-item">
						<Text type="secondary">托管资源源:</Text>
						<Text strong type="success">
							{knowledgeBase.sourceType}
						</Text>
					</span>
					<span className="knowledge-table-list__dot" />
					<span className="knowledge-table-list__meta-item">
						<Text type="secondary">更新时间:</Text>
						<span>{knowledgeUpdatedAt}</span>
					</span>
					<span className="knowledge-table-list__dot" />
					<span className="knowledge-table-list__meta-item">{knowledgeBase.description}</span>
				</Flex>
			</Flex>
			<Button
				icon={<AimOutlined />}
				onClick={() => {
					navigate('/search/test');
				}}
			>
				命中测试
			</Button>
		</Flex>
	);
};

export default KnowledgeHeader;