import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import CvDocument from '../components/CvDocument';
import AiLoader from '../components/AiLoader';

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
  const [loc, setLoc] = useState({ street: '', city: '', country: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [busy, setBusy] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [cvExpanded, setCvExpanded] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
      setDescription(res.data?.rawDescription || '');
      setLoc({ street: res.data?.street || '', city: res.data?.city || '', country: res.data?.country || '' });
    } catch {
      setError('Could not load profile');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 5000); };
  const fail = (err, fallback) => setError(err.response?.data?.error || fallback);

  const saveDescription = async () => {
    setBusy('desc'); setError('');
    try {
      const res = await api.put('/profile', { rawDescription: description });
      setProfile(res.data);
      flash('Description saved');
    } catch (err) { fail(err, 'Could not save'); } finally { setBusy(''); }
  };

  const saveLocation = async () => {
    setBusy('loc'); setError('');
    try {
      const res = await api.put('/profile', loc);
      setProfile(res.data);
      flash('Location saved');
    } catch (err) { fail(err, 'Could not save'); } finally { setBusy(''); }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation is not supported by your browser'); return; }
    setBusy('geoloc'); setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const a = data.address || {};
          setLoc({
            street: a.road || '',
            city: a.city || a.town || a.village || a.municipality || '',
            country: a.country || '',
          });
          flash('Location detected — review and Save');
        } catch {
          setError('Could not look up your address');
        } finally {
          setBusy('');
        }
      },
      () => { setError('Could not get your location (permission denied?)'); setBusy(''); }
    );
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setBusy('upload'); setError('');
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const res = await api.post('/profile/upload-cv', fd);
      // new CV → clear stale career paths locally (backend already cleared them)
      setProfile((p) => ({ ...(p || {}), cvText: res.data.cvText, careerPaths: null }));
      flash(`CV uploaded (${res.data.length} characters)`);
      if (fileRef.current) fileRef.current.value = '';
      setBusy('');
      await findPaths(); // auto-refresh career paths for the new CV
      return;
    } catch (err) { fail(err, 'Upload failed'); }
    setBusy(''); if (fileRef.current) fileRef.current.value = '';
  };

  const removeCv = async () => {
    if (!confirm('Remove the uploaded CV?')) return;
    setBusy('removeCv'); setError('');
    try {
      await api.put('/profile', { cvText: null });
      // removing the CV also invalidates the career paths derived from it
      setProfile((p) => ({ ...(p || {}), cvText: null, careerPaths: null }));
      flash('Uploaded CV removed');
    } catch (err) { fail(err, 'Could not remove'); } finally { setBusy(''); }
  };

  const deleteGeneratedCv = async () => {
    if (!confirm('Delete the AI-generated CV?')) return;
    setBusy('delGen'); setError('');
    try {
      await api.delete('/profile/generated-cv');
      setProfile((p) => ({ ...(p || {}), generatedCv: null }));
      flash('Generated CV deleted');
    } catch (err) { fail(err, 'Could not delete'); } finally { setBusy(''); }
  };

  // Promote the generated draft to the active CV (cvText) used for fit/tailor/career
  const adoptGeneratedCv = async () => {
    if (profile?.cvText && !confirm('This will replace your current CV with the generated one. Continue?')) return;
    setBusy('adopt'); setError('');
    try {
      const generated = profile.generatedCv;
      await api.put('/profile', { cvText: generated });
      await api.delete('/profile/generated-cv');
      setProfile((p) => ({ ...(p || {}), cvText: generated, generatedCv: null, careerPaths: null }));
      flash('Saved as your CV');
      setBusy('');
      await findPaths(); // refresh career paths for the new CV
      return;
    } catch (err) { fail(err, 'Could not save'); }
    setBusy('');
  };

  const saveCvText = async () => {
    setBusy('pasteSave'); setError('');
    try {
      const res = await api.put('/profile', { cvText: pasteText });
      setProfile((p) => ({ ...(p || {}), cvText: res.data.cvText, careerPaths: null }));
      setPasteOpen(false); setPasteText('');
      flash('CV text saved');
      setBusy('');
      await findPaths(); // auto-refresh career paths for the new CV
      return;
    } catch (err) { fail(err, 'Could not save'); }
    setBusy('');
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files?.[0]); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragOver(false); };

  const runAI = async (key, fn) => {
    setBusy(key); setError('');
    try { await fn(); } catch (err) { fail(err, 'AI request failed'); } finally { setBusy(''); }
  };

  const generateCv = () => runAI('gen', async () => {
    const res = await api.post('/ai/generate-cv');
    setProfile((p) => ({ ...(p || {}), generatedCv: res.data.generatedCv }));
    flash('CV generated');
  });

  const improveCv = (mode) => runAI(`improve-${mode}`, async () => {
    const res = await api.post('/ai/improve-cv', { mode });
    setSuggestions(res.data.suggestions);
  });

  const findPaths = () => runAI('paths', async () => {
    const res = await api.post('/ai/career-paths');
    setProfile((p) => ({ ...(p || {}), careerPaths: res.data }));
  });

  if (loading) return <div className="text-slate-400">Loading profile…</div>;

  const hasInput = !!(profile?.cvText || profile?.generatedCv || profile?.rawDescription);
  const hasCv = !!(profile?.cvText || profile?.generatedCv);
  const paths = profile?.careerPaths;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile</h1>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss" className="text-lg leading-none hover:opacity-70">×</button>
        </div>
      )}
      {msg && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} aria-label="Dismiss" className="text-lg leading-none hover:opacity-70">×</button>
        </div>
      )}

      {/* ── About you ── */}
      <section className={card}>
        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">About you</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Describe your background in free text. The AI uses this to generate a CV and suggest career paths.
        </p>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={5000}
          placeholder="e.g. Junior full-stack dev. React, Node, Python, SQL. Built a supermarket app and a crypto tracker. John Bryce grad 2026…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400">{description.length}/5000</span>
          <div className="ml-auto flex gap-2">
            <button onClick={saveDescription} disabled={busy === 'desc'} className={btnOutline}>
              {busy === 'desc' ? 'Saving…' : 'Save'}
            </button>
            <button onClick={generateCv} disabled={!!busy || !profile?.rawDescription} className={btn}
              title={!profile?.rawDescription ? 'Save a description first' : ''}>
              ✨ Generate CV
            </button>
          </div>
        </div>
        {busy === 'gen' && <AiLoader label="Writing your CV" />}

        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              📍 Your location <span className="font-normal text-slate-400">— pins you on the job map to gauge proximity</span>
            </label>
            <button onClick={useCurrentLocation} disabled={busy === 'geoloc'} className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400">
              {busy === 'geoloc' ? 'Detecting…' : '📡 Use current location'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input value={loc.city} onChange={(e) => setLoc({ ...loc, city: e.target.value })} placeholder="City"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
            <input value={loc.country} onChange={(e) => setLoc({ ...loc, country: e.target.value })} placeholder="Country"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
            <input value={loc.street} onChange={(e) => setLoc({ ...loc, street: e.target.value })} placeholder="Street (optional)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </div>
          <div className="mt-2 flex justify-end">
            <button onClick={saveLocation} disabled={busy === 'loc'} className={btnOutline}>
              {busy === 'loc' ? 'Saving…' : 'Save location'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Your CV & career fit ── */}
      <section className={card}>
        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Your CV & career fit</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Upload an existing CV or use the generated one — then see which roles fit you.
        </p>

        {/* Drag-and-drop upload */}
        <div
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
              : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
          }`}
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {busy === 'upload' ? 'Uploading…' : '📄 Drag a PDF/DOCX here, or click to browse'}
          </p>
          <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={(e) => uploadFile(e.target.files?.[0])} className="hidden" />
        </div>

        {busy === 'upload' && <AiLoader label="Reading your CV (designed PDFs take a little longer)" />}

        {/* Manual fallback for PDFs that don't extract well (image-based / heavily designed) */}
        <button onClick={() => setPasteOpen((v) => !v)} className="mt-2 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          {pasteOpen ? 'Cancel' : '📝 Or paste CV text instead'}
        </button>
        {pasteOpen && (
          <div className="mt-2">
            <textarea
              value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={6} maxLength={20000}
              placeholder="Paste your CV text here (useful if a PDF doesn't read well)…"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">{pasteText.length}/20000</span>
              <button onClick={saveCvText} disabled={busy === 'pasteSave' || !pasteText.trim()} className={btn}>
                {busy === 'pasteSave' ? 'Saving…' : 'Save CV text'}
              </button>
            </div>
          </div>
        )}

        {profile?.cvText && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                📄 Your CV <span className="font-normal text-xs text-slate-400">· {profile.cvText.length.toLocaleString()} chars</span>
              </span>
              <button onClick={removeCv} disabled={busy === 'removeCv'} className="text-xs font-medium text-red-500 hover:underline">
                {busy === 'removeCv' ? 'Removing…' : 'Remove'}
              </button>
            </div>
            <p className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300 ${cvExpanded ? 'max-h-96 overflow-y-auto' : 'line-clamp-[8]'}`}>
              {profile.cvText}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <button onClick={() => setCvExpanded((v) => !v)} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                {cvExpanded ? 'Show less' : 'Show more'}
              </button>
              <span className="text-slate-400">Re-upload above to replace</span>
            </div>
          </div>
        )}

        {profile?.generatedCv && (
          <details open className="mt-4 rounded-md border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400">✨ Generated CV — draft (click to collapse)</summary>
            <div className="mt-3">
              <CvDocument markdown={profile.generatedCv} filename="my-cv" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={adoptGeneratedCv} disabled={busy === 'adopt'}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                {busy === 'adopt' ? 'Saving…' : '✓ Use as my CV'}
              </button>
              <button onClick={deleteGeneratedCv} disabled={busy === 'delGen'}
                className="text-xs font-medium text-red-500 hover:underline">
                {busy === 'delGen' ? 'Deleting…' : 'Discard'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              “Use as my CV” makes this your active CV — used for fit analysis, tailoring &amp; career paths.
            </p>
          </details>
        )}

        {/* Improve actions */}
        {hasCv && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => improveCv('quick')} disabled={!!busy} className={btnOutline}>⚡ Quick tips</button>
            <button onClick={() => improveCv('detailed')} disabled={!!busy} className={btnOutline}>🔍 Detailed review</button>
          </div>
        )}
        {busy.startsWith('improve') && <AiLoader label="Reviewing your CV" />}

        {suggestions && (
          <details open className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <summary className="cursor-pointer text-sm font-semibold text-amber-700 dark:text-amber-400">Improvement suggestions (click to collapse)</summary>
            <div className="mt-2 max-h-96 overflow-y-auto"><Markdown>{suggestions}</Markdown></div>
            <button onClick={() => setSuggestions('')} className="mt-2 text-xs text-slate-400 hover:underline">Dismiss</button>
          </details>
        )}

        {/* Career paths — only meaningful when there's input backing them */}
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Career paths</h3>
            <button onClick={findPaths} disabled={!!busy || !hasInput} className={btn}
              title={!hasInput ? 'Add a description or CV first' : ''}>
              {busy === 'paths' ? 'Finding…' : paths ? 'Refresh' : 'Find my paths'}
            </button>
          </div>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">AI-suggested roles that fit your profile, plus skills to grow.</p>

          {busy === 'paths' && <AiLoader label="Matching you to roles" />}

          {!hasInput ? (
            <div className="py-8 text-center text-sm text-slate-400">Add a description or upload a CV above to discover fitting roles.</div>
          ) : !paths ? (
            <div className="py-8 text-center text-sm text-slate-400">Click “Find my paths” to see fitting roles.</div>
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
                  <h4 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Skills to grow</h4>
                  <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-400">
                    {paths.upskill.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
