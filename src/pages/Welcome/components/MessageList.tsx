import {
  CheckCircleOutlined,
  CopyOutlined,
  DownOutlined,
  EditOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Button, Flex, Spin, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessageItem } from '../types';
import MarkdownMessage from './MarkdownMessage';

interface MessageListProps {
  messages: ChatMessageItem[];
  loading?: boolean;
  pending?: boolean;
}

const RecallPanel = ({
  thinking,
  thinkingTime,
  thinkingStatus,
  onMouseEnter,
  onMouseLeave,
}: {
  thinking?: string;
  thinkingTime?: number;
  thinkingStatus?: ChatMessageItem['thinkingStatus'];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const thinkingRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [thinkOpen, setThinkingOpen] = useState(true);
  const hasThinking = !!thinking;

  const durationText: number | string =
    thinkingTime === undefined
      ? ''
      : thinkingTime % 1 === 0
        ? String(thinkingTime)
        : thinkingTime.toFixed(0);
  const title = thinkingStatus === 'thinking' ? '思考中' : '已思考';
  const scrollThinkingToBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const thinkingNode = thinkingRef.current;
        if (!thinkingNode) return;

        thinkingNode.scrollTop = thinkingNode.scrollHeight;
      });
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setHovered(false);
    onMouseLeave?.();

    if (thinkingStatus === 'thinking') {
      scrollThinkingToBottom();
    }
  };

  useEffect(() => {
    const thinkingNode = thinkingRef.current;
    if (!thinkingNode || thinkingStatus !== 'thinking') return;

    const resizeObserver = new ResizeObserver(() => {
      if (!hovered) {
        scrollThinkingToBottom();
      }
    });

    resizeObserver.observe(thinkingNode);
    scrollThinkingToBottom();

    return () => {
      resizeObserver.disconnect();
    };
  }, [hovered, thinkingStatus, thinkOpen]);

  useEffect(() => {
    if (thinkingStatus !== 'thinking' || hovered || !thinkOpen) return;

    scrollThinkingToBottom();
  }, [hovered, thinking, thinkingStatus, thinkingTime, thinkOpen]);

  if (!hasThinking && thinkingTime === undefined) return null;

  return (
    <div
      className="welcome-page__recall"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="welcome-page__recall-title"
        onClick={(e) => {
          e.stopPropagation();
          setThinkingOpen(!thinkOpen);
        }}
      >
        <CheckCircleOutlined className="welcome-page__recall-title-icon" />
        <span>{title}</span>
        {durationText ? (
          <span className="welcome-page__recall-duration">
            （用时 {durationText} 秒）
          </span>
        ) : null}
        {!thinkOpen ? (
          <DownOutlined className="welcome-page__recall-arrow" />
        ) : (
          <UpOutlined className="welcome-page__recall-arrow" />
        )}
      </div>
      {thinkOpen && (
        <div className="welcome-page__recall-body">
          {hasThinking && (
            <div className="welcome-page__recall-thinking" ref={thinkingRef}>
              <MarkdownMessage content={thinking} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MessageList = ({ messages, pending }: MessageListProps) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const autoScrollPausedRef = useRef(false);
  const isThinkingStreaming = useMemo(
    () =>
      pending || messages.some((item) => item.thinkingStatus === 'thinking'),
    [messages, pending],
  );
  const streamSignature = useMemo(
    () =>
      messages
        .map(
          (item) =>
            `${item.id}:${item.content.length}:${item.thinking?.length ?? 0}:${item.thinkingTime ?? ''}:${item.thinkingStatus ?? ''}`,
        )
        .join('|'),
    [messages],
  );

  const scrollToBottom = useCallback(() => {
    const messagesNode = messagesRef.current;
    if (!messagesNode) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const nextNode = messagesRef.current;
        if (!nextNode) return;

        nextNode.scrollTop = nextNode.scrollHeight;
      });
    });
  }, []);

  const pauseAutoScroll = useCallback(() => {
    if (!isThinkingStreaming) return;
    autoScrollPausedRef.current = true;
  }, [isThinkingStreaming]);

  const resumeAutoScroll = useCallback(() => {
    if (!isThinkingStreaming) return;
    autoScrollPausedRef.current = false;
    scrollToBottom();
  }, [isThinkingStreaming, scrollToBottom]);

  useEffect(() => {
    if (!isThinkingStreaming || autoScrollPausedRef.current) return;
    scrollToBottom();
  }, [isThinkingStreaming, scrollToBottom, streamSignature]);

  return (
    <Flex className="welcome-page__box">
      <div className="welcome-page__messages" ref={messagesRef}>
        <div
          className="welcome-page__messages-box"
          onMouseEnter={pauseAutoScroll}
          onMouseLeave={resumeAutoScroll}
        >
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
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                <div className="welcome-page__message-content">
                  <RecallPanel
                    thinking={item.thinking}
                    thinkingTime={item.thinkingTime}
                    thinkingStatus={item.thinkingStatus}
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
      </div>
    </Flex>
  );
};

export default MessageList;
