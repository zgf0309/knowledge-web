import { type ComponentType, createElement } from 'react';
import * as ReactMarkdownModule from 'react-markdown';
import * as RemarkBreaksModule from 'remark-breaks';

interface MarkdownMessageProps {
  content: string;
}

const resolveFunctionExport = <T extends (...args: any[]) => any>(
  moduleValue: unknown,
): T | undefined => {
  const value = moduleValue as any;
  const candidates = [
    value,
    value?.default,
    value?.Markdown,
    value?.default?.default,
    value?.default?.Markdown,
  ];

  return candidates.find((candidate) => typeof candidate === 'function') as
    | T
    | undefined;
};

const ReactMarkdown =
  resolveFunctionExport<ComponentType<any>>(ReactMarkdownModule);
const remarkBreaks = resolveFunctionExport(RemarkBreaksModule);

const MarkdownMessage = ({ content }: MarkdownMessageProps) => {
  if (!ReactMarkdown) {
    return <div className="welcome-page__markdown-plain">{content}</div>;
  }

  return createElement(
    ReactMarkdown,
    {
      remarkPlugins: remarkBreaks ? [remarkBreaks] : [],
    },
    content,
  );
};

export default MarkdownMessage;
