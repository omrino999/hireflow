import { useState } from 'react';
import { STATUSES } from './StatusBadge';

const EMPTY = {
  company: '', title: '', jobUrl: '', description: '',
  status: 'saved', appliedAt: '', interviewAt: '', notes: '',
};

// Modal for creating or editing a job. `job` null = create mode.
export default function JobFormModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (!job) return EMPTY;
    return {
      company: job.company || '', title: job.title || '', jobUrl: job.jobUrl || '',
      description: job.description || '', status: job.status || 'saved',
      appliedAt: job.appliedAt || '', interviewAt: job.interviewAt || '',
      notes: job.notes || '',
    };
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // strip empty date strings so we send null, not ""
      const payload = { ...form };
      if (!payload.appliedAt) delete payload.appliedAt;
      if (!payload.interviewAt) delete payload.interviewAt;
      await onSave(payload);
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
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          {job ? 'Edit job' : 'Add job'}
        </h2>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Company *</label>
              <input name="company" value={form.company} onChange={onChange} required className={input} />
            </div>
            <div>
              <label className={label}>Title *</label>
              <input name="title" value={form.title} onChange={onChange} required className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Job URL</label>
            <input name="jobUrl" value={form.jobUrl} onChange={onChange} placeholder="https://…" className={input} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Status</label>
              <select name="status" value={form.status} onChange={onChange} className={`${input} capitalize`}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Applied</label>
              <input type="date" name="appliedAt" value={form.appliedAt} onChange={onChange} className={input} />
            </div>
            <div>
              <label className={label}>Interview</label>
              <input type="date" name="interviewAt" value={form.interviewAt} onChange={onChange} className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Job description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={4}
              placeholder="Paste the job description (used for AI fit analysis & interview prep)" className={input} />
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={onChange} rows={2} className={input} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
