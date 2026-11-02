import { useState } from 'react';
import { labelize } from '../utils/helpers';
import '../css/StatusDonut.css';
const TONE_BY_STATUS = {
  scheduled: 'neutral',
  'in-progress': 'warn',
  delayed: 'bad',
  completed: 'good',
  present: 'good',
  late: 'warn',
  absent: 'bad',
  'on-leave': 'neutral',
  todo: 'neutral',
  done: 'good',
  pending: 'warn',
  delivered: 'good',
  approved: 'good',
  rejected: 'bad',
  draft: 'neutral',
  'in-review': 'warn',
  published: 'good',
  failed: 'bad',
};
export default function StatusDonut({ title, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [hovered, setHovered] = useState(null);
  let offset = 0;
  const active = data.find((item) => item.key === hovered);

  return (
    <section className="status-donut" aria-label={`${title} breakdown`}>
      <div className="status-donut__chart">
        <svg viewBox="0 0 42 42" role="img" aria-label={`${title}: ${total} total`}>
          <circle className="status-donut__track" cx="21" cy="21" r="15.9155" />
          <g className="status-donut__segments">
            {data.map((item) => {
              const percentage = total ? (item.value / total) * 100 : 0;
              const dash = Math.max(percentage - (percentage ? 1.2 : 0), 0);
              const segmentOffset = offset;
              offset += percentage;
              return (
                <circle
                  key={item.key}
                  className={`status-donut__segment status-donut__segment--${TONE_BY_STATUS[item.key] || 'neutral'} ${hovered === item.key ? 'is-hovered' : ''}`}
                  cx="21"
                  cy="21"
                  r="15.9155"
                  pathLength="100"
                  strokeDasharray={`${dash} ${100 - dash}`}
                  strokeDashoffset={-segmentOffset}
                  tabIndex={item.value ? 0 : -1}
                  onMouseEnter={() => setHovered(item.key)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(item.key)}
                  onBlur={() => setHovered(null)}
                >
                  <title>{`${labelize(item.key)}: ${item.value}`}</title>
                </circle>
              );
            })}
          </g>
        </svg>
        <div className="status-donut__center">
          <strong>{active ? active.value : total}</strong>
          <span>{active ? labelize(active.key) : 'Total'}</span>
        </div>
      </div>
      <div className="status-donut__content">
        <p className="status-donut__title">{title}</p>
        <div className="status-donut__legend">
          {data.map((item) => (
            <div
              className={`status-donut__legend-item status-donut__legend-item--${TONE_BY_STATUS[item.key] || 'neutral'} ${hovered === item.key ? 'is-active' : ''}`}
              key={item.key}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="status-donut__dot" />
              <span>{labelize(item.key)}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
