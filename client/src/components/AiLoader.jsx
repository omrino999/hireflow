import { useState, useEffect } from 'react';

// Honest loading indicator for long AI calls: spinner + live elapsed seconds.
// We don't stream yet, so there's no real %; this reassures the user it's working.
export default function AiLoader({ label = 'Working' }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-3 flex items-center gap-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      <span>{label}… <span className="tabular-nums">{secs}s</span></span>
      <span className="ml-auto text-xs text-slate-400">large AI responses can take 10–30s</span>
    </div>
  );
}
