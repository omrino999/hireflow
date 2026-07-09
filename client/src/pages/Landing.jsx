import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HIGHLIGHTS = [
  ['🎯', 'AI fit analysis', 'Know how well you match a role before you apply.'],
  ['✏️', 'Tailored CVs', 'A CV reshaped for each specific job, in seconds.'],
  ['🎤', 'Interview prep', 'Practice with role-specific questions and answers.'],
];

export default function Landing() {
  const { user, loading } = useAuth();
  // logged-in users shouldn't see the guest landing page
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
          AI-powered job search
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Land your next job,{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            faster
          </span>
          .
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Track every application, get an AI fit score for each role, tailor your CV per job,
          and prep for interviews — all in one place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
          >
            Get started free
          </Link>
          <Link
            to="/about"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Learn more
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map(([icon, title, desc]) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="text-2xl">{icon}</div>
            <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
