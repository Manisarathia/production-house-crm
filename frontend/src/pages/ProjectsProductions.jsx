import { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Calendar,
  Eye,
  X,
  PlayCircle,
  LayoutGrid,
  Table as TableIcon,
  Edit3,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/production/projects';

export default function ProjectsProductions() {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalProject, setEditModalProject] = useState(null);
  const [detailModalProject, setDetailModalProject] = useState(null);
  const [validationError, setValidationError] = useState('');

  const initialFormState = {
    name: '',
    type: 'MOVIE',
    stage: 'PRE_PRODUCTION',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    posterUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProjectsFromServer = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(item => ({
          id: item.id,
          name: item.title || 'Untitled Production',
          type: item.type || 'MOVIE',
          status: item.stage ? item.stage.replace('_', ' ') : 'PRE PRODUCTION',
          stage: item.stage || 'PRE_PRODUCTION',
          startDate: item.startDate,
          endDate: item.endDate,
          posterUrl: item.posterUrl || '',
          code: item.id ? `PRJ-${item.id.substring(0, 4).toUpperCase()}` : 'PRJ-TEMP',
          progress: item.stage === 'RELEASED' ? 100 : item.stage === 'POST_PRODUCTION' ? 80 : item.stage === 'PRODUCTION' ? 50 : 15
        }));
        setProjects(mapped);
      }
    } catch (error) {
      console.error("Failed to connect to backend context:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsFromServer();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.stage === statusFilter;
      const matchType = typeFilter === 'ALL' || p.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, posterUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.posterUrl) {
      setValidationError('A production poster image attachment is mandatory.');
      return;
    }
    if (!formData.name.trim()) return;

    const payload = {
      title: formData.name,
      type: formData.type,
      stage: formData.stage,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      posterUrl: formData.posterUrl
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setCreateModalOpen(false);
        await fetchProjectsFromServer();
      } else {
        alert("Server validation failure. Check Spring Boot logs.");
      }
    } catch (error) {
      console.error("Network exception on submission:", error);
    }
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.posterUrl) {
      setValidationError('Updating a production requires a valid poster image attachment.');
      return;
    }
    if (!editModalProject || !formData.name.trim()) return;

    const payload = {
      title: formData.name,
      type: formData.type,
      stage: formData.stage,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      posterUrl: formData.posterUrl 
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${editModalProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditModalProject(null);
        await fetchProjectsFromServer(); 
      } else {
        const errorData = await response.json();
        setValidationError(errorData.message || "Server rejected update validation layout.");
      }
    } catch (error) {
      console.error("Update request processing failed.", error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this production project?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchProjectsFromServer();
      } else {
        alert("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  const handleOpenEdit = (project) => {
    setFormData({
      name: project.name,
      type: project.type,
      stage: project.stage,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      posterUrl: project.posterUrl || ''
    });
    setEditModalProject(project);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot" /> PROJECTS & PRODUCTION MANAGEMENT</div>
          <h1>Projects & Productions</h1>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={() => { setFormData(initialFormState); setCreateModalOpen(true); }}>
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div>
            <h2>Active Production Pipeline</h2>
            <p>Showing {filteredProjects.length} synchronized ledger rows.</p>
          </div>
          <div className="inline-actions">
            <div className="segmented">
              <button type="button" className={viewMode === 'grid' ? 'chosen' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={15} /> Grid</button>
              <button type="button" className={viewMode === 'table' ? 'chosen' : ''} onClick={() => setViewMode('table')}><TableIcon size={15} /> Table</button>
            </div>
            <label className="table-search">
              <Search size={16} />
              <input placeholder="Search production titles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </label>
          </div>
        </div>

        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8' }}>LIFECYCLE STAGE:</span>
            <div className="filter-tabs">
              {['ALL', 'PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'RELEASED'].map(st => (
                <button key={st} type="button" className={`filter-tab-pill ${statusFilter === st ? 'active' : ''}`} onClick={() => setStatusFilter(st)}>
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8a96a8' }}>Fetching system entities matrix from backend...</div>
        ) : (
          viewMode === 'grid' && (
            <div className="production-grid">
              {filteredProjects.map(p => (
                <div className="prod-card" key={p.id}>
                  <div className="prod-card-poster-wrap">
                    {p.posterUrl ? (
                      <img src={p.posterUrl} alt={p.name} className="prod-card-poster-img" />
                    ) : (
                      <div className="prod-card-poster-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', color: '#555', width: '100%', height: '100%' }}>
                        <ImageIcon size={40} />
                      </div>
                    )}
                    <div className="prod-card-poster-gradient" />
                    <div className="prod-card-poster-badges">
                      <span className="badge-tag platform">{p.type}</span>
                      <span className="status-pill blue">{p.status}</span>
                    </div>
                  </div>
                  <div className="prod-card-top">
                    <div className="prod-card-title-group">
                      <div className="project-icon blue"><PlayCircle size={20} /></div>
                      <div>
                        <h3>{p.name}</h3>
                        <span>{p.code}</span>
                      </div>
                    </div>
                  </div>
                  <div className="prod-progress-block" style={{ marginTop: '15px' }}>
                    <div className="prod-progress-head"><span>Timeline Progression</span><strong>{p.progress}%</strong></div>
                    <div className="progress-track"><div className="progress-fill blue" style={{ width: `${p.progress}%` }} /></div>
                  </div>
                  <div className="prod-card-foot" style={{ marginTop: 'auto' }}>
                    <span>{p.startDate ? `Start: ${p.startDate}` : 'Start: TBD'}</span>
                    <div className="prod-card-actions">
                      <button className="icon-button" onClick={() => setDetailModalProject(p)} title="View Details"><Eye size={16} /></button>
                      <button className="icon-button" onClick={() => handleOpenEdit(p)} title="Edit"><Edit3 size={16} /></button>
                      <button className="icon-button" onClick={() => handleDeleteProject(p.id)} title="Delete" style={{ color: '#dc6464' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {!loading && viewMode === 'table' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PROJECT TITLE</th>
                  <th>FORMAT TYPE</th>
                  <th>LIFECYCLE PRODUCTION STAGE</th>
                  <th>START DATE</th>
                  <th>TARGET END DATE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><div style={{ fontSize: '10px', color: '#8a96a8' }}>{p.code}</div></td>
                    <td><span style={{ fontWeight: 600 }}>{p.type}</span></td>
                    <td><span className="status-pill blue">{p.status}</span></td>
                    <td>{p.startDate || 'TBD'}</td>
                    <td>{p.endDate || 'Ongoing'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button className="icon-button" onClick={() => setDetailModalProject(p)}><Eye size={16} /></button>
                        <button className="icon-button" onClick={() => handleOpenEdit(p)}><Edit3 size={16} /></button>
                        <button className="icon-button" onClick={() => handleDeleteProject(p.id)} style={{ color: '#dc6464' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="empty-state">
            <Film size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>No production records resolved</strong>
            <p style={{ margin: 0 }}>The database register layer contains no records matching this query framework selection.</p>
          </div>
        )}
      </div>

      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <form className="modal-card" onSubmit={handleCreateSubmit} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Register Database Production</h2>
              <button type="button" className="icon-button" onClick={() => setCreateModalOpen(false)}><X size={18} /></button>
            </div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Project Title *
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Echoes of the Ghats" style={{ width: '100%', marginTop: '5px' }} />
            </label>
            <div className="form-grid-2" style={{ marginTop: '10px' }}>
              <label>Production Format
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="MOVIE">Movie</option>
                  <option value="WEB_SERIES">Web Series</option>
                </select>
              </label>
              <label>Production Stage
                <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                  <option value="PRE_PRODUCTION">Pre Production</option>
                  <option value="PRODUCTION">Production / Filming</option>
                  <option value="POST_PRODUCTION">Post Production</option>
                  <option value="RELEASED">Released</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Attach Poster Image *</label>
              <input type="file" accept="image/*" required onChange={handleFileChange} />

              {validationError && (
                <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>
                  {validationError}
                </div>
              )}

              {formData.posterUrl && (
                <img src={formData.posterUrl} alt="Preview" style={{ marginTop: '10px', maxHeight: '100px', borderRadius: '4px', display: 'block' }} />
              )}
            </div>

            <div className="form-grid-2" style={{ marginTop: '10px' }}>
              <label>Start Date
                <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </label>
              <label>End Date (Optional)
                <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-light" onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Production</button>
            </div>
          </form>
        </div>
      )}

      {editModalProject && (
        <div className="modal-backdrop" onClick={() => setEditModalProject(null)}>
          <form className="modal-card" onSubmit={handleEditSubmit} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Update Record: {editModalProject.name}</h2>
              <button type="button" className="icon-button" onClick={() => setEditModalProject(null)}><X size={18} /></button>
            </div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Project Title *
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </label>
            <div className="form-grid-2" style={{ marginTop: '10px' }}>
              <label>Format
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="MOVIE">Movie</option>
                  <option value="WEB_SERIES">Web Series</option>
                </select>
              </label>
              <label>Stage
                <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                  <option value="PRE_PRODUCTION">Pre Production</option>
                  <option value="PRODUCTION">Production / Filming</option>
                  <option value="POST_PRODUCTION">Post Production</option>
                  <option value="RELEASED">Released</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Change Poster Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {formData.posterUrl && (
                <img src={formData.posterUrl} alt="Preview" style={{ marginTop: '10px', maxHeight: '100px', borderRadius: '4px', display: 'block' }} />
              )}
            </div>
            <div className="form-grid-2" style={{ marginTop: '10px' }}>
              <label>Start Date
                <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </label>
              <label>End Date
                <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-light" onClick={() => setEditModalProject(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {detailModalProject && (
        <div className="modal-backdrop" onClick={() => setDetailModalProject(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-head">
              <div>
                <h2>{detailModalProject.name}</h2>
                <p>{detailModalProject.code} · Ledger Tracking Profile</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setDetailModalProject(null)}><X size={18} /></button>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2f2f2f', paddingBottom: '8px' }}>
                <span style={{ color: '#8a96a8' }}>System Unique ID</span>
                <strong style={{ fontFamily: 'monospace', color: '#f4f0eb' }}>{detailModalProject.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2f2f2f', paddingBottom: '8px' }}>
                <span style={{ color: '#8a96a8' }}>Production Format</span>
                <strong style={{ color: '#f4f0eb' }}>{detailModalProject.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2f2f2f', paddingBottom: '8px' }}>
                <span style={{ color: '#8a96a8' }}>Active Life Milestone</span>
                <span className="status-pill blue">{detailModalProject.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2f2f2f', paddingBottom: '8px' }}>
                <span style={{ color: '#8a96a8' }}>Production Commenced</span>
                <strong style={{ color: '#f4f0eb' }}>{detailModalProject.startDate || 'TBD'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: '#8a96a8' }}>Wrapped / Delivery Date</span>
                <strong style={{ color: '#f4f0eb' }}>{detailModalProject.endDate || 'Ongoing / Active Workflow'}</strong>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '25px' }}>
              <button type="button" className="btn btn-light" onClick={() => setDetailModalProject(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => { setDetailModalProject(null); handleOpenEdit(detailModalProject); }}>Edit Production</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}