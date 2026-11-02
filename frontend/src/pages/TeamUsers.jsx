import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, ShieldCheck, Mail, X, Users, Pencil } from 'lucide-react';
import {
  dashboardApi,
  departmentsApi,
  rolesApi,
  teamMembersApi,
} from '../api/systemAdministrationApi.js';

const PERMISSIONS = [
  'DASHBOARD_READ', 'USER_READ', 'USER_WRITE', 'ROLE_READ', 'ROLE_WRITE',
  'DEPARTMENT_READ', 'DEPARTMENT_WRITE', 'SETTINGS_READ', 'SETTINGS_WRITE',
  'SETTINGS_SENSITIVE_WRITE', 'MEDIA_READ', 'MEDIA_WRITE', 'MEDIA_DELETE',
  'POSTPRODUCTION_READ', 'POSTPRODUCTION_WRITE', 'POSTPRODUCTION_DELETE',
  'SINGER_READ', 'SINGER_WRITE', 'SINGER_DELETE', 'DUBBING_READ', 'DUBBING_WRITE',
  'DUBBING_DELETE', 'CONTRACT_READ', 'CONTRACT_WRITE', 'CONTRACT_DELETE',
  'RIGHTS_READ', 'RIGHTS_WRITE', 'RIGHTS_DELETE',
];

