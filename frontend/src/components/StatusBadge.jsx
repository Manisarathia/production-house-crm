import { labelize } from '../utils/helpers';
import "../css/StatusBadge.css"
const TONES = {
  good: ['completed', 'done', 'present', 'approved', 'low', 'delivered', 'published', 'success'],
  warn: ['in-progress', 'late', 'pending', 'medium', 'on-leave', 'in-review', 'warning'],
  bad: ['delayed', 'absent', 'expired', 'high', 'rejected', 'failed', 'critical'],
};

const getTone = (value) =>
  Object.keys(TONES).find((tone) => TONES[tone].includes(value)) || 'neutral';

export default function StatusBadge({ value }) {
  if (!value) return '-';
  return <span className={`badge badge--${getTone(value)}`}>{labelize(value)}</span>;
}