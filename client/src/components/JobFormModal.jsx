import { useState } from 'react';
import { STATUSES } from './StatusBadge';

const today = () => new Date().toISOString().slice(0, 10);
const APPLIED_OR_LATER = ['applied', 'interview', 'offer', 'rejected'];

// Modal for creating or editing a job. `job` null = create mode.
export default function JobFormModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    company: job?.company || '',
    title: job?.title || '',
    jobUrl: job?.jobUrl || '',
    city: job?.city || '',
    country: job?.country || '',
    street: job?.street || '',
    salary: job?.salary ?? '',
    description: job?.description || '',
    status: job?.status || 'saved',
    appliedAt: job?.appliedAt || '',
    notes: job?.notes || '',
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Applied date is a permanent fact: once set, it's locked (delete & re-add if wrong)
  const appliedLocked = !!job?.appliedAt;
  const showApplied = APPLIED_OR_LATER.includes(form.status);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onStatusChange = (e) => {
    const status = e.target.value;
    setForm((f) => {
      const next = { ...f, status };
      // auto-default applied date to today the moment a job becomes "applied" or later
      if (APPLIED_OR_LATER.includes(status) && !next.appliedAt) next.appliedAt = today();
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        company: form.company,
        title: form.title,
        jobUrl: form.jobUrl,
        city: form.city || null,
        country: form.country || null,
        street: form.street || null,
        salary: form.salary === '' ? null : Number(form.salary),
        description: form.description,
        status: form.status,
        notes: form.notes,
      };
      // Send applied date only when relevant and not locked (locked = preserve existing).
      // interviewAt is intentionally NOT sent here — it's managed by the interview modal.
      if (showApplied && !appliedLocked && form.appliedAt) payload.appliedAt = form.appliedAt;
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>City</label>
              <input name="city" value={form.city} onChange={onChange} placeholder="e.g. Tel Aviv" className={input} />
            </div>
            <div>
              <label className={label}>Country</label>
              <input name="country" value={form.country} onChange={onChange} placeholder="e.g. Israel" className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Street <span className="font-normal text-slate-400">(optional)</span></label>
              <input name="street" value={form.street} onChange={onChange} placeholder="e.g. Rothschild Blvd" className={input} />
            </div>
            <div>
              <label className={label}>Salary <span className="font-normal text-slate-400">(monthly)</span></label>
              <input type="number" min="0" name="salary" value={form.salary} onChange={onChange} placeholder="e.g. 15000" className={input} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Status</label>
              <select name="status" value={form.status} onChange={onStatusChange} className={`${input} capitalize`}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {showApplied && (
              <div>
                <label className={label}>Applied date</label>
                {appliedLocked ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    {form.appliedAt} <span className="text-xs">(locked)</span>
                  </div>
                ) : (
                  <input type="date" name="appliedAt" value={form.appliedAt} max={today()} onChange={onChange} className={input} />
                )}
              </div>
            )}
          </div>

          <div>
            <label className={label}>Job description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={4}
              placeholder="Paste the job description (used for AI fit analysis & interview prep)" className={input} />
          </div>

          <div>
            <label className={label}>Personal notes</label>
            <textarea name="notes" value={form.notes} onChange={onChange} rows={2}
              placeholder="Your own notes & takeaways for this job (separate from the job description above)" className={input} />
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
