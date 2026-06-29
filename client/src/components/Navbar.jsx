import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {theme === 'dark' ? (
        // sun
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // moon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to={user ? '/dashboard' : '/'} className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          HireFlow
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Dashboard</Link>
              <Link to="/jobs" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Jobs</Link>
              <Link to="/profile" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Profile</Link>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-500 dark:text-slate-400">{user.name}</span>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Log in</Link>
              <Link
                to="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
