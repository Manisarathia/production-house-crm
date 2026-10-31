import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clapperboard,
  Users,
  Wallet,
  ReceiptText,
  Plus,
  CalendarDays,
  MoreHorizontal,
  PlayCircle,
  Clock3,
} from 'lucide-react';
import { getStoredProjects } from '../utils/productionStorage.js';

const ACTIVITIES = [
  { initial: 'AR', name: 'Ananya Rao', text: 'uploaded a new production brief', time: '12 min ago', color: 'pink' },
  { initial: 'SK', name: 'Sanjay Kumar', text: 'approved equipment request #EQ-104', time: '48 min ago', color: 'blue' },
  { initial: 'PM', name: 'Priya Menon', text: 'submitted an expense report', time: '1 hr ago', color: 'purple' },
  { initial: 'RV', name: 'Rahul Verma', text: 'updated project milestone', time: '2 hrs ago', color: 'green' },
];

function StatCard({ title, value, change, positive, note, Icon, tone, spark }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
        <span className={`stat-change ${positive ? 'up' : 'down'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}
        </span>
      </div>
      <p className="stat-title">{title}</p>
      <div className="stat-bottom">
        <div>
          <strong>{value}</strong>
          <span>{note}</span>
        </div>
        <div className={`sparkline ${tone}`}>
          {spark.map((n, i) => (
            <i key={i} style={{ height: `${n}%` }} />
          ))}
        </div>
      </div>
    </article>
  );
}

function DeadlineItem({ day, month, title, detail, tag, tone }) {
  return (
    <div className="deadline-item">
      <div className={`date-box ${tone}`}>
        <strong>{day}</strong>
        <span>{month}</span>
      </div>
      <div className="deadline-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <span className={`deadline-tag ${tone}`}>{tag}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const storedProjects = getStoredProjects();
  const displayProjects = storedProjects.slice(0, 4);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> TODAY &middot; PRODUCTION OVERVIEW
          </div>
          <h1>
            Good morning, Jaison <span className="wave">&#10022;</span>
          </h1>
          <p>Here is what is happening across your production house today.</p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={() => window.print()}>
            <CalendarDays size={17} /> This month
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>
            <Plus size={18} /> New Production
          </button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Active Productions"
          value={String(storedProjects.length)}
          change="12.5%"
          positive
          note="vs. last month"
          Icon={Clapperboard}
          tone="blue"
          spark={[25, 38, 30, 48, 40, 61, 56, 78, 69, 88]}
        />
        <StatCard
          title="Team Members"
          value="64"
          change="8.2%"
          positive
          note="vs. last month"
          Icon={Users}
          tone="violet"
          spark={[38, 32, 48, 45, 57, 50, 68, 63, 75, 82]}
        />
        <StatCard
          title="Total Budget"
          value="₹84.6L"
          change="3.1%"
          positive={false}
          note="vs. last month"
          Icon={Wallet}
          tone="cyan"
          spark={[70, 60, 66, 52, 58, 43, 50, 38, 45, 30]}
        />
        <StatCard
          title="Pending Invoices"
          value="12"
          change="2 overdue"
          positive={false}
          note="needs attention"
          Icon={ReceiptText}
          tone="orange"
          spark={[30, 40, 36, 52, 47, 58, 62, 55, 75, 84]}
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel production-panel">
          <div className="panel-head">
            <div>
              <h2>Production overview</h2>
              <p>Track progress across your active projects.</p>
            </div>
            <button className="text-link" onClick={() => navigate('/projects')}>
              View all projects <span>&nearr;</span>
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-blue" /> Production progress
            </span>
            <span>
              <i className="legend-gray" /> Remaining
            </span>
            <button className="more-button" aria-label="More options">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="bar-chart">
            {[
              { m: 'May', a: 42, b: 58 },
              { m: 'Jun', a: 58, b: 42 },
              { m: 'Jul', a: 49, b: 51 },
              { m: 'Aug', a: 72, b: 28 },
              { m: 'Sep', a: 64, b: 36 },
              { m: 'Oct', a: 82, b: 18 },
              { m: 'Nov', a: 69, b: 31 },
            ].map((x) => (
              <div className="bar-column" key={x.m}>
                <div className="bar-stack">
                  <div className="bar-remaining" style={{ height: `${x.b}%` }} />
                  <div className="bar-progress" style={{ height: `${x.a}%` }} />
                </div>
                <span>{x.m}</span>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <div>
              <span className="footer-label">Overall completion</span>
              <strong>68.4%</strong>
            </div>
            <div className="footer-trend">
              <ArrowUpRight size={16} /> 6.8% <span>vs. last month</span>
            </div>
          </div>
        </div>

        <div className="panel schedule-panel">
          <div className="panel-head">
            <div>
              <h2>Upcoming deadlines</h2>
              <p>Key dates to keep on your radar.</p>
            </div>
            <button className="more-button" aria-label="More options">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="deadline-list">
            <DeadlineItem day="12" month="NOV" title="City of Echoes" detail="Final cut review" tag="3 days" tone="red" />
            <DeadlineItem day="18" month="NOV" title="The Last Monsoon" detail="Episode 04 delivery" tag="9 days" tone="blue" />
            <DeadlineItem day="24" month="NOV" title="Beyond The Frame" detail="Principal photography" tag="15 days" tone="purple" />
            <DeadlineItem day="28" month="NOV" title="Studio North" detail="Monthly budget review" tag="19 days" tone="green" />
          </div>
          <button className="full-width-link" onClick={() => navigate('/projects')}>
            View production calendar <span>&rarr;</span>
          </button>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel projects-panel">
          <div className="panel-head">
            <div>
              <h2>Active projects</h2>
              <p>Your productions, at a glance.</p>
            </div>
            <button className="filter-button" onClick={() => navigate('/projects')}>
              All projects <span>&or;</span>
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>STATUS</th>
                  <th>PROGRESS</th>
                  <th>DEADLINE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="project-name">
                        <div className={`project-icon ${p.tone || 'blue'}`}>
                          <PlayCircle size={19} />
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.type} &middot; {p.platform}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${p.tone || 'blue'}`}>{p.status}</span>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-track">
                          <div className={`progress-fill ${p.tone || 'blue'}`} style={{ width: `${p.progress}%` }} />
                        </div>
                        <span>{p.progress}%</span>
                      </div>
                    </td>
                    <td className="date-cell">{p.targetDeliveryDate || 'TBD'}</td>
                    <td>
                      <button
                        className="more-button"
                        onClick={() => navigate('/projects')}
                        aria-label={`More about ${p.name}`}
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="full-width-link" onClick={() => navigate('/projects')}>
            Explore all productions <span>&rarr;</span>
          </button>
        </div>

        <div className="panel activity-panel">
          <div className="panel-head">
            <div>
              <h2>Recent activity</h2>
              <p>Latest updates from your team.</p>
            </div>
            <button className="more-button" aria-label="More options">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="activity-list">
            {ACTIVITIES.map((a) => (
              <div className="activity-item" key={a.name}>
                <div className={`avatar avatar-${a.color}`}>{a.initial}</div>
                <div className="activity-copy">
                  <p>
                    <strong>{a.name}</strong> {a.text}
                  </p>
                  <span>
                    <Clock3 size={12} /> {a.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="full-width-link" onClick={() => navigate('/notifications')}>
            View all notifications <span>&rarr;</span>
          </button>
        </div>
      </section>
    </>
  );
}
