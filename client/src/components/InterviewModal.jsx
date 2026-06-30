import { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

// "I got an interview" — sets the interview date (future allowed) + notes, moves status to interview.
export default function InterviewModal({ job, onClose, onSave }) {
  const [interviewAt, setInterviewAt] = useState(job?.interviewAt || today());
  const [notes, setNotes] = useState(job?.notes || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({ status: 'interview', interviewAt, notes });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save');
      setSaving(false);
    }
  };

  const input =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white';
  const label = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">🎉 Interview scheduled</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {job.title} @ {job.company}
        </p>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className={label}>Interview date</label>
            <input type="date" value={interviewAt} min={today()} onChange={(e) => setInterviewAt(e.target.value)} required className={input} />
            <p className="mt-1 text-xs text-slate-400">Can be in the future — it's when the interview will happen.</p>
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              placeholder="Prep notes, who you're meeting, format… (AI Interview Prep can generate questions for you later)"
              className={input} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
