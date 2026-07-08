import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import JobFormModal from '../components/JobFormModal';
import InterviewModal from '../components/InterviewModal';
import AiLoader from '../components/AiLoader';
import CvDocument from '../components/CvDocument';

const card = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800';
const btn = 'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50';
const btnOutline = 'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';

const scoreColor = (s) =>
  s >= 75 ? 'text-green-600 dark:text-green-400'
  : s >= 50 ? 'text-amber-600 dark:text-amber-400'
  : 'text-red-600 dark:text-red-400';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch {
      setError('Job not found');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  const fail = (err, fallback) => setError(err.response?.data?.error || fallback);

  const handleEditSave = async (payload) => {
    const res = await api.put(`/jobs/${id}`, payload);
    setJob(res.data);
    setEditOpen(false);
  };
  const handleInterviewSave = async (payload) => {
    const res = await api.put(`/jobs/${id}`, payload);
    setJob(res.data);
    setInterviewOpen(false);
  };
  const handleDelete = async () => {
    if (!confirm('Delete this job application?')) return;
    await api.delete(`/jobs/${id}`);
    navigate('/jobs');
  };

  const toggleFavorite = async () => {
    const next = !job.isFavorite;
    setJob((j) => ({ ...j, isFavorite: next }));
    try { await api.put(`/jobs/${id}`, { isFavorite: next }); }
    catch { setJob((j) => ({ ...j, isFavorite: !next })); }
  };

  const runAI = async (key, fn) => {
    setBusy(key); setError('');
    try { await fn(); } catch (err) { fail(err, 'AI request failed'); } finally { setBusy(''); }
  };

  const runFit = () => runAI('fit', async () => {
    const res = await api.post(`/ai/fit-analysis/${id}`);
    setJob((j) => ({ ...j, fitScore: res.data.score, fitAnalysis: res.data }));
  });
  const runTailor = () => runAI('tailor', async () => {
    const res = await api.post(`/ai/tailor-cv/${id}`);
    setJob((j) => ({ ...j, tailoredCv: res.data.tailoredCv }));
  });
  const runInterview = () => runAI('interview', async () => {
    const res = await api.post(`/ai/interview-prep/${id}`);
    setJob((j) => ({ ...j, interviewQuestions: res.data.questions }));
  });

  if (loading) return <div className="text-slate-400">Loading…</div>;
  if (!job) return <div className="text-red-500">{error || 'Job not found'}</div>;

  const fit = job.fitAnalysis;
  const hasDescription = !!job.description;

  return (
    <div className="space-y-6">
      <Link to="/jobs" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">← Back to jobs</Link>

      {error && <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}

      {/* Header / job info */}
      <section className={card}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <button
              onClick={toggleFavorite}
              aria-label={job.isFavorite ? 'Unfavorite' : 'Favorite'}
              title={job.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`mt-1 text-xl leading-none ${job.isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'}`}
            >
              {job.isFavorite ? '★' : '☆'}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
              <p className="text-slate-500 dark:text-slate-400">{job.company}</p>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          {job.location && <span>📍 {job.location}</span>}
          {job.salary != null && <span>💰 {job.salary.toLocaleString()} <span className="text-xs text-slate-400">/mo</span></span>}
          {job.appliedAt && <span>Applied: {job.appliedAt}</span>}
          {job.interviewAt && <span className="text-amber-500">Interview: {job.interviewAt}</span>}
          {job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">View posting ↗</a>}
        </div>

        {job.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{job.notes}</p>}

        {job.description && (
          <details className="mt-3 rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">Job description</summary>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{job.description}</p>
          </details>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setEditOpen(true)} className={btnOutline}>Edit</button>
          {['saved', 'applied', 'interview'].includes(job.status) && (
            <button onClick={() => setInterviewOpen(true)} className={btnOutline}>
              {job.status === 'interview' ? '📅 Interview details' : '🎉 I got an interview'}
            </button>
          )}
          <button onClick={handleDelete} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Delete</button>
        </div>
      </section>

      {!hasDescription && (
        <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Add a <strong>job description</strong> (via Edit) to unlock the AI features below.
        </div>
      )}

      {/* AI: Fit analysis */}
      <section className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">🎯 Fit analysis</h2>
          <button onClick={runFit} disabled={busy === 'fit' || !hasDescription} className={btn}>
            {busy === 'fit' ? 'Analyzing…' : fit ? 'Re-analyze' : 'Analyze fit'}
          </button>
        </div>
        {busy === 'fit' && <AiLoader label="Scoring your fit" />}
        {!fit ? (
          <p className="py-4 text-sm text-slate-400">See how your CV matches this role — score, strengths, and gaps.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${scoreColor(fit.score)}`}>{fit.score}</span>
              <span className="text-slate-400">/ 100 match</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{fit.summary}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-green-600 dark:text-green-400">Strengths</h3>
                <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-400">
                  {fit.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-amber-600 dark:text-amber-400">Gaps</h3>
                <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-400">
                  {fit.gaps?.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* AI: Tailored CV */}
      <section className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">✏️ Tailored CV</h2>
          <button onClick={runTailor} disabled={busy === 'tailor' || !hasDescription} className={btn}>
            {busy === 'tailor' ? 'Tailoring…' : job.tailoredCv ? 'Re-tailor' : 'Tailor my CV for this job'}
          </button>
        </div>
        {busy === 'tailor' && <AiLoader label="Tailoring your CV" />}
        {!job.tailoredCv ? (
          <p className="py-4 text-sm text-slate-400">Rewrite your CV to emphasize what matters for this specific role.</p>
        ) : (
          <CvDocument markdown={job.tailoredCv} filename={`cv-${job.company}`.replace(/\s+/g, '-').toLowerCase()} />
        )}
      </section>

      {/* AI: Interview prep */}
      <section className={card}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">🎤 Interview prep</h2>
          <button onClick={runInterview} disabled={busy === 'interview' || !hasDescription} className={btn}>
            {busy === 'interview' ? 'Generating…' : job.interviewQuestions?.length ? 'Regenerate' : 'Generate questions'}
          </button>
        </div>
        {busy === 'interview' && <AiLoader label="Preparing questions" />}
        {!job.interviewQuestions?.length ? (
          <p className="py-4 text-sm text-slate-400">Likely interview questions for this role, with suggested answers.</p>
        ) : (
          <div className="space-y-2">
            {job.interviewQuestions.map((q, i) => (
              <details key={i} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <summary className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                  <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500 dark:bg-slate-700 dark:text-slate-300">{q.category}</span>
                  {q.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{q.suggestedAnswer}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      {editOpen && <JobFormModal job={job} onClose={() => setEditOpen(false)} onSave={handleEditSave} />}
      {interviewOpen && <InterviewModal job={job} onClose={() => setInterviewOpen(false)} onSave={handleInterviewSave} />}
    </div>
  );
}
