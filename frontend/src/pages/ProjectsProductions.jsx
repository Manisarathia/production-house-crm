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
  List,
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
  const [deleteTargetProject, setDeleteTargetProject] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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


  const handleDeleteProject = (id) => {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    setDeleteError('');
    setDeleteTargetProject(project);
  };

  const confirmDeleteProject = async () => {
    if (!deleteTargetProject || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/${deleteTargetProject.id}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          setDeleteError(
            result.error ||
            "Project deletion failed because a linked record could not be removed. No records were deleted."
          );
          return;
        }

        throw new Error(
          result.error ||
          result.message ||
          `Delete failed (HTTP ${response.status})`
        );
      }

      setDeleteTargetProject(null);
      await fetchProjectsFromServer();

    } catch (error) {
      setDeleteError(
        error.message || "Unable to delete this project."
      );
    } finally {
      setDeleting(false);
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
      <style>{`
        .production-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 22px;
          align-items: stretch;
          width: 100%;
          box-sizing: border-box;
          padding: 0 20px 20px !important;
        }

        .prod-card, .prod-list-card {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .prod-card {
          display: flex !important;
          flex-direction: column !important;
          gap: 13px !important;
          background: #181716 !important;
          border: 1px solid #2b2825 !important;
          border-radius: 14px !important;
          box-sizing: border-box !important;
          padding: 16px 18px 16px 18px !important;
          padding-top: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.25s ease, 
                      box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          position: relative;
        }
        .prod-card:hover {
          transform: translateY(-4px) !important;
          border-color: #EFC348 !important;
          box-shadow: 0 14px 32px -4px rgba(0, 0, 0, 0.7), 
                      0 0 0 1px rgba(239, 195, 72, 0.35), 
                      0 0 24px rgba(239, 195, 72, 0.12) !important;
        }

        .prod-list-card {
          background: #181716 !important;
          border: 1px solid #2b2825 !important;
          border-radius: 12px !important;
          padding: 14px 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 16px !important;
          flex-wrap: wrap !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .prod-list-card:hover {
          transform: translateY(-3px) translateX(2px) !important;
          border-color: #EFC348 !important;
          box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(239, 195, 72, 0.35), 
                      0 0 20px rgba(239, 195, 72, 0.1) !important;
        }
        .prod-list-card:hover strong {
          color: #ffffff !important;
        }

        .prod-card-poster-wrap {
          position: relative;
          width: calc(100% + 36px);
          margin: 0 -18px 0 -18px !important;
          aspect-ratio: 16 / 11;
          min-height: 220px;
          overflow: hidden;
          background: #11100f;
          border-top-left-radius: 13px;
          border-top-right-radius: 13px;
        }
        .prod-card-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          display: block;
        }
        .prod-card:hover .prod-card-poster-img {
          transform: scale(1.06);
        }
        .prod-card-poster-gradient {
          display: none;
        }
        .prod-card-poster-badges {
          position: absolute;
          top: 12px;
          left: 14px;
          right: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
          pointer-events: none;
        }
        .prod-card-poster-badges > * {
          pointer-events: auto;
        }
        .badge-tag.platform {
          background: rgba(38, 30, 15, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid #5a4515;
          color: #EFC348;
          font-weight: 700;
        }
        .status-pill.blue {
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(14, 165, 233, 0.5);
          color: #38bdf8;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }

        .prod-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 2px;
        }
        .prod-card-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }
        .prod-card-title-group h3 {
          margin: 0;
          font-size: 16px !important;
          font-weight: 750;
          color: #f4f0eb;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.18s ease;
        }
        .prod-card:hover .prod-card-title-group h3 {
          color: #ffffff !important;
        }
        .prod-card-title-group span {
          font-size: 11.5px !important;
          color: #9c948c;
          display: block;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-icon.blue {
          width: 38px !important;
          height: 38px !important;
          border-radius: 10px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          background: rgba(14, 165, 233, 0.15) !important;
          border: 1px solid rgba(14, 165, 233, 0.35) !important;
          color: #38bdf8 !important;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background 0.2s ease !important;
        }
        .prod-card:hover .project-icon.blue {
          transform: scale(1.08);
          box-shadow: 0 4px 14px rgba(239, 195, 72, 0.3);
          background: rgba(239, 195, 72, 0.2) !important;
          border-color: rgba(239, 195, 72, 0.5) !important;
          color: #EFC348 !important;
        }

        .prod-progress-block {
          background: #1f1d1b;
          border: 1px solid #2e2a26;
          border-radius: 9px;
          padding: 10px 12px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .prod-card:hover .prod-progress-block {
          background: #24211e;
          border-color: #3d3731;
        }
        .prod-progress-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 11px;
          color: #9c948c;
        }
        .prod-progress-head strong {
          color: #EFC348;
          font-size: 11.5px;
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: #141312;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill.blue {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #DEA737, #EFC348);
          transition: width 0.3s ease;
        }

        .prod-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #262320;
          margin-top: auto !important;
        }
        .prod-card-foot span {
          font-size: 11px;
          color: #8c8278;
        }

        .prod-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .prod-card-actions .icon-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #201e1c;
          border: 1px solid #36322e;
          color: #a89f91;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .prod-card-actions .icon-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        .prod-card-actions .action-view:hover,
        .prod-card-actions .icon-button[title*="View"]:hover {
          color: #38bdf8 !important;
          border-color: #0284c7 !important;
          background: rgba(14, 165, 233, 0.15) !important;
        }
        .prod-card-actions .action-edit:hover,
        .prod-card-actions .icon-button[title*="Edit"]:hover {
          color: #EFC348 !important;
          border-color: #DEA737 !important;
          background: rgba(239, 195, 72, 0.15) !important;
        }
        .prod-card-actions .action-delete:hover,
        .prod-card-actions .icon-button[title*="Delete"]:hover {
          color: #ef4444 !important;
          border-color: #dc2626 !important;
          background: rgba(239, 68, 68, 0.15) !important;
        }

        /* Cinema Gold Theme Enhancements */
        .heading-actions .btn-primary,
        form.modal-card .btn-primary {
          background: #EFC348 !important;
          border-color: #EFC348 !important;
          color: #000000 !important;
          font-weight: 750 !important;
          box-shadow: 0 4px 14px rgba(239, 195, 72, 0.35) !important;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease !important;
        }
        .heading-actions .btn-primary:hover,
        form.modal-card .btn-primary:hover {
          background: #F9D558 !important;
          border-color: #F9D558 !important;
          color: #000000 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 22px rgba(239, 195, 72, 0.5) !important;
        }

        .filter-tab-pill {
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }
        .filter-tab-pill:hover {
          border-color: #EFC348 !important;
          color: #f4f0eb !important;
        }
        .filter-tab-pill.active {
          background: rgba(239, 195, 72, 0.16) !important;
          color: #EFC348 !important;
          border-color: #EFC348 !important;
          font-weight: 750 !important;
          box-shadow: 0 0 12px rgba(239, 195, 72, 0.18) !important;
        }

        .segmented button.chosen {
          background: #EFC348 !important;
          color: #000000 !important;
          font-weight: 750 !important;
        }
      /* Modal Form Control Focus & Hover - Cinema Gold */
        .modal-card input:hover,
        .modal-card select:hover,
        .modal-card textarea:hover,
        .form-grid input:hover,
        .form-grid select:hover,
        .form-grid textarea:hover,
        .form-grid-2 input:hover,
        .form-grid-2 select:hover,
        .form-grid-2 textarea:hover,
        .form-grid-3 input:hover,
        .form-grid-3 select:hover,
        .form-grid-3 textarea:hover {
          border-color: rgba(239, 195, 72, 0.5) !important;
        }

        .modal-card input:focus,
        .modal-card select:focus,
        .modal-card textarea:focus,
        .form-grid input:focus,
        .form-grid select:focus,
        .form-grid textarea:focus,
        .form-grid-2 input:focus,
        .form-grid-2 select:focus,
        .form-grid-2 textarea:focus,
        .form-grid-3 input:focus,
        .form-grid-3 select:focus,
        .form-grid-3 textarea:focus {
          border-color: #EFC348 !important;
          box-shadow: 0 0 0 3px rgba(239, 195, 72, 0.25) !important;
          outline: none !important;
        }

            `}</style>

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
              <button type="button" className={viewMode === 'list' ? 'chosen' : ''} onClick={() => setViewMode('list')}><List size={15} /> List</button>
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
                  <div className="prod-progress-block">
                    <div className="prod-progress-head"><span>Timeline Progression</span><strong>{p.progress}%</strong></div>
                    <div className="progress-track"><div className="progress-fill blue" style={{ width: `${p.progress}%` }} /></div>
                  </div>
                  <div className="prod-card-foot">
                    <span>{p.startDate ? `Start: ${p.startDate}` : 'Start: TBD'}</span>
                    <div className="prod-card-actions">
                      <button className="icon-button action-view" onClick={() => setDetailModalProject(p)} title="View Details"><Eye size={16} /></button>
                      <button className="icon-button action-edit" onClick={() => handleOpenEdit(p)} title="Edit"><Edit3 size={16} /></button>
                      <button className="icon-button action-delete" onClick={() => handleDeleteProject(p.id)} title="Delete" style={{ color: '#dc6464' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {!loading && viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 20px' }}>
            {filteredProjects.map(p => (
              <div key={p.id} className="prod-list-card">
                {p.posterUrl ? (
                  <img src={p.posterUrl} alt={p.name} style={{ width: '64px', height: '76px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '64px', height: '76px', background: '#222', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ImageIcon size={24} /></div>
                )}
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '15px', overflowWrap: 'anywhere' }}>{p.name}</strong>
                  <span style={{ color: '#8a96a8', fontSize: '12px' }}>{p.code} · {p.type}</span>
                  <div style={{ marginTop: '7px' }}><span className="status-pill blue">{p.status}</span></div>
                </div>
                <div style={{ flex: '1 1 130px', fontSize: '12px', color: '#a7a09a' }}>
                  <div>Start: {p.startDate || 'TBD'}</div>
                  <div>End: {p.endDate || 'Ongoing'}</div>
                  <div style={{ marginTop: '6px' }}>Progress: {p.progress}%</div>
                </div>
                <div className="prod-card-actions" style={{ marginLeft: 'auto' }}>
                  <button className="icon-button action-view" onClick={() => setDetailModalProject(p)} title="View Details"><Eye size={16} /></button>
                  <button className="icon-button action-edit" onClick={() => handleOpenEdit(p)} title="Edit"><Edit3 size={16} /></button>
                  <button className="icon-button action-delete" onClick={() => handleDeleteProject(p.id)} title="Delete" style={{ color: '#dc6464' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
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
            <Film size={36} style={{ color: '#EFC348', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>No production records resolved</strong>
            <p style={{ margin: 0 }}>The database register layer contains no records matching this query framework selection.</p>
          </div>
        )}
      </div>

      {deleteTargetProject && (
        <div className="modal-backdrop" onClick={() => { if (!deleting) { setDeleteTargetProject(null); setDeleteError(''); } }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="project-delete-title" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 id="project-delete-title">Delete Production Project?</h2>
              <button type="button" className="icon-button" disabled={deleting} onClick={() => { setDeleteTargetProject(null); setDeleteError(''); }} aria-label="Close"><X size={18} /></button>
            </div>
            <p>Are you sure you want to permanently delete <strong>{deleteTargetProject.name}</strong> and all its associated Movies/Web Series, Episodes, Scenes, Cast &amp; Crew, Budgets, Expenses, Invoices, Payments and Equipment Bookings? This cannot be undone.</p>
            {deleteError && (
              <div role="alert" style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                <strong>Cannot Delete Project</strong>
                <p style={{ marginBottom: 0 }}>{deleteError}</p>
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-light" disabled={deleting} onClick={() => { setDeleteTargetProject(null); setDeleteError(''); }}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={deleting} onClick={confirmDeleteProject}>{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

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