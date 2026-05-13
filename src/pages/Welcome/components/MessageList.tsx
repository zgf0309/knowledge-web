import {
  CheckCircleOutlined,
  CopyOutlined,
  DownOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Flex, Spin, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ChatMessageItem, ReferenceItem } from '../types';
import MarkdownMessage from './MarkdownMessage';

interface MessageListProps {
  messages: ChatMessageItem[];
  loading?: boolean;
  pending?: boolean;
}

const getReferenceText = (item: ReferenceItem) =>
  item.content || item.snippet || item.title;

const getRecallCount = (thinking?: string, references?: ReferenceItem[]) => {
  const segmentCount = thinking?.match(/召回片段\s*\d+/g)?.length ?? 0;
  return segmentCount || references?.length || 0;
};

const RecallPanel = ({
  thinking,
  references,
  onMouseEnter,
  onMouseLeave,
}: {
  thinking?: string;
  references?: ReferenceItem[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const hasReferences = !!references?.length;
  const hasThinking = !!thinking;

  if (!hasReferences && !hasThinking) return null;

  const recallCount = getRecallCount(thinking, references);

  return (
    <div
      className="welcome-page__recall"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="welcome-page__recall-title">
        <CheckCircleOutlined className="welcome-page__recall-title-icon" />
        <span>已思考</span>
        <span className="welcome-page__recall-duration">
          （召回 {recallCount} 条）
        </span>
        <DownOutlined className="welcome-page__recall-arrow" />
      </div>
      <div className="welcome-page__recall-body">
        {hasThinking ? (
          <div className="welcome-page__recall-thinking">{thinking}</div>
        ) : (
          references?.map((ref, index) => {
            const content = getReferenceText(ref);
            if (!content) return null;

            return (
              <div className="welcome-page__recall-item" key={ref.id}>
                <span className="welcome-page__recall-bullet" />
                <div className="welcome-page__recall-content">
                  <div className="welcome-page__recall-item-title">
                    {ref.title || `召回片段 ${index + 1}`}
                    {ref.knowledge_name ? (
                      <span className="welcome-page__recall-source">
                        {ref.knowledge_name}
                      </span>
                    ) : null}
                  </div>
                  <div className="welcome-page__recall-snippet">{content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const MessageList = ({ messages, pending }: MessageListProps) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const autoScrollPausedRef = useRef(false);
  const streamSignature = useMemo(
    () =>
      messages
        .map(
          (item) =>
            `${item.id}:${item.content.length}:${item.thinking?.length ?? 0}:${
              item.references?.length ?? 0
            }`,
        )
        .join('|'),
    [messages],
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const messagesNode = messagesRef.current;
    if (!messagesNode) return;

    messagesNode.scrollTo({
      top: messagesNode.scrollHeight,
      behavior,
    });
  }, []);

  const pauseAutoScroll = useCallback(() => {
    autoScrollPausedRef.current = true;
  }, []);

  const resumeAutoScroll = useCallback(() => {
    autoScrollPausedRef.current = false;
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  useEffect(() => {
    if (autoScrollPausedRef.current) return;
    scrollToBottom();
  }, [pending, scrollToBottom, streamSignature]);

  return (
    <Flex className="welcome-page__box">
      <div className="welcome-page__messages" ref={messagesRef}>
        {messages.map((item) => (
          <div
            key={item.id}
            className={`welcome-page__message welcome-page__message--${item.role}`}
          >
            {item.role === 'user' ? (
              <div className="welcome-page__message-content">
                <div className="welcome-page__message-bubble">
                  {item.content}
                </div>
                <div className="welcome-page__message-actions">
                  <Tooltip title="复制">
                    <Button type="text" size="small" icon={<CopyOutlined />} />
                  </Tooltip>
                  <Tooltip title="编辑">
                    <Button type="text" size="small" icon={<EditOutlined />} />
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="welcome-page__message-content">
                <RecallPanel
                  thinking={item.thinking}
                  references={item.references}
                  onMouseEnter={pauseAutoScroll}
                  onMouseLeave={resumeAutoScroll}
                />
                <div className="welcome-page__message-bubble">
                  {item.content ? (
                    <MarkdownMessage content={item.content} />
                  ) : null}
                </div>
              </div>
            )}
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
};

export default MessageList;
