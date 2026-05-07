import { Flex, Spin } from 'antd';
import type { ChatMessageItem } from '../types';
import MarkdownMessage from './MarkdownMessage';

interface MessageListProps {
  messages: ChatMessageItem[];
  loading?: boolean;
  pending?: boolean;
}

const MessageList = ({ messages, loading, pending }: MessageListProps) => (
  <Flex className="welcome-page__box">
      <div className="welcome-page__messages">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`welcome-page__message welcome-page__message--${item.role}`}
          >
            {
              item.role === 'user' ? (<div className="welcome-page__message-bubble">{item.content}</div>)
              : (
              <div className="welcome-page__message-bubble">
                <MarkdownMessage content={item.content} />
              </div>)
            }
          </div>
        ))}
        {pending ? (
          <div className="welcome-page__message welcome-page__message--assistant">
            <div className="welcome-page__message-bubble welcome-page__message-bubble--pending">
              <Spin size="small" /> <span>正在思考…</span>
            </div>
          </div>
        ) : null}
      </div>
  </Flex>
);

export default MessageList;
