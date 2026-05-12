import { ArrowUpOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { COMPOSER_PLACEHOLDER } from '../constants';
import KnowledgePicker from './KnowledgePicker';

const { TextArea } = Input;

interface QuestionComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  knowledgeId?: string;
  onKnowledgeChange: (id: string | undefined) => void;
  disabled?: boolean;
}

const QuestionComposer = ({
  value,
  onChange,
  onSubmit,
  knowledgeId,
  onKnowledgeChange,
  disabled,
}: QuestionComposerProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (!disabled) onSubmit();
    }
  };

  const canSubmit = !disabled && !!value.trim();

  return (
    <div className="welcome-page__composer">
      <div className="welcome-page__composer-card">
        <TextArea
          className="welcome-page__composer-input"
          value={value}
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder={COMPOSER_PLACEHOLDER}
          variant="borderless"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            onChange(event.target.value)
          }
          onKeyDown={handleKeyDown}
        />
        <div className="welcome-page__composer-actions">
          <KnowledgePicker
            value={knowledgeId}
            onChange={(id) => onKnowledgeChange(id)}
          />
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
    </div>
  );
};

export default QuestionComposer;
