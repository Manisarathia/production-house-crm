import { useState, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Clapperboard,
  SlidersHorizontal,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Eye,
  X,
  PlayCircle,
  LayoutGrid,
  List,
  Table as TableIcon,
  IndianRupee,
  MapPin,
  UserCheck,
  TrendingUp,
  Tv
} from 'lucide-react';
import {
  getStoredProjects,
  createProject,
  updateProject,
  deleteProject,
  formatCurrency
} from '../utils/productionStorage.js';

export const MOVIE_POSTERS = {
  'The Last Monsoon': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=700&q=80',
  'City of Echoes': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=700&q=80',
  'Beyond The Frame': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80',
  'Shadows of Varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=700&q=80',
  'Project Kaal: 2049': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=700&q=80',
  'Echoes of Mumbai Nights': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=700&q=80'
};
export const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80';

export const getMoviePoster = (title, customPoster) => {
  if (customPoster && customPoster.trim()) return customPoster;
  if (!title) return DEFAULT_POSTER;
  if (MOVIE_POSTERS[title]) return MOVIE_POSTERS[title];
  const t = title.toLowerCase();
  if (t.includes('monsoon')) return MOVIE_POSTERS['The Last Monsoon'];
  if (t.includes('city') || (t.includes('echoes') && !t.includes('mumbai'))) return MOVIE_POSTERS['City of Echoes'];
  if (t.includes('frame')) return MOVIE_POSTERS['Beyond The Frame'];
  if (t.includes('varanasi')) return MOVIE_POSTERS['Shadows of Varanasi'];
  if (t.includes('kaal')) return MOVIE_POSTERS['Project Kaal: 2049'];
  if (t.includes('mumbai')) return MOVIE_POSTERS['Echoes of Mumbai Nights'];
  return DEFAULT_POSTER;
};

