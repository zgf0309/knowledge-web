import { PageContainer } from '@ant-design/pro-components';
import { message } from 'antd';
import { getLocalStorage, StorageKeys } from '@/utils/storage';
import AssistantHero from './components/AssistantHero';
import HistorySidebar from './components/HistorySidebar';
import MessageList from './components/MessageList';
import QuestionComposer from './components/QuestionComposer';
import { ASSISTANT_MODES } from './constants';
import { useAssistantHome } from './useAssistantHome';
import { useChatSession } from './useChatSession';
import './index.less';

const KnowledgeWelcomePage = () => {
	const [messageApi, messageContextHolder] = message.useMessage();

	const userInfo = (getLocalStorage<{ tenant_id?: string }>(StorageKeys.CURRENT_USER) ?? {}) as {
		tenant_id?: string;
	};
	const tenantId = userInfo.tenant_id ?? '';

	const home = useAssistantHome();
	const chat = useChatSession();

	const handleSubmit = async () => {
		const trimmed = home.question.trim();
		if (!trimmed) return;
		if (!home.knowledgeId) {
			messageApi.warning('请选择一个知识库');
			return;
		}
		try {
			const isNewConversation = !chat.conversationId;
			const cid = await chat.submitQuestion({
				content: trimmed,
				kbId: home.knowledgeId,
			});
			home.setQuestion('');
			if (isNewConversation) {
				home.createConversation(trimmed.slice(0, 20), home.mode, cid);
			}
		} catch (err: any) {
			messageApi.error(err?.message ?? '提交失败，请稍后重试');
		}
	};

	const handleNewConversation = () => {
		chat.resetSession();
		home.setQuestion('');
		home.refreshSuggestions();
	};

	const handleSelectConversation = (id: string) => {
		chat.loadConversation(id);
	};

	const hasMessages = chat.messages.length > 0;

	return (
		<PageContainer className="welcome-page" title={false} ghost>
			{messageContextHolder}
			<div className="welcome-page__layout">
				<HistorySidebar
					collapsed={home.historyCollapsed}
					conversations={home.conversations}
					activeId={chat.conversationId}
					onToggle={home.toggleHistory}
					onCreate={handleNewConversation}
					onSelect={handleSelectConversation}
				/>
				<main className="welcome-page__main">
					<div className="welcome-page__center">
						{hasMessages ? (
							<MessageList
								messages={chat.messages}
								loading={chat.historyLoading}
								pending={chat.sending}
							/>
						) : (
							<AssistantHero
								suggestions={home.suggestions}
								onSuggestionClick={(text) => home.setQuestion(text)}
							/>
						)}
						<QuestionComposer
							modes={ASSISTANT_MODES}
							mode={home.mode}
							onModeChange={home.setMode}
							value={home.question}
							onChange={home.setQuestion}
							onSubmit={handleSubmit}
							tenantId={tenantId}
							knowledgeId={home.knowledgeId}
							onKnowledgeChange={home.setKnowledgeId}
							disabled={chat.creating || chat.sending}
						/>
					</div>
				</main>
			</div>
		</PageContainer>
	);
};

export default KnowledgeWelcomePage;
