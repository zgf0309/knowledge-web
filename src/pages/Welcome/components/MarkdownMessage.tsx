import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage = ({ content }: MarkdownMessageProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkBreaks]}
  >
    {content}
  </ReactMarkdown>
);

export default MarkdownMessage;
