import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Markdown from '../components/Markdown';

const MATCH_STYLES = {
  strong: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  stretch: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const card = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800';
const btn = 'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50';
const btnOutline = 'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [busy, setBusy] = useState(''); // which action is running
  const fileRef = useRef();

  const load = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
      setDescription(res.data?.rawDescription || '');
    } catch {
      setError('Could not load profile');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };
  const fail = (err, fallback) => setError(err.response?.data?.error || fallback);

  const saveDescription = async () => {
    setBusy('desc'); setError('');
    try {
      const res = await api.put('/profile', { rawDescription: description });
      setProfile(res.data);
      flash('Description saved');
    } catch (err) { fail(err, 'Could not save'); } finally { setBusy(''); }
  };

  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy('upload'); setError('');
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const res = await api.post('/profile/upload-cv', fd);
      setProfile((p) => ({ ...(p || {}), cvText: res.data.cvText }));
      flash(`CV uploaded (${res.data.length} characters)`);
    } catch (err) { fail(err, 'Upload failed'); } finally { setBusy(''); if (fileRef.current) fileRef.current.value = ''; }
  };

  const runAI = async (key, fn) => {
    setBusy(key); setError('');
    try { await fn(); } catch (err) { fail(err, 'AI request failed'); } finally { setBusy(''); }
  };

  const generateCv = () => runAI('gen', async () => {
    const res = await api.post('/ai/generate-cv');
    setProfile((p) => ({ ...(p || {}), generatedCv: res.data.generatedCv }));
    flash('CV generated');
  });

  const improveCv = () => runAI('improve', async () => {
    const res = await api.post('/ai/improve-cv');
    setSuggestions(res.data.suggestions);
  });

  const findPaths = () => runAI('paths', async () => {
    const res = await api.post('/ai/career-paths');
    setProfile((p) => ({ ...(p || {}), careerPaths: res.data }));
  });

  if (loading) return <div className="text-slate-400">Loading profile…</div>;

  const hasCv = profile?.cvText || profile?.generatedCv;
  const paths = profile?.careerPaths;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile</h1>

      {error && <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}
      {msg && <div className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{msg}</div>}

      {/* About you */}
      <section className={card}>
        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">About you</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          A free-text description of your background. The AI uses this to generate a CV and suggest career paths.
        </p>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={5000}
          placeholder="e.g. Junior full-stack dev. React, Node, Python, SQL. Built a supermarket app and a crypto tracker. John Bryce grad 2026…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">{description.length}/5000</span>
          <button onClick={saveDescription} disabled={busy === 'desc'} className={btn}>
            {busy === 'desc' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>

      {/* Your CV */}
      <section className={card}>
        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Your CV</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Upload an existing CV (PDF or DOCX), or generate one from your description.
        </p>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => fileRef.current?.click()} disabled={busy === 'upload'} className={btnOutline}>
            {busy === 'upload' ? 'Uploading…' : '📄 Upload CV (PDF/DOCX)'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={onUpload} className="hidden" />

          <button onClick={generateCv} disabled={busy === 'gen' || !profile?.rawDescription} className={btnOutline}
            title={!profile?.rawDescription ? 'Save a description first' : ''}>
            {busy === 'gen' ? 'Generating…' : '✨ Generate from description'}
          </button>

          {hasCv && (
            <button onClick={improveCv} disabled={busy === 'improve'} className={btnOutline}>
              {busy === 'improve' ? 'Analyzing…' : '🔍 Get improvement suggestions'}
            </button>
          )}
        </div>

        {profile?.cvText && (
          <details className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">Uploaded CV text</summary>
            <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-400">{profile.cvText}</pre>
          </details>
        )}

        {profile?.generatedCv && (
          <div className="mt-4 rounded-md border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">AI-generated CV</h3>
            <Markdown>{profile.generatedCv}</Markdown>
          </div>
        )}

        {suggestions && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <h3 className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">Improvement suggestions</h3>
            <Markdown>{suggestions}</Markdown>
          </div>
        )}
      </section>

      {/* Career paths */}
      <section className={card}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Career paths</h2>
          <button onClick={findPaths} disabled={busy === 'paths' || !hasCv} className={btn}
            title={!hasCv ? 'Add a CV or description first' : ''}>
            {busy === 'paths' ? 'Finding…' : paths ? 'Refresh' : 'Find my paths'}
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          AI-suggested roles that fit your profile, plus skills to grow.
        </p>

        {!paths ? (
          <div className="py-8 text-center text-sm text-slate-400">Run the analysis to see fitting roles.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              {paths.roles?.map((r, i) => (
                <div key={i} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">{r.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${MATCH_STYLES[r.matchLevel] || MATCH_STYLES.stretch}`}>
                      {r.matchLevel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.reasoning}</p>
                </div>
              ))}
            </div>
            {paths.upskill?.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Skills to grow</h3>
                <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-400">
                  {paths.upskill.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
