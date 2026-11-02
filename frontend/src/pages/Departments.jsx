import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Building2, X, Users } from 'lucide-react';

const INITIAL_DEPARTMENTS = [
  { name: 'Production', lead: 'Ananya Rao', members: 18, color: 'blue', code: 'PRD' },
  { name: 'Creative & Development', lead: 'Karthik S', members: 12, color: 'purple', code: 'CRV' },
  { name: 'Finance & Accounts', lead: 'Sanjay Kumar', members: 7, color: 'green', code: 'FIN' },
  { name: 'Post-production', lead: 'Priya Menon', members: 14, color: 'orange', code: 'PST' },
  { name: 'Marketing & Distribution', lead: 'Meera Iyer', members: 8, color: 'pink', code: 'MKT' },
  { name: 'Administration', lead: 'Jaison M', members: 5, color: 'cyan', code: 'ADM' },
];

export default function Departments() {
  const [items, setItems] = useState(INITIAL_DEPARTMENTS);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [lead, setLead] = useState('');

  const filteredList = items.filter((x) =>
    `${x.name} ${x.lead}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreateDepartment = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDept = {
      name: name.trim(),
      lead: lead.trim() || 'Unassigned',
      members: 1,
      color: 'blue',
      code: name.slice(0, 3).toUpperCase(),
    };

    setItems([...items, newDept]);
    setModalOpen(false);
    setName('');
    setLead('');
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION / ORGANIZATION</div>
          <h1>Departments</h1>
          <p>Organize your studio into teams with clear ownership.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add department
        </button>
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div>
            <h2>
              All departments <span className="count-badge">{items.length}</span>
            </h2>
            <p>Department structure and team leads.</p>
          </div>
          <label className="table-search">
            <Search size={16} />
            <input
              placeholder="Search departments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="department-grid">
          {filteredList.map((d) => (
            <article className="department-card" key={d.name}>
              <div className="department-card-top">
                <div className={`department-icon ${d.color}`}>
                  <Building2 size={21} />
                </div>
                <button
                  className="more-button"
                  onClick={() => alert(`${d.name}\nLead: ${d.lead}\nMembers: ${d.members}`)}
                  aria-label="Department details"
                >
                  <MoreHorizontal size={19} />
                </button>
              </div>

              <h3>{d.name}</h3>
              <span className="dept-code">{d.code} &middot; DEPARTMENT</span>

              <div className="department-meta">
                <div className="avatar avatar-blue small-avatar">
                  {d.lead
                    .split(' ')
                    .map((s) => s[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <span>Department lead</span>
                  <strong>{d.lead}</strong>
                </div>
              </div>

              <div className="department-foot">
                <span>
                  <Users size={15} /> {d.members} members
                </span>
                <button onClick={() => alert(`Department: ${d.name}`)}>
                  View details &rarr;
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredList.length === 0 && (
          <div className="empty-state">No departments found.</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form
            className="modal-card"
            onSubmit={handleCreateDepartment}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Create department</h2>
                <p>Add a team to your organization.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <label>
              Department name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sound & Music"
              />
            </label>

            <label>
              Department lead
              <input
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                placeholder="Enter team lead name"
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                <Plus size={16} /> Create department
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
