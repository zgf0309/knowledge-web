import { PageContainer } from '@ant-design/pro-components';
import { message } from 'antd';
import { useCallback } from 'react';
import HistorySidebar from './components/HistorySidebar';
import QuestionComposer from './components/QuestionComposer';
import WelcomeChatContent from './components/WelcomeChatContent';
import { useAssistantHome } from './hooks/useAssistantHome';
import { useChatSession } from './hooks/useChatSession';
import './index.less';

const KnowledgeWelcomePage = () => {
  const [messageApi, messageContextHolder] = message.useMessage();
  const {
    historyCollapsed,
    conversations,
    toggleHistory,
    createConversation,
    question,
    setQuestion,
    knowledgeId,
    setKnowledgeId,
    suggestions,
    refreshSuggestions,
  } = useAssistantHome();
  const {
    conversationId,
    messages,
    historyLoading,
    creating,
    sending,
    resetSession,
    loadConversation,
    submitQuestion,
  } = useChatSession();
  const hasConversationMessages = messages.length > 0;

  const handleSubmit = useCallback(async () => {
    const content = question.trim();
    if (!content) return;

    if (!knowledgeId) {
      messageApi.warning('请选择一个知识库');
      return;
    }

    try {
      const isNewConversation = !conversationId;
      const nextConversationId = await submitQuestion({
        content,
        kbId: knowledgeId,
      });

      setQuestion('');

      if (isNewConversation) {
        createConversation(content.slice(0, 20), nextConversationId);
      }
    } catch (err: any) {
      messageApi.error(err?.message ?? '提交失败，请稍后重试');
    }
  }, [
    conversationId,
    createConversation,
    knowledgeId,
    messageApi,
    question,
    setQuestion,
    submitQuestion,
  ]);

  const handleNewConversation = useCallback(() => {
    resetSession();
    setQuestion('');
    refreshSuggestions();
  }, [refreshSuggestions, resetSession, setQuestion]);

  return (
    <PageContainer
      className="welcome-page"
      title={false}
      pageHeaderRender={false}
      ghost
    >
      {messageContextHolder}
      <div className="welcome-page__layout">
        <HistorySidebar
          collapsed={historyCollapsed}
          conversations={conversations}
          activeId={conversationId}
          onToggle={toggleHistory}
          onCreate={handleNewConversation}
          onSelect={loadConversation}
        />
        <main
          className={`welcome-page__main${
            hasConversationMessages ? ' welcome-page__main--conversation' : ''
          }`}
        >
          <div
            className={`welcome-page__center${
              hasConversationMessages
                ? ' welcome-page__center--conversation'
                : ''
            }`}
          >
            <WelcomeChatContent
              messages={messages}
              historyLoading={historyLoading}
              sending={sending}
              suggestions={suggestions}
              onSuggestionClick={setQuestion}
            />
            <QuestionComposer
              value={question}
              onChange={setQuestion}
              onSubmit={handleSubmit}
              knowledgeId={knowledgeId}
              onKnowledgeChange={setKnowledgeId}
              disabled={creating || sending}
            />
          </div>
        </main>
      </div>
    </PageContainer>
  );
};

export default KnowledgeWelcomePage;
