import { ArrowUpOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { AssistantMode, AssistantModeOption } from '../constants';
import KnowledgePicker from './KnowledgePicker';

const { TextArea } = Input;

interface QuestionComposerProps {
	modes: AssistantModeOption[];
	mode: AssistantMode;
	onModeChange: (mode: AssistantMode) => void;
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	tenantId: string;
	knowledgeId?: string;
	onKnowledgeChange: (id: string | undefined) => void;
	disabled?: boolean;
}

const QuestionComposer = ({
	modes,
	mode,
	onModeChange,
	value,
	onChange,
	onSubmit,
	tenantId,
	knowledgeId,
	onKnowledgeChange,
	disabled,
}: QuestionComposerProps) => {
	const currentMode = modes.find((item) => item.key === mode) ?? modes[0];

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			if (!disabled) onSubmit();
		}
	};

	const canSubmit = !disabled && !!value.trim();

	return (
		<div className="welcome-page__composer">
			<div className="welcome-page__composer-modes">
				{modes.map((item) => (
					<button
						type="button"
						key={item.key}
						className={`welcome-page__composer-mode${item.key === mode ? ' welcome-page__composer-mode--active' : ''}`}
						onClick={() => onModeChange(item.key)}
					>
						<span className="welcome-page__composer-mode-icon" aria-hidden>
							{item.icon}
						</span>
						{item.label}
					</button>
				))}
			</div>
			<div className="welcome-page__composer-card">
				<TextArea
					className="welcome-page__composer-input"
					value={value}
					autoSize={{ minRows: 2, maxRows: 6 }}
					placeholder={currentMode.placeholder}
					variant="borderless"
					onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<div className="welcome-page__composer-actions">
					{mode === 'qa' ? (
						<KnowledgePicker
							tenantId={tenantId}
							value={knowledgeId}
							onChange={(id) => onKnowledgeChange(id)}
						/>
					) : (
						<span />
					)}
					<Button
						type="primary"
						shape="circle"
						className="welcome-page__composer-send"
						icon={<ArrowUpOutlined />}
						disabled={!canSubmit}
						onClick={onSubmit}
						aria-label="发送"
					/>
				</div>
			</div>
			<p className="welcome-page__composer-tips">| 以上内容均由AI生成，仅供参考</p>
		</div>
	);
};

export default QuestionComposer;
