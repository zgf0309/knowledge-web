import { RightOutlined } from '@ant-design/icons';

interface AssistantHeroProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

const AssistantHero = ({
  suggestions,
  onSuggestionClick,
}: AssistantHeroProps) => (
  <div className="welcome-page__hero">
    <h1 className="welcome-page__hero-title">
      <span className="welcome-page__hero-title-ai">AI</span>
      <span className="welcome-page__hero-title-helper">助手</span>
    </h1>
    <div className="welcome-page__hero-suggestions">
      {suggestions.map((item, idx) => (
        <button
          type="button"
          key={item}
          className="welcome-page__hero-suggestion"
          onClick={() => onSuggestionClick(item)}
        >
          <span>{item}</span>
          {idx < suggestions.length - 1 ? (
            <span className="welcome-page__hero-suggestion-divider">|</span>
          ) : (
            <RightOutlined className="welcome-page__hero-suggestion-icon" />
          )}
        </button>
      ))}
    </div>
  </div>
);

export default AssistantHero;
