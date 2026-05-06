import type { ChatMessageItem } from '../types';
import AssistantHero from './AssistantHero';
import MessageList from './MessageList';

interface WelcomeChatContentProps {
  messages: ChatMessageItem[];
  historyLoading?: boolean;
  sending?: boolean;
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

const WelcomeChatContent = ({
  messages,
  historyLoading,
  sending,
  suggestions,
  onSuggestionClick,
}: WelcomeChatContentProps) => {
  if (messages.length > 0) {
    return (
      <MessageList
        messages={messages}
        loading={historyLoading}
        pending={sending}
      />
    );
  }

  return (
    <AssistantHero
      suggestions={suggestions}
      onSuggestionClick={onSuggestionClick}
    />
  );
};

export default WelcomeChatContent;
