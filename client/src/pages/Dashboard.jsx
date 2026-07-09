import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  AreaChart, Area,
} from 'recharts';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import StatusBadge, { STATUSES } from '../components/StatusBadge';
import JobMap from '../components/JobMap';
import { formatLocation } from '../utils/location';

const card = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800';

const STATUS_COLORS = {
  saved: '#94a3b8', applied: '#3b82f6', interview: '#f59e0b', offer: '#22c55e', rejected: '#ef4444',
};

function StatCard({ label, value, accent }) {
  return (
    <div className={card}>
      <div className={`text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [userLocation, setUserLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs').then((res) => setJobs(res.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/profile').then((res) => setUserLocation(formatLocation(res.data || {}))).catch(() => {});
  }, []);

  if (loading) return <div className="text-slate-400">Loading dashboard…</div>;

  const count = (s) => jobs.filter((j) => j.status === s).length;
  const statusData = STATUSES.map((s) => ({ status: s, count: count(s) }));

  // applications over time, grouped by month of appliedAt
  const byMonth = {};
  jobs.forEach((j) => { if (j.appliedAt) { const m = j.appliedAt.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + 1; } });
  const timeData = Object.keys(byMonth).sort().map((m) => ({ month: m, count: byMonth[m] }));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = jobs
    .filter((j) => j.interviewAt && j.interviewAt >= today)
    .sort((a, b) => a.interviewAt.localeCompare(b.interviewAt));

  const scored = jobs.filter((j) => j.fitScore != null);
  const avgFit = scored.length ? Math.round(scored.reduce((s, j) => s + j.fitScore, 0) / scored.length) : null;

  const favorites = jobs.filter((j) => j.isFavorite);

  const axis = theme === 'dark' ? '#94a3b8' : '#64748b';
  const grid = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltip = {
    contentStyle: {
      background: theme === 'dark' ? '#1e293b' : '#fff',
      border: `1px solid ${grid}`,
      borderRadius: 8,
      color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    },
    cursor: { fill: theme === 'dark' ? '#33415555' : '#e2e8f055' },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400 dark:border-slate-700">
          No applications yet. <Link to="/jobs" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Add your first job →</Link>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total applications" value={jobs.length} accent="text-indigo-600 dark:text-indigo-400" />
            <StatCard label="Applied" value={count('applied')} accent="text-blue-600 dark:text-blue-400" />
            <StatCard label="Interviews" value={count('interview')} accent="text-amber-600 dark:text-amber-400" />
            <StatCard label="Offers" value={count('offer')} accent="text-green-600 dark:text-green-400" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status distribution */}
            <section className={card}>
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Pipeline by status</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="status" tick={{ fill: axis, fontSize: 12, textTransform: 'capitalize' }} axisLine={{ stroke: grid }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* Applications over time */}
            <section className={card}>
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Applications over time</h2>
              {timeData.length === 0 ? (
                <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
                  No applied dates yet — mark jobs as “applied” to see activity.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                    <Tooltip {...tooltip} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#fill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>

          {/* Secondary row: avg fit + upcoming interviews */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className={card}>
              <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Avg fit score</h2>
              {avgFit == null ? (
                <p className="text-sm text-slate-400">Run fit analysis on jobs to see your average match.</p>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{avgFit}</span>
                  <span className="text-slate-400"> / 100 across {scored.length} analyzed</span>
                </div>
              )}
            </section>

            <section className={card}>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">⭐ Starred jobs</h2>
              {favorites.length === 0 ? (
                <p className="text-sm text-slate-400">Star jobs you really want in the Jobs list.</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {favorites.map((j) => (
                    <li key={j.id} className="flex items-center justify-between py-2">
                      <Link to={`/jobs/${j.id}`} className="text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400">
                        {j.title} <span className="font-normal text-slate-400">@ {j.company}</span>
                      </Link>
                      <StatusBadge status={j.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={`${card} lg:col-span-3`}>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">🗺️ Job locations</h2>
              <JobMap jobs={jobs} userLocation={userLocation} />
            </section>

            <section className={card}>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Upcoming interviews</h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-400">No interviews scheduled.</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {upcoming.map((j) => (
                    <li key={j.id} className="flex items-center justify-between py-2">
                      <Link to={`/jobs/${j.id}`} className="text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400">
                        {j.title} <span className="font-normal text-slate-400">@ {j.company}</span>
                      </Link>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{j.interviewAt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
