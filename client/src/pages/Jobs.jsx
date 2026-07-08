import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge, { STATUSES } from '../components/StatusBadge';
import JobFormModal from '../components/JobFormModal';
import InterviewModal from '../components/InterviewModal';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState([]); // empty = show all
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [interviewJob, setInterviewJob] = useState(null);

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

  const handleInterviewSave = async (payload) => {
    const res = await api.put(`/jobs/${interviewJob.id}`, payload);
    setJobs((prev) => prev.map((j) => (j.id === interviewJob.id ? res.data : j)));
    setInterviewJob(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job application?')) return;
    await api.delete(`/jobs/${id}`);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const toggleFavorite = async (job) => {
    // optimistic update
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isFavorite: !j.isFavorite } : j)));
    try {
      await api.put(`/jobs/${job.id}`, { isFavorite: !job.isFavorite });
    } catch {
      // revert on failure
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isFavorite: job.isFavorite } : j)));
    }
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (job) => { setEditing(job); setModalOpen(true); };

  // Multi-select: toggle a status in/out of the active set
  const toggleFilter = (s) =>
    setFilters((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const visible = filters.length === 0 ? jobs : jobs.filter((j) => filters.includes(j.status));

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

      {/* Multi-select filter tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setFilters([])}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            filters.length === 0
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}>
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => toggleFilter(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
              filters.includes(s)
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}>
            {s} ({jobs.filter((j) => j.status === s).length})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400 dark:border-slate-700">
          {jobs.length === 0 ? 'No applications yet. Add your first job!' : 'No jobs match these filters.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((job) => {
            const canSchedule = ['saved', 'applied', 'interview'].includes(job.status);
            return (
              <div key={job.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => toggleFavorite(job)}
                      aria-label={job.isFavorite ? 'Unfavorite' : 'Favorite'}
                      title={job.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className={`mt-1 text-lg leading-none ${job.isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'}`}
                    >
                      {job.isFavorite ? '★' : '☆'}
                    </button>
                    <div>
                      <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                        {job.title}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{job.company}</p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {job.appliedAt && <span>Applied {daysSince(job.appliedAt)}d ago</span>}
                  {job.interviewAt && <span className="text-amber-500">Interview: {job.interviewAt}</span>}
                  {job.fitScore != null && <span className="font-medium text-indigo-500">Fit {job.fitScore}/100</span>}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <Link to={`/jobs/${job.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Open</Link>
                  {canSchedule && (
                    <button onClick={() => setInterviewJob(job)}
                      className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600">
                      {job.status === 'interview' ? '📅 Interview details' : '🎉 I got an interview'}
                    </button>
                  )}
                  <button onClick={() => openEdit(job)} className="font-medium text-amber-600 hover:underline dark:text-amber-400">Edit</button>
                  <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <JobFormModal job={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />
      )}
      {interviewJob && (
        <InterviewModal job={interviewJob} onClose={() => setInterviewJob(null)} onSave={handleInterviewSave} />
      )}
    </div>
  );
}