export default function ProjectsProductions() {
  const [projects, setProjects] = useState(() => getStoredProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL'); // 'ALL' | 'LoopNexus' | 'LoopKids'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalProject, setEditModalProject] = useState(null);
  const [detailModalProject, setDetailModalProject] = useState(null);
  const [deleteTargetProject, setDeleteTargetProject] = useState(null);

  // Form states for Create/Edit
  const initialFormState = {
    name: '',
    code: '',
    type: 'Feature Film',
    genre: 'Drama',
    status: 'In Production',
    stage: 'Principal Photography',
    progress: 50,
    budget: '',
    spent: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDeliveryDate: '',
    director: '',
    producer: 'Studio North',
    location: '',
    platform: 'LoopNexus',
    poster: '',
    tone: 'blue',
    synopsis: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        (p.name + ' ' + p.code + ' ' + p.director + ' ' + p.genre + ' ' + p.platform + ' ' + p.location)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || p.status.toLowerCase() === statusFilter.toLowerCase();
      const matchType = typeFilter === 'ALL' || p.type.toLowerCase() === typeFilter.toLowerCase();
      const matchPlatform =
        platformFilter === 'ALL' || p.platform.toLowerCase() === platformFilter.toLowerCase();

      return matchSearch && matchStatus && matchType && matchPlatform;
    });
  }, [projects, searchQuery, statusFilter, typeFilter, platformFilter]);

  // Summary Metrics
  const totalProjectsCount = projects.length;
  const inProductionCount = projects.filter(p => p.status === 'In Production').length;
  const postProdCount = projects.filter(p => p.status === 'Post-production').length;
  const totalBudgetAllocated = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const avgProgress = totalProjectsCount
    ? Math.round(projects.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / totalProjectsCount)
    : 0;

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      code: `PRJ-${Math.floor(100 + Math.random() * 900)}`
    });
    setCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project) => {
    setFormData({
      name: project.name,
      code: project.code,
      type: project.type,
      genre: project.genre,
      status: project.status,
      stage: project.stage,
      progress: project.progress,
      budget: project.budget,
      spent: project.spent,
      startDate: project.startDate || '',
      targetDeliveryDate: project.targetDeliveryDate || '',
      director: project.director,
      producer: project.producer,
      location: project.location,
      platform: project.platform,
      poster: project.poster || '',
      tone: project.tone || 'blue',
      synopsis: project.synopsis || ''
    });
    setEditModalProject(project);
  };

  // Submit Create Project
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const { all } = createProject({
      ...formData,
      progress: Number(formData.progress),
      budget: Number(formData.budget),
      spent: Number(formData.spent)
    });

    setProjects(all);
    setCreateModalOpen(false);
  };

  // Submit Edit Project
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editModalProject || !formData.name.trim()) return;

    const updated = updateProject(editModalProject.id, {
      ...formData,
      progress: Number(formData.progress),
      budget: Number(formData.budget),
      spent: Number(formData.spent)
    });

    setProjects(updated);
    setEditModalProject(null);
    if (detailModalProject && detailModalProject.id === editModalProject.id) {
      setDetailModalProject(updated.find(p => p.id === editModalProject.id));
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTargetProject) return;
    const updated = deleteProject(deleteTargetProject.id);
    setProjects(updated);
    setDeleteTargetProject(null);
    if (detailModalProject && detailModalProject.id === deleteTargetProject.id) {
      setDetailModalProject(null);
    }
  };

  const getStatusTone = (status) => {
    switch (status) {
      case 'In Production':
        return 'blue';
      case 'Post-production':
        return 'green';
      case 'Pre-production':
        return 'purple';
      case 'Completed':
        return 'green';
      case 'Development':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <>
      {/* Premium Cinematic Hover & Interaction Styles for Projects & Productions */}
      <style>{`
        /* Smooth Scrolling & Refined Scrollbars */
        html {
          scroll-behavior: smooth !important;
        }
        * {
          scroll-behavior: smooth;
        }
        .main-area, .page-content, .table-wrap, .modal-card, .filter-tabs {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        ::-webkit-scrollbar-track {
          background: #141414;
        }
        ::-webkit-scrollbar-thumb {
          background: #2f2f2f;
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #e3652e;
        }

        /* Cards Interactive Hover */
        .prod-card, .prod-list-card {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .prod-card {
          overflow: hidden;
          padding-top: 0 !important;
        }
        .prod-card-poster-wrap {
          position: relative;
          width: calc(100% + 36px);
          margin: 0 -18px 14px -18px;
          height: 156px;
          overflow: hidden;
          background: #111;
        }
        .prod-card-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease;
          filter: brightness(0.85) contrast(1.08);
          display: block;
        }
        .prod-card:hover .prod-card-poster-img {
          transform: scale(1.08);
          filter: brightness(1.02) contrast(1.15);
        }
        .prod-card-poster-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(25,25,25,0.15) 45%, #191919 100%);
          pointer-events: none;
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
        }
        .prod-card-poster-badges .badge-tag {
          backdrop-filter: blur(8px);
          background: rgba(20, 20, 20, 0.75);
        }

        /* List View Poster Thumbnail */
        .list-poster-thumb {
          position: relative;
          width: 52px;
          height: 68px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease, box-shadow 0.28s ease;
        }
        .list-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.9) contrast(1.05);
          transition: transform 0.35s ease, filter 0.35s ease;
        }
        .list-poster-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #f07842;
        }
        .prod-list-card:hover .list-poster-thumb {
          transform: scale(1.06);
          border-color: rgba(227, 101, 46, 0.6);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6), 0 0 14px rgba(227, 101, 46, 0.25);
        }
        .prod-list-card:hover .list-poster-img {
          transform: scale(1.1);
          filter: brightness(1.05) contrast(1.12);
        }
        .prod-list-card:hover .list-poster-overlay {
          opacity: 1;
        }

        /* Table View Poster Thumbnail */
        .table-poster-thumb {
          width: 36px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .table-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.9) contrast(1.05);
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .table-wrap tr:hover .table-poster-thumb {
          transform: scale(1.12);
          border-color: #e3652e;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px rgba(227, 101, 46, 0.3);
        }
        .table-wrap tr:hover .table-poster-img {
          transform: scale(1.1);
          filter: brightness(1.05) contrast(1.15);
        }
        .prod-card:hover {
          transform: translateY(-5px);
          border-color: #e3652e !important;
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(227, 101, 46, 0.35), 
                      0 0 25px rgba(227, 101, 46, 0.12) !important;
        }
        .prod-list-card:hover {
          transform: translateY(-3px) translateX(2px);
          border-color: #e3652e !important;
          box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.65), 
                      0 0 0 1px rgba(227, 101, 46, 0.35), 
                      0 0 20px rgba(227, 101, 46, 0.1) !important;
        }
        .prod-list-card:hover h3 {
          color: #ffffff !important;
        }
        .prod-card:hover .project-icon, .prod-list-card:hover .project-icon {
          transform: scale(1.1) rotate(2deg);
          box-shadow: 0 4px 14px rgba(227, 101, 46, 0.35);
        }
        .prod-card .project-icon, .prod-list-card .project-icon {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease;
        }
        .prod-card:hover .prod-card-title-group h3 {
          color: #ffffff;
          transition: color 0.18s ease;
        }
        .prod-card:hover .prod-synopsis {
          color: #c4bcb4;
          transition: color 0.18s ease;
        }
        .prod-card:hover .progress-fill {
          filter: brightness(1.2);
          box-shadow: 0 0 10px currentColor;
        }
        .progress-fill {
          transition: width 0.4s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }

        /* Action Buttons Hover Effects */
        .prod-card-actions .icon-button,
        .table-wrap .icon-button {
          transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          border-radius: 7px;
        }
        .prod-card-actions .icon-button:hover,
        .table-wrap .icon-button:hover {
          transform: scale(1.15);
        }
        .prod-card-actions .icon-button[title*="View"]:hover,
        .table-wrap .icon-button[title*="View"]:hover,
        .table-wrap .icon-button[title*="Details"]:hover {
          color: #70d5e2 !important;
          background: rgba(112, 213, 226, 0.16) !important;
          box-shadow: 0 0 12px rgba(112, 213, 226, 0.25);
        }
        .prod-card-actions .icon-button[title*="Edit"]:hover,
        .table-wrap .icon-button[title*="Edit"]:hover {
          color: #f07842 !important;
          background: rgba(227, 101, 46, 0.18) !important;
          box-shadow: 0 0 12px rgba(227, 101, 46, 0.28);
        }
        .prod-card-actions .icon-button[title*="Delete"]:hover,
        .table-wrap .icon-button[title*="Delete"]:hover {
          color: #ff6b6b !important;
          background: rgba(220, 60, 60, 0.2) !important;
          box-shadow: 0 0 12px rgba(220, 60, 60, 0.35);
        }

        /* KPI Mini-Stats Hover */
        .mini-stat {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.22s ease, 
                      box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mini-stat:hover {
          transform: translateY(-3px);
          border-color: rgba(227, 101, 46, 0.5) !important;
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.5), 
                      0 0 16px rgba(227, 101, 46, 0.12) !important;
        }

        /* Filter Tab Pills Hover */
        .filter-tab-pill {
          transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
        }
        .filter-tab-pill:hover {
          transform: translateY(-2px);
          border-color: #e3652e !important;
          color: #ffffff !important;
          background: rgba(227, 101, 46, 0.12) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }
        .filter-tab-pill.active:hover {
          background: #3a2117 !important;
          color: #f07842 !important;
          box-shadow: 0 4px 14px rgba(227, 101, 46, 0.4);
        }

        /* Table Row Interactive Hover */
        .table-wrap tbody tr {
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .table-wrap tbody tr:hover td {
          background: #231c18 !important;
        }
        .table-wrap tbody tr:hover td:first-child {
          box-shadow: inset 3px 0 0 #e3652e;
        }
        .table-wrap tbody tr:hover strong {
          color: #ffffff;
        }

        /* Badges & Pills Hover */
        .badge-tag, .status-pill {
          transition: transform 0.18s ease, filter 0.18s ease;
        }
        .badge-tag:hover, .status-pill:hover {
          transform: scale(1.06);
          filter: brightness(1.2);
          cursor: default;
        }

        /* Buttons Hover */
        .heading-actions .btn-primary {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }
        .heading-actions .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(227, 101, 46, 0.45);
        }
        .segmented button {
          transition: transform 0.15s ease, color 0.15s ease, background-color 0.15s ease;
        }
        .segmented button:hover:not(.chosen) {
          color: #f4f0eb;
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }
        .table-search {
          border: 1px solid #303030 !important;
          outline: none !important;
          box-shadow: none !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .table-search:hover {
          border-color: rgba(227, 101, 46, 0.5) !important;
        }
        .table-search:focus-within {
          border-color: #e3652e !important;
          box-shadow: 0 0 0 2px rgba(227, 101, 46, 0.25) !important;
          outline: none !important;
        }
        .table-search input,
        .table-search input:focus,
        .table-search input:focus-visible,
        .table-search input:active {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
        }

        /* Refined Typography Enhancements - Slightly Increased Font Sizes */
        .page-heading h1 { font-size: 29px !important; }
        .page-heading p { font-size: 13.5px !important; }
        .eyebrow { font-size: 10.5px !important; letter-spacing: 1.4px !important; }
        .mini-stat span { font-size: 11.5px !important; }
        .mini-stat strong { font-size: 24px !important; }
        .panel-head h2 { font-size: 16px !important; }
        .panel-head p { font-size: 12px !important; }
        .segmented button { font-size: 11px !important; padding: 7px 11px !important; }
        .table-search { font-size: 12px !important; height: 36px !important; }
        .table-search input { font-size: 12px !important; }
        .filter-tab-pill { font-size: 11px !important; padding: 7px 13px !important; }
        .badge-tag { font-size: 10px !important; padding: 4.5px 8px !important; }
        .status-pill { font-size: 10px !important; padding: 5px 9px !important; }
        .btn { font-size: 12.5px !important; padding: 10px 16px !important; }
        .btn-sm { font-size: 11px !important; }
        .table-wrap thead th { font-size: 10.5px !important; letter-spacing: 0.7px !important; padding: 13px 11px !important; }
        .table-wrap tbody td { font-size: 12px !important; padding: 14px 11px !important; }
        .project-name strong { font-size: 13.5px !important; }
        .project-name span { font-size: 11px !important; }
        .prod-card-title-group h3 { font-size: 15.5px !important; }
        .prod-card-title-group span { font-size: 11px !important; }
        .prod-synopsis { font-size: 12px !important; line-height: 1.65 !important; }
        .prod-progress-head { font-size: 11.5px !important; }
        .prod-progress-head strong { font-size: 12.5px !important; }
        .prod-finance-item span { font-size: 10.5px !important; }
        .prod-finance-item strong { font-size: 13.5px !important; }
        .prod-foot-crew span { font-size: 10.5px !important; }
        .prod-foot-crew strong { font-size: 12px !important; }
        .modal-card h2 { font-size: 18px !important; }
        .modal-card label, .form-grid label { font-size: 11.5px !important; }
        .modal-card input, .modal-card select, .modal-card textarea { font-size: 12.5px !important; }
        .detail-section h4 { font-size: 12.5px !important; }
        .detail-item span { font-size: 10.5px !important; }
        .detail-item strong { font-size: 13px !important; }
      `}</style>

      {/* Top Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> PROJECTS & PRODUCTION MANAGEMENT
          </div>
          <h1>Projects & Productions</h1>
          <p>Create, track milestones, monitor budgets and manage all film and episodic productions.</p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* Mini Stats KPI */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Total Productions</span>
          <strong>{totalProjectsCount}</strong>
        </div>
        <div className="mini-stat">
          <span>In Production</span>
          <strong style={{ color: '#f07842' }}>{inProductionCount}</strong>
        </div>
        <div className="mini-stat">
          <span>In Post-Production</span>
          <strong style={{ color: '#67d7a3' }}>{postProdCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Total Capital Allocated</span>
          <strong>{formatCurrency(totalBudgetAllocated)}</strong>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel page-panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2>Active Production Pipeline</h2>
            <p>Showing {filteredProjects.length} of {projects.length} productions across studios.</p>
          </div>

          <div className="inline-actions" style={{ flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div className="segmented">
              <button
                type="button"
                className={viewMode === 'grid' ? 'chosen' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
              >
                <LayoutGrid size={15} /> Grid
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'chosen' : ''}
                onClick={() => setViewMode('list')}
                title="List Grid View"
              >
                <List size={15} /> List
              </button>
              <button
                type="button"
                className={viewMode === 'table' ? 'chosen' : ''}
                onClick={() => setViewMode('table')}
                title="Tabular View"
              >
                <TableIcon size={15} /> Table
              </button>
            </div>

            {/* Search Input */}
            <label className="table-search">
              <Search size={16} />
              <input
                placeholder="Search projects, directors, genres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              STATUS:
            </span>
            <div className="filter-tabs">
              {['ALL', 'In Production', 'Post-production', 'Pre-production', 'Development', 'Completed'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`filter-tab-pill ${statusFilter.toLowerCase() === st.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              FORMAT:
            </span>
            <div className="filter-tabs">
              {['ALL', 'Feature Film', 'Web Series', 'Documentary', 'Short Film'].map(tf => (
                <button
                  key={tf}
                  type="button"
                  className={`filter-tab-pill ${typeFilter.toLowerCase() === tf.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setTypeFilter(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              PLATFORM:
            </span>
            <div className="filter-tabs">
              {['ALL', 'LoopNexus', 'LoopKids'].map(plat => {
                const isPlatKids = plat === 'LoopKids';
                const isActive = platformFilter.toLowerCase() === plat.toLowerCase();
                return (
                  <button
                    key={plat}
                    type="button"
                    className={`filter-tab-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setPlatformFilter(plat)}
                    style={isPlatKids && isActive ? { background: 'rgba(234, 179, 8, 0.22)', color: '#facc15', borderColor: '#eab308' } : undefined}
                  >
                    {plat === 'ALL' ? 'All Platforms' : plat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card Grid View */}
        {viewMode === 'grid' && (
          <div className="production-grid">
            {filteredProjects.map(p => {
              const tone = getStatusTone(p.status);
              const spentPct = p.budget > 0 ? Math.min(100, Math.round((p.spent / p.budget) * 100)) : 0;
              const isKids = p.platform === 'LoopKids';

              return (
                <div className="prod-card" key={p.id}>
                  {/* Poster Banner */}
                  <div className="prod-card-poster-wrap">
                    <img
                      src={getMoviePoster(p.name, p.poster)}
                      alt={p.name}
                      className="prod-card-poster-img"
                      loading="lazy"
                    />
                    <div className="prod-card-poster-gradient" />
                    <div className="prod-card-poster-badges">
                      <span
                        className="badge-tag platform"
                        style={{
                          background: isKids ? 'rgba(234, 179, 8, 0.25)' : 'rgba(42, 28, 22, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: isKids ? '1px solid #eab308' : '1px solid #4a2b1b',
                          color: isKids ? '#facc15' : '#f07842',
                          fontWeight: 700
                        }}
                      >
                        {p.platform}
                      </span>
                      <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {p.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Top */}
                  <div className="prod-card-top">
                    <div className="prod-card-title-group">
                      <div className={`project-icon ${tone}`}>
                        <PlayCircle size={20} />
                      </div>
                      <div>
                        <h3>{p.name}</h3>
                        <span>{p.code} · {p.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="prod-meta-tags">
                    <span className="badge-tag">{p.genre}</span>
                    <span className="badge-tag format">{p.stage}</span>
                  </div>

                  {/* Synopsis */}
                  {p.synopsis && <p className="prod-synopsis">{p.synopsis}</p>}

                  {/* Milestone Progress */}
                  <div className="prod-progress-block">
                    <div className="prod-progress-head">
                      <span>Production Completion</span>
                      <strong>{p.progress}%</strong>
                    </div>
                    <div className="progress-track" style={{ width: '100%', height: '6px' }}>
                      <div
                        className={`progress-fill ${tone}`}
                        style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="prod-finance-row">
                    <div className="prod-finance-item">
                      <span>Total Budget</span>
                      <strong>{formatCurrency(p.budget)}</strong>
                    </div>
                    <div className="prod-finance-item">
                      <span>Spent ({spentPct}%)</span>
                      <strong style={{ color: spentPct > 90 ? '#ff8989' : '#e8e2dc' }}>
                        {formatCurrency(p.spent)}
                      </strong>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="prod-card-foot">
                    <div className="prod-foot-crew">
                      <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px' }}>
                        {p.director ? p.director.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                      </div>
                      <div>
                        <span>Director</span>
                        <strong>{p.director || 'Unassigned'}</strong>
                      </div>
                    </div>

                    <div className="prod-card-actions">
                      <button
                        className="icon-button"
                        onClick={() => setDetailModalProject(p)}
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit Project"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => setDeleteTargetProject(p)}
                        title="Delete Project"
                        style={{ color: '#dc6464' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List Grid View */}
        {viewMode === 'list' && (
          <div className="production-list-grid" style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredProjects.map(p => {
              const tone = getStatusTone(p.status);
              const spentPct = p.budget > 0 ? Math.min(100, Math.round((p.spent / p.budget) * 100)) : 0;

              return (
                <div
                  className="prod-list-card"
                  key={p.id}
                  style={{
                    background: '#191919',
                    border: '1px solid #303030',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Left: Movie Poster Thumbnail + Title + Code + Platform */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: '1.3' }}>
                    <div className="list-poster-thumb">
                      <img
                        src={getMoviePoster(p.name, p.poster)}
                        alt={p.name}
                        className="list-poster-img"
                        loading="lazy"
                      />
                      <div className="list-poster-overlay">
                        <PlayCircle size={18} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>
                          {p.name}
                        </h3>
                        <span className={`status-pill ${tone}`}>{p.status}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#8a96a8' }}>{p.code}</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                        <span className="badge-tag">{p.type}</span>
                        <span
                          className="badge-tag platform"
                          style={{
                            background: p.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                            border: p.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                            color: p.platform === 'LoopKids' ? '#facc15' : '#f07842',
                            fontWeight: 650
                          }}
                        >
                          {p.platform}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage & Progress */}
                  <div style={{ minWidth: '160px', flex: '1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa39d', marginBottom: '5px' }}>
                      <span style={{ color: '#c0b8b1' }}>{p.stage}</span>
                      <strong style={{ color: '#f4f0eb' }}>{p.progress}%</strong>
                    </div>
                    <div className="progress-track" style={{ width: '100%', height: '5px' }}>
                      <div className={`progress-fill ${tone}`} style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
                    </div>
                  </div>

                  {/* Financials */}
                  <div style={{ minWidth: '130px', flex: '0.8' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>BUDGET / SPENT</span>
                    <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{formatCurrency(p.budget)}</strong>
                    <span style={{ fontSize: '11px', color: spentPct > 90 ? '#ff8989' : '#67d7a3' }}>
                      Spent: {formatCurrency(p.spent)} ({spentPct}%)
                    </span>
                  </div>

                  {/* Director / Dates */}
                  <div style={{ minWidth: '140px', flex: '0.9' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>DIRECTOR & DELIVERY</span>
                    <div style={{ fontSize: '12px', color: '#ded7d0', fontWeight: 600 }}>{p.director || 'Unassigned'}</div>
                    <div style={{ fontSize: '11px', color: '#8a96a8' }}>Target: {p.targetDeliveryDate || 'TBD'}</div>
                  </div>

                  {/* Actions */}
                  <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                    <button
                      className="icon-button"
                      onClick={() => setDetailModalProject(p)}
                      title="View Full Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleOpenEdit(p)}
                      title="Edit Project"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setDeleteTargetProject(p)}
                      title="Delete Project"
                      style={{ color: '#dc6464' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabular View */}
        {viewMode === 'table' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PROJECT & CODE</th>
                  <th>FORMAT & GENRE</th>
                  <th>STATUS</th>
                  <th>CURRENT STAGE</th>
                  <th>PROGRESS</th>
                  <th>BUDGET ALLOCATED</th>
                  <th>DELIVERY DATE</th>
                  <th>DISTRIBUTION</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => {
                  const tone = getStatusTone(p.status);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="table-poster-thumb">
                            <img
                              src={getMoviePoster(p.name, p.poster)}
                              alt={p.name}
                              className="table-poster-img"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <strong>{p.name}</strong>
                            <span>{p.code} · {p.director}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.type}</span>
                        <div style={{ fontSize: '11px', color: '#8a96a8' }}>{p.genre}</div>
                      </td>
                      <td>
                        <span className={`status-pill ${tone}`}>{p.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '11.5px', color: '#c0b8b1' }}>{p.stage}</span>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-track">
                            <div className={`progress-fill ${tone}`} style={{ width: `${p.progress}%` }} />
                          </div>
                          <span>{p.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <strong>{formatCurrency(p.budget)}</strong>
                        <div style={{ fontSize: '10.5px', color: '#8a96a8' }}>
                          Spent: {formatCurrency(p.spent)}
                        </div>
                      </td>
                      <td className="date-cell">
                        {p.targetDeliveryDate || 'TBD'}
                      </td>
                      <td>
                        <span
                          className="badge-tag platform"
                          style={{
                            background: p.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                            border: p.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                            color: p.platform === 'LoopKids' ? '#facc15' : '#f07842',
                            fontWeight: 650
                          }}
                        >
                          {p.platform}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            className="icon-button"
                            onClick={() => setDetailModalProject(p)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => setDeleteTargetProject(p)}
                            title="Delete"
                            style={{ color: '#dc6464' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <Film size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
              No production projects found
            </strong>
            <p style={{ margin: 0 }}>Try clearing your search filters or create a new production project.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenCreate}
            >
              <Plus size={16} /> Create Production
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE PROJECT ================= */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleCreateSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Create New Production Project</h2>
                <p>Register a movie, web series, or documentary into the production workflow.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-2">
              <label>
                Project Title *
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Echoes of the Ghats"
                />
              </label>

              <label>
                Project Code
                <input
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. EOG-2026"
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Production Type
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option>Feature Film</option>
                  <option>Web Series</option>
                  <option>Documentary</option>
                  <option>Short Film</option>
                  <option>OTT Special</option>
                </select>
              </label>

              <label>
                Genre
                <input
                  value={formData.genre}
                  onChange={e => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="e.g. Crime / Thriller"
                />
              </label>

              <label>
                Status
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>Development</option>
                  <option>Pre-production</option>
                  <option>In Production</option>
                  <option>Post-production</option>
                  <option>Completed</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Current Production Stage
                <input
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value })}
                  placeholder="e.g. Principal Photography Unit 1"
                />
              </label>

              <label>
                Completion Progress ({formData.progress}%)
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={e => setFormData({ ...formData, progress: e.target.value })}
                  style={{ height: '38px', accentColor: '#e3652e' }}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Allocated Budget (₹ INR)
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. 15000000 (₹1.5 Cr)"
                />
              </label>

              <label>
                Amount Spent (₹ INR)
                <input
                  type="number"
                  min="0"
                  value={formData.spent}
                  onChange={e => setFormData({ ...formData, spent: e.target.value })}
                  placeholder="e.g. 6500000"
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Director
                <input
                  value={formData.director}
                  onChange={e => setFormData({ ...formData, director: e.target.value })}
                  placeholder="e.g. Anurag Kashyap"
                />
              </label>

              <label>
                Lead Producer
                <input
                  value={formData.producer}
                  onChange={e => setFormData({ ...formData, producer: e.target.value })}
                  placeholder="e.g. Zoya Akhtar"
                />
              </label>

              <label>
                Target Platform / Distributor
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="LoopNexus">LoopNexus</option>
                  <option value="LoopKids">LoopKids</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Shooting Locations
                <input
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai, Ladakh, Prague"
                />
              </label>

              <label>
                Target Delivery Date
                <input
                  type="date"
                  value={formData.targetDeliveryDate}
                  onChange={e => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
                />
              </label>
            </div>

            <label>
              Synopsis / Production Brief
              <textarea
                value={formData.synopsis}
                onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
                placeholder="Brief synopsis, premise, or production logline..."
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Save Production
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT PROJECT ================= */}
      {editModalProject && (
        <div className="modal-backdrop" onClick={() => setEditModalProject(null)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleEditSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Update Production: {editModalProject.name}</h2>
                <p>Modify project status, stage milestones, budget and delivery info.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditModalProject(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-2">
              <label>
                Project Title *
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label>
                Project Code
                <input
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Production Type
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option>Feature Film</option>
                  <option>Web Series</option>
                  <option>Documentary</option>
                  <option>Short Film</option>
                  <option>OTT Special</option>
                </select>
              </label>

              <label>
                Genre
                <input
                  value={formData.genre}
                  onChange={e => setFormData({ ...formData, genre: e.target.value })}
                />
              </label>

              <label>
                Status
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>Development</option>
                  <option>Pre-production</option>
                  <option>In Production</option>
                  <option>Post-production</option>
                  <option>Completed</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Current Stage
                <input
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value })}
                />
              </label>

              <label>
                Progress ({formData.progress}%)
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={e => setFormData({ ...formData, progress: e.target.value })}
                  style={{ height: '38px', accentColor: '#e3652e' }}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Budget (₹ INR)
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                />
              </label>

              <label>
                Spent (₹ INR)
                <input
                  type="number"
                  min="0"
                  value={formData.spent}
                  onChange={e => setFormData({ ...formData, spent: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Director
                <input
                  value={formData.director}
                  onChange={e => setFormData({ ...formData, director: e.target.value })}
                />
              </label>

              <label>
                Lead Producer
                <input
                  value={formData.producer}
                  onChange={e => setFormData({ ...formData, producer: e.target.value })}
                />
              </label>

              <label>
                Platform
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="LoopNexus">LoopNexus</option>
                  <option value="LoopKids">LoopKids</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Shooting Locations
                <input
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </label>

              <label>
                Delivery Date
                <input
                  type="date"
                  value={formData.targetDeliveryDate}
                  onChange={e => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
                />
              </label>
            </div>

            <label>
              Movie Poster Image URL (Optional)
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={formData.poster}
                onChange={e => setFormData({ ...formData, poster: e.target.value })}
              />
            </label>

            <label>
              Synopsis
              <textarea
                value={formData.synopsis}
                onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditModalProject(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: VIEW DETAILS ================= */}
      {detailModalProject && (
        <div className="modal-backdrop" onClick={() => setDetailModalProject(null)}>
          <div
            className="modal-card modal-card-lg"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '780px', overflow: 'hidden', padding: 0 }}
          >
            {/* Poster Header */}
            <div style={{ position: 'relative', width: '100%', height: '170px', background: '#111', overflow: 'hidden' }}>
              <img
                src={getMoviePoster(detailModalProject.name, detailModalProject.poster)}
                alt={detailModalProject.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) contrast(1.1)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(25,25,25,0.6) 60%, #191919 100%)' }} />
              <button
                type="button"
                className="icon-button"
                onClick={() => setDetailModalProject(null)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 3 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
              <div className="modal-head" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`project-icon ${getStatusTone(detailModalProject.status)}`}>
                    <Clapperboard size={22} />
                  </div>
                  <div>
                    <h2>{detailModalProject.name}</h2>
                    <p>{detailModalProject.code} · {detailModalProject.type} · {detailModalProject.genre}</p>
                  </div>
                </div>
              </div>

            {/* Overview Section */}
            <div className="detail-section">
              <h4>Production Overview</h4>
              {detailModalProject.synopsis ? (
                <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#c6bdb5', margin: '0 0 14px' }}>
                  {detailModalProject.synopsis}
                </p>
              ) : (
                <p style={{ fontSize: '12.5px', color: '#8a96a8', fontStyle: 'italic', margin: '0 0 14px' }}>
                  No synopsis provided.
                </p>
              )}

              <div className="detail-grid">
                <div className="detail-item">
                  <span>Production Status</span>
                  <strong className={`status-pill ${getStatusTone(detailModalProject.status)}`}>
                    {detailModalProject.status}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Current Milestone</span>
                  <strong>{detailModalProject.stage}</strong>
                </div>
                <div className="detail-item">
                  <span>Target Distribution</span>
                  <strong
                    className="badge-tag platform"
                    style={{
                      background: detailModalProject.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                      border: detailModalProject.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                      color: detailModalProject.platform === 'LoopKids' ? '#facc15' : '#f07842',
                      fontWeight: 650
                    }}
                  >
                    {detailModalProject.platform}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Locations</span>
                  <strong>{detailModalProject.location || 'Studio Lot'}</strong>
                </div>
              </div>
            </div>

            {/* Progress & Milestone */}
            <div className="detail-section">
              <h4>Milestone Progress ({detailModalProject.progress}%)</h4>
              <div className="progress-track" style={{ width: '100%', height: '8px', marginBottom: '10px' }}>
                <div
                  className={`progress-fill ${getStatusTone(detailModalProject.status)}`}
                  style={{ width: `${detailModalProject.progress}%` }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8a96a8' }}>
                <span>Start: {detailModalProject.startDate || 'Not specified'}</span>
                <span>Delivery: {detailModalProject.targetDeliveryDate || 'TBD'}</span>
              </div>
            </div>

            {/* Budget & Financial Health */}
            <div className="detail-section">
              <h4>Financial Breakdown</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Allocated Budget</span>
                  <strong style={{ fontSize: '16.5px' }}>{formatCurrency(detailModalProject.budget)}</strong>
                </div>
                <div className="detail-item">
                  <span>Amount Utilized</span>
                  <strong style={{ fontSize: '16.5px', color: '#f07842' }}>
                    {formatCurrency(detailModalProject.spent)}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Remaining Funds</span>
                  <strong style={{ fontSize: '16.5px', color: '#67d7a3' }}>
                    {formatCurrency(Math.max(0, detailModalProject.budget - detailModalProject.spent))}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Burn Rate</span>
                  <strong style={{ fontSize: '16.5px' }}>
                    {detailModalProject.budget > 0
                      ? `${Math.round((detailModalProject.spent / detailModalProject.budget) * 100)}%`
                      : '0%'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Key Personnel */}
            <div className="detail-section">
              <h4>Key Production Personnel</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Director</span>
                  <strong>{detailModalProject.director || 'Unassigned'}</strong>
                </div>
                <div className="detail-item">
                  <span>Executive / Lead Producer</span>
                  <strong>{detailModalProject.producer || 'Studio North'}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDetailModalProject(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleOpenEdit(detailModalProject);
                }}
              >
                <Edit3 size={15} /> Edit Production
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteTargetProject && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetProject(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Delete Production?</h2>
                <p>Confirm deletion of this production project record.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeleteTargetProject(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="delete-confirm-box">
              <strong>Warning: This action cannot be undone.</strong>
              You are about to delete <strong>{deleteTargetProject.name}</strong> ({deleteTargetProject.code}).
              All milestone logs and budget assignments for this production will be removed from your local storage.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeleteTargetProject(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} /> Yes, Delete Production
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
