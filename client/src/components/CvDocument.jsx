import { useRef, useState } from 'react';
import Markdown from './Markdown';
import { downloadPdf, downloadDoc, copyText } from '../utils/exportCv';

const chip =
  'rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700';

// Renders AI CV Markdown with Copy / PDF / Word export. Reusable across pages.
export default function CvDocument({ markdown, filename = 'cv' }) {
  const ref = useRef();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await copyText(markdown);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2 text-xs">
        <button onClick={copy} className={chip}>{copied ? '✓ Copied' : 'Copy'}</button>
        <button onClick={() => downloadPdf(ref.current, filename)} className={chip}>Download PDF</button>
        <button onClick={() => downloadDoc(ref.current, filename)} className={chip}>Download Word</button>
      </div>
      <div ref={ref} className="max-h-96 overflow-y-auto">
        <Markdown>{markdown}</Markdown>
      </div>
    </div>
  );
}
