import ReactMarkdown from 'react-markdown';

// Renders AI Markdown output with readable typography (light + dark)
export default function Markdown({ children }) {
  return (
    <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
