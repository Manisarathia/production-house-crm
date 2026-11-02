import { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, Building2, X, Users } from 'lucide-react';
import { departmentsApi, teamMembersApi } from '../api/systemAdministrationApi.js';

const DEPARTMENT_COLORS = ['blue', 'purple', 'green', 'orange', 'pink', 'cyan'];

export default function Departments() {
  const canWrite = (() => {
    try {
      const raw = sessionStorage.getItem('frameflow-permissions')
        || localStorage.getItem('frameflow-permissions')
        || '[]';
      return JSON.parse(raw).includes('DEPARTMENT_WRITE');
    } catch {
      return false;
    }
  })();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [lead, setLead] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [membersDepartment, setMembersDepartment] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');

  const loadDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await departmentsApi.list());
    } catch (requestError) {
      setError(requestError.message || 'Unable to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredList = items.filter((department) =>
    `${department.name} ${department.lead || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setName('');
    setLead('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (department) => {
    setEditing(department);
    setName(department.name);
    setLead(department.lead || '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name: name.trim(), lead: lead.trim() || null };
      const saved = editing
        ? await departmentsApi.update(editing.id, payload)
        : await departmentsApi.create(payload);
      setItems((current) => editing
        ? current.map((department) => department.id === saved.id ? saved : department)
        : [...current, saved]);
      setModalOpen(false);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete the ${department.name} department?`)) return;
    setError('');
    try {
      await departmentsApi.delete(department.id);
      setItems((current) => current.filter((item) => item.id !== department.id));
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete department.');
    }
  };

  const openMembers = async (department) => {
    setMembersDepartment(department);
    setDepartmentMembers([]);
    setMembersTotal(0);
    setMembersError('');
    setMembersLoading(true);
    try {
      const response = await teamMembersApi.list({
        departmentId: department.id,
        page: 0,
        size: 100,
      });
      setDepartmentMembers(response.content || []);
      setMembersTotal(response.totalElements || 0);
    } catch (requestError) {
      setMembersError(requestError.message || 'Unable to load department members.');
    } finally {
      setMembersLoading(false);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION / ORGANIZATION</div>
          <h1>Departments</h1>
          <p>Organize your studio into teams with clear ownership.</p>
        </div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add department
        </button>}
      </div>

      {error && <div className="empty-state" role="alert">{error}</div>}

      <div className="panel page-panel">
        <div className="panel-head">
          <div>
            <h2>All departments <span className="count-badge">{items.length}</span></h2>
            <p>Department structure and team leads.</p>
          </div>
          <label className="table-search">
            <Search size={16} />
            <input
              placeholder="Search departments..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? <div className="empty-state">Loading departments…</div> : (
          <div className="department-grid">
            {filteredList.map((department, index) => (
              <article className="department-card" key={department.id}>
                <div className="department-card-top">
                  <div className={`department-icon ${DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]}`}>
                    <Building2 size={21} />
                  </div>
                  {canWrite && <button
                    className="more-button"
                    onClick={() => openEdit(department)}
                    aria-label={`Edit ${department.name}`}
                    title="Edit department"
                  >
                    <MoreHorizontal size={19} />
                  </button>}
                </div>
                <h3>{department.name}</h3>
                <span className="dept-code">{department.code || '—'} &middot; DEPARTMENT</span>
                <div className="department-meta">
                  <div className="avatar avatar-blue small-avatar">
                    {(department.lead || 'Unassigned').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <span>Department lead</span>
                    <strong>{department.lead || 'Unassigned'}</strong>
                  </div>
                </div>
                <div className="department-foot">
                  <button
                    className="department-members-button"
                    onClick={() => openMembers(department)}
                    aria-label={`View ${department.members} members in ${department.name}`}
                  >
                    <Users size={15} /> {department.members} members
                  </button>
                  {canWrite && <button onClick={() => handleDelete(department)}>Delete</button>}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredList.length === 0 && (
          <div className="empty-state">No departments found.</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form className="modal-card" onSubmit={handleSave} onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{editing ? 'Edit department' : 'Create department'}</h2>
                <p>{editing ? 'Update department ownership.' : 'Add a team to your organization.'}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {error && <div role="alert">{error}</div>}
            <label>
              Department name
              <input required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Department lead
              <input value={lead} onChange={(event) => setLead(event.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Plus size={16} /> {saving ? 'Saving…' : editing ? 'Save changes' : 'Create department'}
              </button>
            </div>
          </form>
        </div>
      )}

      {membersDepartment && (
        <div className="modal-backdrop" onClick={() => setMembersDepartment(null)}>
          <section
            className="modal-card department-members-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-members-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2 id="department-members-title">{membersDepartment.name} members</h2>
                <p>{membersTotal} team {membersTotal === 1 ? 'member' : 'members'} assigned to this department.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setMembersDepartment(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {membersError && <div className="empty-state" role="alert">{membersError}</div>}
            {membersLoading ? <div className="empty-state">Loading department members…</div> : (
              <div className="department-members-list">
                {departmentMembers.map((member) => (
                  <article className="department-member" key={member.id}>
                    <div className="avatar avatar-blue small-avatar">
                      {member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div className="department-member-copy">
                      <strong>{member.name}</strong>
                      <span>{member.email}</span>
                    </div>
                    <div className="department-member-meta">
                      <span>{member.role || member.roles?.join(', ') || 'No role'}</span>
                      <span>{member.status || 'Unknown'}</span>
                    </div>
                  </article>
                ))}
                {!membersError && !departmentMembers.length && <div className="empty-state">No members in this department.</div>}
                {membersTotal > departmentMembers.length && (
                  <p className="department-members-limit">Showing {departmentMembers.length} of {membersTotal} members.</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
