import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

// Renders AI Markdown output with readable typography (light + dark).
// remark-breaks keeps single newlines as line breaks so plain-text CVs display right too.
export default function Markdown({ children }) {
  return (
    <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{children}</ReactMarkdown>
    </div>
  );
}
