import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Spin } from 'antd';
import type { ChatMessageItem } from '../types';

interface MessageListProps {
  messages: ChatMessageItem[];
  loading?: boolean;
  pending?: boolean;
}

const MessageList = ({ messages, loading, pending }: MessageListProps) => (
  <Spin spinning={!!loading}>
    <div className="welcome-page__messages">
      {messages.map((item) => (
        <div
          key={item.id}
          className={`welcome-page__message welcome-page__message--${item.role}`}
        >
          <Avatar
            size={32}
            className="welcome-page__message-avatar"
            icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
          />
          <div className="welcome-page__message-bubble">{item.content}</div>
        </div>
      ))}
      {pending ? (
        <div className="welcome-page__message welcome-page__message--assistant">
          <Avatar
            size={32}
            className="welcome-page__message-avatar"
            icon={<RobotOutlined />}
          />
          <div className="welcome-page__message-bubble welcome-page__message-bubble--pending">
            <Spin size="small" /> <span>正在思考…</span>
          </div>
        </div>
      ) : null}
    </div>
  </Spin>
);

export default MessageList;