const getPermissions = () => {
  try {
    const raw = sessionStorage.getItem('frameflow-permissions')
      || localStorage.getItem('frameflow-permissions')
      || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const displayRole = (role) => role?.replaceAll('_', ' ').toLowerCase()
  .replace(/\b\w/g, (letter) => letter.toUpperCase()) || '—';

const displayStatus = (status) => status
  ? status[0].toUpperCase() + status.slice(1).toLowerCase()
  : 'Unknown';

export default function TeamUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [invitationToken, setInvitationToken] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState([]);
  const permissions = useMemo(getPermissions, []);
  const canWriteUsers = permissions.includes('USER_WRITE');
  const canWriteRoles = permissions.includes('ROLE_WRITE');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersPage, departmentList, roleList, summary] = await Promise.all([
        teamMembersApi.list({ page: 0, size: 100 }),
        departmentsApi.list(),
        rolesApi.list(),
        dashboardApi.get(),
      ]);
      setUsers(usersPage.content || []);
      setDepartments(departmentList);
      setRoles(roleList);
      setDashboard(summary);
      setRole((current) => current || roleList.find((item) => item.name === 'EDITOR')?.name || roleList[0]?.name || '');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load team administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.dept || ''} ${user.role || ''}`
      .toLowerCase().includes(query.toLowerCase())
  );

  const handleAddMember = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await teamMembersApi.create({
        name: name.trim(),
        email: email.trim(),
        role,
        departmentId: departmentId ? Number(departmentId) : null,
      });
      setUsers((current) => [created, ...current]);
      setInvitationToken(created.invitationToken);
      setName('');
      setEmail('');
      setDepartmentId('');
      setDashboard((current) => current ? {
        ...current,
        totalTeamMembers: current.totalTeamMembers + 1,
        invitedTeamMembers: current.invitedTeamMembers + 1,
      } : current);
    } catch (requestError) {
      setError(requestError.message || 'Unable to invite this team member.');
    } finally {
      setSaving(false);
    }
  };

  const changeUserRole = async (user, nextRole) => {
    setError('');
    try {
      const assignedRoles = await teamMembersApi.replaceRoles(user.id, [nextRole]);
      setUsers((current) => current.map((item) => item.id === user.id
        ? { ...item, roles: assignedRoles, role: assignedRoles[0] || nextRole }
        : item));
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the member role.');
    }
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = user.status?.toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setError('');
    try {
      const updated = await teamMembersApi.updateStatus(user.id, nextStatus);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setDashboard((current) => {
        if (!current) return current;
        const wasActive = user.status?.toUpperCase() === 'ACTIVE';
        return {
          ...current,
          activeTeamMembers: current.activeTeamMembers + (wasActive ? -1 : 1),
          inactiveTeamMembers: current.inactiveTeamMembers + (wasActive ? 1 : -1),
        };
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to update member status.');
    }
  };

  const openRoleEditor = (item = null) => {
    setEditingRole(item);
    setRoleName(item?.name || '');
    setRoleDescription(item?.description || '');
    setRolePermissions(item?.permissions || []);
    setError('');
    setRoleModalOpen(true);
  };

  const saveRole = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: rolePermissions,
      };
      const saved = editingRole
        ? await rolesApi.update(editingRole.id, payload)
        : await rolesApi.create(payload);
      setRoles((current) => editingRole
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved]);
      setRoleModalOpen(false);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save this role.');
    } finally {
      setSaving(false);
    }
  };

  const closeMemberModal = () => {
    setModalOpen(false);
    setInvitationToken('');
    setError('');
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION / PEOPLE</div>
          <h1>Team &amp; User Roles</h1>
          <p>Manage your team, access levels and workspace permissions.</p>
        </div>
        <div className="heading-actions">
          {canWriteRoles && <button className="btn btn-light" onClick={() => openRoleEditor()}>
            <ShieldCheck size={17} /> Add role
          </button>}
          {canWriteUsers && <button className="btn btn-primary" onClick={() => {
            setInvitationToken('');
            setError('');
            setModalOpen(true);
          }}>
            <Plus size={18} /> Add team member
          </button>}
        </div>
      </div>

      {error && <div className="empty-state" role="alert">{error}</div>}

      <div className="mini-stats">
        <div className="mini-stat"><span>Total members</span><strong>{dashboard?.totalTeamMembers ?? '—'}</strong></div>
        <div className="mini-stat"><span>Active users</span><strong>{dashboard?.activeTeamMembers ?? '—'}</strong></div>
        <div className="mini-stat"><span>Pending invitations</span><strong>{dashboard?.invitedTeamMembers ?? '—'}</strong></div>
        <div className="mini-stat"><span>Roles configured</span><strong>{roles.length || '—'}</strong></div>
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div><h2>Team members</h2><p>View and manage who can access your workspace.</p></div>
          <label className="table-search">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team..." />
          </label>
        </div>
        {loading ? <div className="empty-state">Loading team members…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>MEMBER</th><th>ROLE</th><th>DEPARTMENT</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = displayStatus(user.status);
                  const assignedRole = user.roles?.[0] || user.role || '';
                  return (
                    <tr key={user.id}>
                      <td><div className="project-name">
                        <div className="avatar avatar-blue">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                        <div><strong>{user.name}</strong><span>{user.email}</span></div>
                      </div></td>
                      <td>{canWriteUsers ? (
                        <select aria-label={`Role for ${user.name}`} value={assignedRole} onChange={(event) => changeUserRole(user, event.target.value)}>
                          {roles.map((item) => <option key={item.id} value={item.name}>{displayRole(item.name)}</option>)}
                        </select>
                      ) : <span className="role-label"><ShieldCheck size={14} /> {displayRole(assignedRole)}</span>}</td>
                      <td>{user.dept || '—'}</td>
                      <td><span className={`status-pill ${status === 'Active' ? 'green' : status === 'Invited' ? 'orange' : 'red'}`}>{status}</span></td>
                      <td>{canWriteUsers && status !== 'Invited' && (
                        <button className="btn btn-light" onClick={() => toggleUserStatus(user)}>
                          {status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <div className="empty-state">No team members match your search.</div>}
          </div>
        )}
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div><h2>Configured roles</h2><p>Roles determine access to CRM modules.</p></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ROLE</th><th>DESCRIPTION</th><th>PERMISSIONS</th><th /></tr></thead>
            <tbody>{roles.map((item) => (
              <tr key={item.id}>
                <td><span className="role-label"><ShieldCheck size={14} /> {displayRole(item.name)}</span></td>
                <td>{item.description || '—'}</td>
                <td>{item.permissions?.length || 0}</td>
                <td>{canWriteRoles && <button className="more-button" onClick={() => openRoleEditor(item)} aria-label={`Edit ${displayRole(item.name)}`}><Pencil size={16} /></button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeMemberModal}>
          <form className="modal-card" onSubmit={handleAddMember} onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><h2>Invite team member</h2><p>Create an invitation for your workspace.</p></div>
              <button type="button" className="icon-button" onClick={closeMemberModal} aria-label="Close"><X size={18} /></button>
            </div>
            {error && <div role="alert">{error}</div>}
            {invitationToken ? (
              <>
                <p>Invitation created. Share this one-time token with the user to accept the invite:</p>
                <textarea readOnly value={invitationToken} aria-label="Invitation token" />
                <div className="modal-actions"><button type="button" className="btn btn-primary" onClick={closeMemberModal}>Done</button></div>
              </>
            ) : (
              <>
                <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label>Work email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                <label>Role<select required value={role} onChange={(event) => setRole(event.target.value)}>
                  {roles.map((item) => <option key={item.id} value={item.name}>{displayRole(item.name)}</option>)}
                </select></label>
                <label>Department<select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                  <option value="">No department</option>
                  {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select></label>
                <div className="modal-actions">
                  <button type="button" className="btn btn-light" onClick={closeMemberModal}>Cancel</button>
                  <button className="btn btn-primary" type="submit" disabled={saving}><Mail size={16} /> {saving ? 'Inviting…' : 'Create invitation'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {roleModalOpen && (
        <div className="modal-backdrop" onClick={() => setRoleModalOpen(false)}>
          <form className="modal-card" onSubmit={saveRole} onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><h2>{editingRole ? 'Edit role' : 'Create role'}</h2><p>Select permissions for this role.</p></div>
              <button type="button" className="icon-button" onClick={() => setRoleModalOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {error && <div role="alert">{error}</div>}
            <label>Role name<input required value={roleName} onChange={(event) => setRoleName(event.target.value)} /></label>
            <label>Description<input value={roleDescription} onChange={(event) => setRoleDescription(event.target.value)} /></label>
            <div className="settings-section">
              <h3>Permissions</h3>
              {PERMISSIONS.map((permission) => (
                <label className="toggle-row" key={permission}>
                  <span>{permission}</span>
                  <input
                    type="checkbox"
                    checked={rolePermissions.includes(permission)}
                    onChange={(event) => setRolePermissions((current) => event.target.checked
                      ? [...current, permission]
                      : current.filter((value) => value !== permission))}
                  />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setRoleModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={saving}><Users size={16} /> {saving ? 'Saving…' : 'Save role'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
