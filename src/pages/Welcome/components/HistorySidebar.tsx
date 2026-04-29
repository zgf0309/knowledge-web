import { HistoryOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import type { ConversationItem } from '../useAssistantHome';

const { Text } = Typography;

interface HistorySidebarProps {
	collapsed: boolean;
	conversations: ConversationItem[];
	activeId?: string;
	onToggle: () => void;
	onCreate: () => void;
	onSelect?: (id: string) => void;
}

const HistorySidebar = ({
	collapsed,
	conversations,
	activeId,
	onToggle,
	onCreate,
	onSelect,
}: HistorySidebarProps) => {
	if (collapsed) {
		return (
			<aside className="welcome-page__history welcome-page__history--collapsed">
				<Tooltip title="展开对话历史" placement="right">
					<Button type="text" icon={<HistoryOutlined />} onClick={onToggle} aria-label="展开对话历史" />
				</Tooltip>
			</aside>
		);
	}

	return (
		<aside className="welcome-page__history">
			<header className="welcome-page__history-header">
				<div className="welcome-page__history-title">
					<span>对话历史</span>
					<Tooltip title="历史对话记录">
						<HistoryOutlined className="welcome-page__history-title-icon" />
					</Tooltip>
				</div>
				<Tooltip title="收起">
					<Button
						type="text"
						size="small"
						icon={<MenuFoldOutlined />}
						onClick={onToggle}
						aria-label="收起对话历史"
					/>
				</Tooltip>
			</header>
			<Button block icon={<PlusOutlined />} onClick={onCreate} className="welcome-page__history-new">
				新建对话
			</Button>
			<div className="welcome-page__history-list">
				{conversations.length ? (
					conversations.map((item) => (
						<button
							type="button"
							key={item.id}
							className={`welcome-page__history-item${item.id === activeId ? ' welcome-page__history-item--active' : ''}`}
							onClick={() => onSelect?.(item.id)}
						>
							<div className="welcome-page__history-item-title">{item.title}</div>
							<Text type="secondary" className="welcome-page__history-item-time">
								{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
							</Text>
						</button>
					))
				) : (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={<Text type="secondary">暂无历史记录</Text>}
					/>
				)}
			</div>
		</aside>
	);
};

export { MenuUnfoldOutlined };
export default HistorySidebar;
