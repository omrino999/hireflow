import { Link } from 'react-router-dom';

const card = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800';

const FEATURES = [
  ['📋 Application pipeline', 'Track every job through Saved → Applied → Interview → Offer → Rejected, with dates, notes, salary, and location.'],
  ['📄 AI CV tools', 'Generate a CV from a description, get improvement tips, and tailor your CV per job. Reads even image-based/designed PDFs via AI vision.'],
  ['🎯 AI fit analysis', 'Score how well your CV matches each role, with concrete strengths and gaps.'],
  ['🎤 AI interview prep', 'Role-specific interview questions with suggested answers, per job.'],
  ['🧭 Career paths', 'AI-suggested roles that fit your profile, plus skills to grow.'],
  ['📊 Dashboard', 'Stats, charts, favorites, and upcoming interviews at a glance.'],
];

const STACK = {
  Frontend: 'React (Vite), React Router, Tailwind CSS, Recharts',
  Backend: 'Node.js, Express, PostgreSQL, Sequelize ORM',
  AI: 'Claude (Anthropic API) — structured outputs, vision, prompt caching',
  'Auth & Security': 'JWT, bcrypt, rate limiting, owner-scoped data',
  Tooling: 'Docker, PDF/DOCX parsing, jsPDF export',
};

const ROADMAP = [
  ['🗺️ Job map', 'Pin jobs by location to weigh commute/proximity.'],
  ['📄 CV version library', 'Keep multiple named CV versions.'],
  ['🔗 Import from URL', 'Best-effort job import from a posting link via AI.'],
  ['✉️ Follow-up reminders', 'Email nudges so no application goes stale.'],
  ['⚡ Streaming AI', 'Show AI responses word-by-word as they generate.'],
  ['🔐 Email verification / OAuth', 'Verified sign-up and Google login.'],
];

export default function About() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">About HireFlow</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          An AI-powered job application tracker. Manage your whole search in one place — and let AI help at
          every stage: analyze your fit, tailor your CV per job, and prep for interviews.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">What it does</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([title, desc]) => (
            <div key={title} className={card}>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className={card}>
        <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">Tech stack</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {Object.entries(STACK).map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{k}</dt>
              <dd className="text-sm text-slate-600 dark:text-slate-300">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* About the developer */}
      <section className={card}>
        <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">About the developer</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Built by <strong>Omri Shitrit</strong>, a Full Stack + Python graduate (John Bryce, 2026).
          HireFlow is my final project — a real product I use in my own job search, built end-to-end:
          React frontend, Node/Express API, PostgreSQL, and Claude-powered AI features.
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <a href="https://github.com/omrino999" target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">GitHub ↗</a>
        </div>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Roadmap</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map(([title, desc]) => (
            <div key={title} className={card}>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 text-center">
        <Link to="/register" className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700">
          Get started free
        </Link>
      </div>
    </div>
  );
}
