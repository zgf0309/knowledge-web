import {
	BookOutlined,
	ReloadOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Button, Flex, Input } from 'antd';

interface KnowledgeToolbarProps {
	knowledgeId: string;
	searchKeyword: string;
	onSearchChange: (value: string) => void;
	onRefresh: () => void;
}

const KnowledgeToolbar = ({
	knowledgeId,
	searchKeyword,
	onSearchChange,
	onRefresh,
}: KnowledgeToolbarProps) => {
	const navigate = useNavigate();

	return (
		<Flex justify="space-between" gap={16} wrap>
			<Flex align="center" gap={12} className="knowledge-table-list__toolbar-search">
				<Input.Search
					allowClear
					placeholder="请输入文件名称"
					value={searchKeyword}
					onChange={(event) => {
						onSearchChange(event.target.value);
					}}
					onSearch={onSearchChange}
				/>
				<Button icon={<ReloadOutlined />} onClick={onRefresh} />
			</Flex>
			<Flex gap={10} align="center" wrap>
				<Button
					icon={<BookOutlined />}
					onClick={() => {
						navigate('/knowledge-graph/build');
					}}
				>
					知识图谱
				</Button>
				<Button
					type="primary"
					icon={<UploadOutlined />}
					onClick={() => {
						navigate('/knowledge/import', { state: { type: 'import', knowledgeId } });
					}}
				>
					导入文件
				</Button>
			</Flex>
		</Flex>
	);
};

export default KnowledgeToolbar;