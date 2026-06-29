import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
        Land your next job, <span className="text-indigo-600 dark:text-indigo-400">faster</span>.
      </h1>
      <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
        Track every application, get an AI fit score for each role, tailor your CV per job,
        and prep for interviews — all in one place.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/register"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Get started free
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
