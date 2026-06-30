// Visual styling per pipeline status, light + dark
const STYLES = {
  saved: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  interview: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected'];

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[status] || STYLES.saved}`}>
      {status}
    </span>
  );
}
