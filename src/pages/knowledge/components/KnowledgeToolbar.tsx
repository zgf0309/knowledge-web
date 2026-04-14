import {
	BookOutlined,
	DeleteOutlined,
	QuestionCircleOutlined,
	ReloadOutlined,
	TagsOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Button, Flex, Input } from 'antd';

interface KnowledgeToolbarProps {
	searchKeyword: string;
	onSearchChange: (value: string) => void;
	onRefresh: () => void;
	onOpenBatchConfig: () => void;
	onDeleteSelected: () => void;
	onOpenTagModal: () => void;
}

const KnowledgeToolbar = ({
	searchKeyword,
	onSearchChange,
	onRefresh,
	onOpenBatchConfig,
	onDeleteSelected,
	onOpenTagModal,
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
				<Button icon={<QuestionCircleOutlined />} onClick={onOpenBatchConfig}>
					批量修改配置
				</Button>
				<Button danger icon={<DeleteOutlined />} onClick={onDeleteSelected}>
					批量删除
				</Button>
				<Button icon={<TagsOutlined />} onClick={onOpenTagModal}>
					标签管理
				</Button>
				<Button
					type="primary"
					icon={<UploadOutlined />}
					onClick={() => {
						navigate('/knowledge/import', { state: { type: 'import' } });
					}}
				>
					导入文件
				</Button>
			</Flex>
		</Flex>
	);
};

export default KnowledgeToolbar;