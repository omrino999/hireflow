import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge, { STATUSES } from '../components/StatusBadge';
import JobFormModal from '../components/JobFormModal';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch {
      setError('Could not load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (payload) => {
    if (editing) {
      const res = await api.put(`/jobs/${editing.id}`, payload);
      setJobs((prev) => prev.map((j) => (j.id === editing.id ? res.data : j)));
    } else {
      const res = await api.post('/jobs', payload);
      setJobs((prev) => [res.data, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job application?')) return;
    await api.delete(`/jobs/${id}`);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (job) => { setEditing(job); setModalOpen(true); };

  const visible = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  const daysSince = (date) =>
    date ? Math.floor((Date.now() - new Date(date)) / 86400000) : null;

  if (loading) return <div className="text-slate-400">Loading jobs…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
        <button onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          + Add job
        </button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}>
            {s}{s !== 'all' && ` (${jobs.filter((j) => j.status === s).length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400 dark:border-slate-700">
          {jobs.length === 0 ? 'No applications yet. Add your first job!' : 'No jobs in this status.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((job) => (
            <div key={job.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                    {job.title}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{job.company}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                {job.appliedAt && <span>Applied {daysSince(job.appliedAt)}d ago</span>}
                {job.interviewAt && <span>Interview: {job.interviewAt}</span>}
                {job.fitScore != null && <span className="font-medium text-indigo-500">Fit {job.fitScore}/100</span>}
              </div>

              <div className="mt-3 flex gap-3 text-sm">
                <Link to={`/jobs/${job.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Open</Link>
                <button onClick={() => openEdit(job)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Edit</button>
                <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <JobFormModal
          job={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
