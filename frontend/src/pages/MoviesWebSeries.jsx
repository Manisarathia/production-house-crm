import { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Tv,
  X,
  PlayCircle,
  LayoutGrid,
  Table as TableIcon,
  Edit3,
  Trash2,
  Languages,
  ImageIcon,
  Eye
} from 'lucide-react';

const MEDIA_API_URL = 'http://localhost:8080/api/production/media-items';
const PROJECTS_API_URL = 'http://localhost:8080/api/production/projects';

export default function MoviesWebSeries() {
  const [titles, setTitles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState(null);
  const [detailModalTitle, setDetailModalTitle] = useState(null);

  const initialFormState = {
    title: '',
    category: 'Movie',
    seasons: 'Feature Film',
    seasonNumber: '',
    runtime: '120 minutes',
    releaseType: 'Loop Exclusive',
    platform: 'LoopNexus',
    genre: 'Drama',
    censorRating: 'U/A 16+',
    contentStatus: 'In Scripting',
    associatedProject: '',
    masterFormat: '4K Dolby Vision · Atmos',
    audioLanguages: 'Hindi (Original), English',
    subtitles: 'English, Hindi',
    targetReleaseDate: '',
    director: '',
    posterUrl: '',
    logline: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchDataFromServer = async () => {
    setLoading(true);
    try {
      const [mediaRes, projectsRes] = await Promise.all([
        fetch(MEDIA_API_URL),
        fetch(PROJECTS_API_URL)
      ]);

      if (mediaRes.ok && projectsRes.ok) {
        const mediaData = await mediaRes.json();
        const projectsData = await projectsRes.json();

        setProjects(projectsData);

        const mappedTitles = mediaData.map(item => ({
          id: item.id,
          title: item.title || 'Untitled Feature',
          category: item.seasonNumber ? 'Web Series' : 'Movie',
          seasons: item.seasonNumber ? `Season ${item.seasonNumber}` : 'Feature Film',
          runtime: item.seasonNumber ? 'Episodic Breakdown' : '128 minutes',
          releaseType: 'OTT Exclusive',
          platform: 'LoopNexus',
          genre: 'Drama/Production',
          censorRating: 'U/A 16+',
          contentStatus: item.project?.stage ? item.project.stage.replace('_', ' ') : 'Ready for Delivery',
          associatedProject: item.project?.title || 'Independent Title',
          masterFormat: '4K HDR UHD',
          audioLanguages: 'Hindi, Tamil, English',
          subtitles: 'English',
          targetReleaseDate: item.project?.startDate || 'TBD',
          director: 'Production Director',
          posterUrl: item.posterUrl || item.project?.posterUrl || '',
          logline: 'Production ledger release tracking module.'
        }));
        setTitles(mappedTitles);
      }
    } catch (error) {
      console.error("Failure synchronising database libraries cluster:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromServer();
  }, []);

  const filteredTitles = useMemo(() => {
    return titles.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [titles, searchQuery, categoryFilter]);

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
      setValidationError('A catalog poster media attachment file is mandatory.');
      return;
    }
    if (!formData.title.trim()) return;

    const payload = {
      title: formData.title,
      associatedProject: formData.associatedProject,
      seasonNumber: formData.category === 'Web Series' && formData.seasonNumber ? parseInt(formData.seasonNumber, 10) : null,
      posterUrl: formData.posterUrl
    };

    try {
      const response = await fetch(MEDIA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormData(initialFormState);
        setCategoryFilter('ALL');
        setSearchQuery('');
        setCreateModalOpen(false);

        await fetchDataFromServer();
      } else {
        const errorData = await response.json();
        setValidationError(errorData.error || "Server validation constraint failure.");
      }
    } catch (error) {
      console.error("Network interface communication failure:", error);
      setValidationError("Failed to communicate with the server repository.");
    }
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.posterUrl) {
      setValidationError('Updating a catalog title requires a mandatory poster asset file.');
      return;
    }

    const payload = {
      title: formData.title,
      associatedProject: formData.associatedProject,
      seasonNumber: formData.category === 'Web Series' ? (formData.seasonNumber ? parseInt(formData.seasonNumber, 10) : 1) : null,
      posterUrl: formData.posterUrl
    };

    try {
      const response = await fetch(`${MEDIA_API_URL}/${editModalTitle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditModalTitle(null);
        await fetchDataFromServer();
      }
    } catch (error) {
      console.error("Network failure processing modification block:", error);
    }
  };

  const handleOpenEdit = (titleItem) => {
    setFormData({
      title: titleItem.title,
      category: titleItem.category,
      seasons: titleItem.seasons,
      seasonNumber: titleItem.category === 'Web Series' ? parseInt(String(titleItem.seasons).replace(/\D/g, ''), 10) || 1 : '',
      runtime: titleItem.runtime,
      releaseType: titleItem.releaseType,
      platform: titleItem.platform,
      genre: titleItem.genre,
      censorRating: titleItem.censorRating,
      contentStatus: titleItem.contentStatus,
      associatedProject: titleItem.associatedProject,
      masterFormat: titleItem.masterFormat,
      audioLanguages: titleItem.audioLanguages,
      subtitles: titleItem.subtitles,
      targetReleaseDate: titleItem.targetReleaseDate,
      director: titleItem.director,
      posterUrl: titleItem.posterUrl,
      logline: titleItem.logline
    });
    setEditModalTitle(titleItem);
  };

  const handlePurgeTitle = async (id) => {
    if (!window.confirm("Confirm deletion of this catalog listing record?")) return;
    try {
      const response = await fetch(`${MEDIA_API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchDataFromServer();
      }
    } catch (error) {
      console.error("Purge instruction communication failed:", error);
    }
  };

  return (
    <>
      <style>{`
        .production-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          align-items: stretch;
        }
        .prod-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: #191919;
          border: 1px solid #303030;
          border-radius: 12px;
          box-sizing: border-box;
          padding: 18px !important;
        }
        .prod-card-poster-wrap {
          position: relative;
          width: calc(100% + 36px);
          margin: -18px -18px 14px -18px !important;
          aspect-ratio: 16 / 11;
          overflow: hidden;
          background: #111;
          border-top-left-radius: 11px;
          border-top-right-radius: 11px;
        }
        .prod-card-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .prod-card-foot {
          margin-top: auto !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #2a2a2a;
        }
}

      `}</style>

      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot" /> PRODUCTION REGISTRY SERVICE</div>
          <h1>Movies & Web Series</h1>
          <p>Manage the master catalog of films, episodic series, release schedules, and streaming certifications.</p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={() => { setFormData(initialFormState); setValidationError(''); setCreateModalOpen(true); }}>
            <Plus size={18} /> Add Title
          </button>
        </div>
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div>
            <h2>Content Library & Release Pipeline</h2>
            <p>Showing {filteredTitles.length} synchronized active layout rows.</p>
          </div>
          <div className="inline-actions">
            <div className="segmented">
              <button type="button" className={viewMode === 'grid' ? 'chosen' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={15} /> Grid</button>
              <button type="button" className={viewMode === 'table' ? 'chosen' : ''} onClick={() => setViewMode('table')}><TableIcon size={15} /> Table</button>
            </div>
            <label className="table-search">
              <Search size={16} />
              <input placeholder="Search library catalogs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </label>
          </div>
        </div>

        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8' }}>CONTENT TYPE:</span>
            <div className="filter-tabs">
              {['ALL', 'Movie', 'Web Series'].map(cat => (
                <button key={cat} type="button" className={`filter-tab-pill ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
                  {cat === 'ALL' ? 'All Content' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8a96a8' }}>Streaming databank logs pipeline matrix...</div>
        ) : (
          viewMode === 'grid' && (
            <div className="production-grid">
              {filteredTitles.map(t => (
                <div className="prod-card" key={t.id}>
                  <div className="prod-card-poster-wrap">
                    {t.posterUrl ? (
                      <img src={t.posterUrl} alt={t.title} className="prod-card-poster-img" />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', color: '#555', width: '100%', height: '100%' }}>
                        <ImageIcon size={40} />
                      </div>
                    )}
                  </div>
                  <div className="prod-card-top">
                    <div className="prod-card-title-group">
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#f4f0eb' }}>{t.title}</h3>
                        <span style={{ fontSize: '12px', color: '#8a96a8' }}>{t.category} · {t.seasons}</span>
                      </div>
                    </div>
                  </div>
                  <div className="prod-card-foot">
                    <span>Project: {t.associatedProject}</span>
                    <div className="prod-card-actions">
                      <button className="icon-button" onClick={() => setDetailModalTitle(t)} title="View Details"><Eye size={16} /></button>
                      <button className="icon-button" onClick={() => handleOpenEdit(t)} title="Edit"><Edit3 size={16} /></button>
                      <button className="icon-button" onClick={() => handlePurgeTitle(t.id)} style={{ color: '#ff6b6b' }} title="Delete"><Trash2 size={16} /></button>
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
                  <th>CONTENT LIBRARIES SPECIFICATION</th>
                  <th>PARENT PRODUCTION PROJECT</th>
                  <th>DISTRIBUTION FORMAT</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTitles.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong><div style={{ fontSize: '11px', color: '#8a96a8' }}>{t.category}</div></td>
                    <td>{t.associatedProject}</td>
                    <td>{t.seasons}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button className="icon-button" onClick={() => setDetailModalTitle(t)}><Eye size={16} /></button>
                        <button className="icon-button" onClick={() => handleOpenEdit(t)}><Edit3 size={16} /></button>
                        <button className="icon-button" onClick={() => handlePurgeTitle(t.id)} style={{ color: '#ff6b6b' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE TITLE ================= */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <form className="modal-card" onSubmit={handleCreateSubmit} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Catalog Content Asset</h2>
              <button type="button" className="icon-button" onClick={() => setCreateModalOpen(false)}><X size={18} /></button>
            </div>
            {validationError && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>{validationError}</div>}
            <label style={{ display: 'block', marginBottom: '10px' }}>Title Name *
              <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. City of Echoes" style={{ width: '100%', marginTop: '5px' }} />
            </label>
            <div className="form-grid-2" style={{ marginTop: '10px' }}>
              <label>Category
                <select
                  value={formData.category}
                  onChange={e => {
                    const cat = e.target.value;
                    setFormData({
                      ...formData,
                      category: cat,
                      seasons: cat === 'Web Series' ? 'Season 1' : 'Feature Film',
                      seasonNumber: cat === 'Web Series' ? '1' : '' // Auto-set defaults
                    });
                  }}
                >
                  <option value="Movie">Movie</option>
                  <option value="Web Series">Web Series</option>
                </select>
              </label>

              {/* DYNAMIC FIELD: Only shows up if 'Web Series' is selected */}
              {formData.category === 'Web Series' && (
                <label>Season Number *
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.seasonNumber}
                    onChange={e => setFormData({ ...formData, seasonNumber: e.target.value })}
                    placeholder="e.g. 1"
                  />
                </label>
              )}

              <label>Associated Production Project Link
                <select value={formData.associatedProject} onChange={e => setFormData({ ...formData, associatedProject: e.target.value })}>
                  <option value="">Select a Project</option>
                  {projects.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                </select>
              </label>
            </div>
            <div style={{ marginTop: '15px', marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Attach Poster File *</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {formData.posterUrl && <img src={formData.posterUrl} alt="Preview" style={{ marginTop: '10px', maxHeight: '90px', borderRadius: '4px', display: 'block' }} />}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Title</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT TITLE ================= */}
      {editModalTitle && (
        <div className="modal-backdrop" onClick={() => setEditModalTitle(null)}>
          <form className="modal-card" onSubmit={handleEditSubmit} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Modify Title: {editModalTitle.title}</h2>
              <button type="button" className="icon-button" onClick={() => setEditModalTitle(null)}><X size={18} /></button>
            </div>
            {validationError && <div style={{ color: '#ff6b6b', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>{validationError}</div>}
            <label style={{ display: 'block', marginBottom: '10px' }}>Title Name *
              <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </label>
            <div style={{ marginTop: '15px', marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Change Poster Asset *</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {formData.posterUrl && <img src={formData.posterUrl} alt="Preview" style={{ marginTop: '10px', maxHeight: '90px', borderRadius: '4px', display: 'block' }} />}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setEditModalTitle(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: VIEW DETAILS ================= */}
      {detailModalTitle && (
        <div className="modal-backdrop" onClick={() => setDetailModalTitle(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-head">
              <div>
                <h2>{detailModalTitle.title}</h2>
                <p>Distribution Specifications Node</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setDetailModalTitle(null)}><X size={18} /></button>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2f2f2f', paddingBottom: '8px' }}>
                <span style={{ color: '#8a96a8' }}>Parent Production Context</span>
                <strong style={{ color: '#f4f0eb' }}>{detailModalTitle.associatedProject}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2f2f2f', paddingBottom: '8px' }}>
                <span style={{ color: '#8a96a8' }}>Distribution Form Constraint</span>
                <strong style={{ color: '#f4f0eb' }}>{detailModalTitle.seasons}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: '#8a96a8' }}>Linked System Entry Key</span>
                <strong style={{ fontFamily: 'monospace', color: '#8a96a8' }}>{detailModalTitle.id}</strong>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '25px' }}>
              <button type="button" className="btn btn-light" onClick={() => setDetailModalTitle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}