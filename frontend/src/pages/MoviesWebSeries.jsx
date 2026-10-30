import { useState, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Tv,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  X,
  Play,
  LayoutGrid,
  List,
  Table as TableIcon,
  Languages,
  Sparkles,
  ShieldAlert,
  Volume2,
  MonitorPlay,
  Clock,
  Layers
} from 'lucide-react';
import {
  getStoredTitles,
  getStoredProjects,
  createTitle,
  updateTitle,
  deleteTitle
} from '../utils/productionStorage.js';

export const MOVIE_POSTERS = {
  'The Last Monsoon': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=700&q=80',
  'City of Echoes': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=700&q=80',
  'Beyond The Frame': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80',
  'Shadows of Varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=700&q=80',
  'Project Kaal: 2049': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=700&q=80',
  'Project Kaal: 2049 (Season 1)': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=700&q=80',
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

export default function MoviesWebSeries() {
  const [titles, setTitles] = useState(() => getStoredTitles());
  const [projects] = useState(() => getStoredProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'Movie' | 'Web Series' | 'Documentary'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState(null);
  const [detailModalTitle, setDetailModalTitle] = useState(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState(null);

  // Form State
  const initialFormState = {
    title: '',
    category: 'Movie',
    seasons: 'Feature Film',
    episodes: 1,
    runtime: '120 minutes',
    releaseType: 'Loop Exclusive',
    platform: 'LoopNexus',
    genre: 'Drama',
    censorRating: 'U/A 16+',
    contentStatus: 'In Scripting',
    associatedProject: projects[0]?.name || 'None',
    masterFormat: '4K Dolby Vision · Atmos',
    audioLanguages: 'Hindi (Original), English',
    subtitles: 'English, Hindi',
    targetReleaseDate: '',
    director: '',
    tone: 'orange',
    poster: '',
    logline: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtered titles
  const filteredTitles = useMemo(() => {
    return titles.filter(t => {
      const matchSearch =
        (t.title + ' ' + t.director + ' ' + t.platform + ' ' + t.genre + ' ' + t.censorRating + ' ' + t.audioLanguages)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchCategory =
        categoryFilter === 'ALL' || t.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchStatus =
        statusFilter === 'ALL' || t.contentStatus.toLowerCase() === statusFilter.toLowerCase();

      const matchPlatform =
        platformFilter === 'ALL' || t.platform.toLowerCase() === platformFilter.toLowerCase();

      return matchSearch && matchCategory && matchStatus && matchPlatform;
    });
  }, [titles, searchQuery, categoryFilter, statusFilter, platformFilter]);

  // KPI Metrics
  const totalTitles = titles.length;
  const moviesCount = titles.filter(t => t.category === 'Movie').length;
  const seriesCount = titles.filter(t => t.category === 'Web Series').length;
  const releasedOrReadyCount = titles.filter(
    t => t.contentStatus === 'Released' || t.contentStatus === 'Ready for Delivery'
  ).length;

  // Open Create
  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      associatedProject: projects[0]?.name || 'None'
    });
    setCreateModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (titleItem) => {
    setFormData({
      title: titleItem.title,
      category: titleItem.category,
      seasons: titleItem.seasons || (titleItem.category === 'Web Series' ? 'Season 1' : 'Feature Film'),
      episodes: titleItem.episodes || 1,
      runtime: titleItem.runtime || '',
      releaseType: titleItem.releaseType || 'OTT Exclusive',
      platform: titleItem.platform,
      genre: titleItem.genre,
      censorRating: titleItem.censorRating || 'U/A 16+',
      contentStatus: titleItem.contentStatus || 'In Scripting',
      associatedProject: titleItem.associatedProject || 'None',
      masterFormat: titleItem.masterFormat || '4K UHD',
      audioLanguages: titleItem.audioLanguages || 'Hindi',
      subtitles: titleItem.subtitles || 'English',
      targetReleaseDate: titleItem.targetReleaseDate || '',
      director: titleItem.director || '',
      tone: titleItem.tone || 'orange',
      poster: titleItem.poster || '',
      logline: titleItem.logline || ''
    });
    setEditModalTitle(titleItem);
  };

  // Create Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const { all } = createTitle({
      ...formData,
      episodes: Number(formData.episodes)
    });

    setTitles(all);
    setCreateModalOpen(false);
  };

  // Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editModalTitle || !formData.title.trim()) return;

    const updated = updateTitle(editModalTitle.id, {
      ...formData,
      episodes: Number(formData.episodes)
    });

    setTitles(updated);
    setEditModalTitle(null);
    if (detailModalTitle && detailModalTitle.id === editModalTitle.id) {
      setDetailModalTitle(updated.find(t => t.id === editModalTitle.id));
    }
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deleteTargetTitle) return;
    const updated = deleteTitle(deleteTargetTitle.id);
    setTitles(updated);
    setDeleteTargetTitle(null);
    if (detailModalTitle && detailModalTitle.id === deleteTargetTitle.id) {
      setDetailModalTitle(null);
    }
  };

  const getStatusTone = (status) => {
    switch (status) {
      case 'Released':
        return 'green';
      case 'Ready for Delivery':
        return 'green';
      case 'VFX & Grading':
        return 'blue';
      case 'Filming':
        return 'orange';
      case 'In Scripting':
        return 'purple';
      default:
        return 'blue';
    }
  };

  return (
    <>
      {/* Premium Cinematic Hover & Interaction Styles for Movies & Web Series */}
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

        /* Title Cards Interactive Hover */
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
        .table-wrap .icon-button[title*="Details"]:hover,
        .prod-card-actions .icon-button[title*="Metadata"]:hover {
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
          <h1>Movies & Web Series</h1>
          <p>Manage the master catalog of films, episodic series, release schedules, and streaming certifications.</p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Add Title
          </button>
        </div>
      </div>

      {/* KPI Mini-Stats */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Catalog Titles</span>
          <strong>{totalTitles}</strong>
        </div>
        <div className="mini-stat">
          <span>Feature Movies</span>
          <strong style={{ color: '#f07842' }}>{moviesCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Web Series & Shows</span>
          <strong style={{ color: '#70d5e2' }}>{seriesCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Ready / Released</span>
          <strong style={{ color: '#67d7a3' }}>{releasedOrReadyCount}</strong>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel page-panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2>Content Library & Release Pipeline</h2>
            <p>Showing {filteredTitles.length} of {titles.length} titles registered in distribution.</p>
          </div>

          <div className="inline-actions" style={{ flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div className="segmented">
              <button
                type="button"
                className={viewMode === 'grid' ? 'chosen' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid Cards"
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
                title="Table View"
              >
                <TableIcon size={15} /> Table
              </button>
            </div>

            {/* Search */}
            <label className="table-search">
              <Search size={16} />
              <input
                placeholder="Search titles, platforms, languages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              TYPE:
            </span>
            <div className="filter-tabs">
              {['ALL', 'Movie', 'Web Series', 'Documentary'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-tab-pill ${categoryFilter.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'ALL' ? 'All Content' : cat === 'Movie' ? 'Feature Movies' : cat === 'Web Series' ? 'Web Series' : 'Documentaries'}
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              PIPELINE:
            </span>
            <div className="filter-tabs">
              {['ALL', 'In Scripting', 'Filming', 'VFX & Grading', 'Ready for Delivery', 'Released'].map(st => (
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

          {/* Platform Tabs */}
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

        {/* Cards Grid */}
        {viewMode === 'grid' && (
          <div className="production-grid">
            {filteredTitles.map(t => {
              const tone = getStatusTone(t.contentStatus);
              const isSeries = t.category === 'Web Series';
              const isKids = t.platform === 'LoopKids';

              return (
                <div className="prod-card" key={t.id}>
                  {/* Movie Poster Banner */}
                  <div className="prod-card-poster-wrap">
                    <img
                      src={getMoviePoster(t.title, t.poster)}
                      alt={t.title}
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
                        {t.platform}
                      </span>
                      <span className={`status-pill ${tone}`} style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {t.contentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Top Row */}
                  <div className="prod-card-top">
                    <div className="prod-card-title-group">
                      <div className={`project-icon ${tone}`}>
                        {isSeries ? <Tv size={20} /> : <Film size={20} />}
                      </div>
                      <div>
                        <h3>{t.title}</h3>
                        <span>{t.category} · {t.seasons || (isSeries ? 'Season 1' : 'Feature')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="prod-meta-tags">
                    <span className="badge-tag rating">{t.censorRating}</span>
                    <span className="badge-tag format">{t.masterFormat}</span>
                    <span className="badge-tag">{t.genre}</span>
                  </div>

                  {/* Logline */}
                  {t.logline && <p className="prod-synopsis">{t.logline}</p>}

                  {/* Specs / Runtime block */}
                  <div className="prod-progress-block">
                    <div className="prod-progress-head">
                      <span>Runtime / Scale</span>
                      <strong>{t.runtime}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#c0b8b1' }}>
                      <Languages size={13} style={{ color: '#f07842', flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {t.audioLanguages}
                      </span>
                    </div>
                  </div>

                  {/* Project connection & release date */}
                  <div className="prod-finance-row">
                    <div className="prod-finance-item">
                      <span>Parent Project</span>
                      <strong style={{ fontSize: '10.5px' }}>{t.associatedProject}</strong>
                    </div>
                    <div className="prod-finance-item">
                      <span>Target Release</span>
                      <strong style={{ fontSize: '10.5px', color: '#67d7a3' }}>
                        {t.targetReleaseDate || 'TBD'}
                      </strong>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="prod-card-foot">
                    <div className="prod-foot-crew">
                      <div className="avatar avatar-blue" style={{ width: '28px', height: '28px', fontSize: '9px' }}>
                        {t.director ? t.director.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'DIR'}
                      </div>
                      <div>
                        <span>Director</span>
                        <strong>{t.director || 'Unassigned'}</strong>
                      </div>
                    </div>

                    <div className="prod-card-actions">
                      <button
                        className="icon-button"
                        onClick={() => setDetailModalTitle(t)}
                        title="View Metadata"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => handleOpenEdit(t)}
                        title="Edit Title"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => setDeleteTargetTitle(t)}
                        title="Delete Title"
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
            {filteredTitles.map(t => {
              const tone = getStatusTone(t.contentStatus);
              const isSeries = t.category === 'Web Series';

              return (
                <div
                  className="prod-list-card"
                  key={t.id}
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
                  {/* Left: Movie Poster Thumbnail + Title + Category + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: '1.3' }}>
                    <div className="list-poster-thumb">
                      <img
                        src={getMoviePoster(t.title, t.poster)}
                        alt={t.title}
                        className="list-poster-img"
                        loading="lazy"
                      />
                      <div className="list-poster-overlay">
                        {isSeries ? <Tv size={18} /> : <Film size={18} />}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>
                          {t.title}
                        </h3>
                        <span className={`status-pill ${tone}`}>{t.contentStatus}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#8a96a8' }}>{t.category}</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                        <span
                          className="badge-tag platform"
                          style={{
                            background: t.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                            border: t.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                            color: t.platform === 'LoopKids' ? '#facc15' : '#f07842',
                            fontWeight: 650
                          }}
                        >
                          {t.platform}
                        </span>
                        <span className="badge-tag rating">{t.censorRating}</span>
                        <span className="badge-tag format">{t.masterFormat}</span>
                      </div>
                    </div>
                  </div>

                  {/* Runtime & Structure */}
                  <div style={{ minWidth: '150px', flex: '1' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>RUNTIME & SCALE</span>
                    <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{t.runtime}</strong>
                    <span style={{ fontSize: '11px', color: '#c0b8b1' }}>{t.seasons}</span>
                  </div>

                  {/* Languages */}
                  <div style={{ minWidth: '150px', flex: '1' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>AUDIO & SUBTITLES</span>
                    <div style={{ fontSize: '11.5px', color: '#ded7d0', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.audioLanguages}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8a96a8' }}>Subs: {t.subtitles}</div>
                  </div>

                  {/* Release / Project */}
                  <div style={{ minWidth: '140px', flex: '0.9' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>TARGET RELEASE</span>
                    <strong style={{ fontSize: '13px', color: '#67d7a3', display: 'block' }}>{t.targetReleaseDate || 'TBD'}</strong>
                    <span style={{ fontSize: '11px', color: '#8a96a8' }}>Project: {t.associatedProject}</span>
                  </div>

                  {/* Actions */}
                  <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                    <button
                      className="icon-button"
                      onClick={() => setDetailModalTitle(t)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleOpenEdit(t)}
                      title="Edit Title"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setDeleteTargetTitle(t)}
                      title="Delete Title"
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
                  <th>TITLE & FORMAT</th>
                  <th>PARENT PRODUCTION</th>
                  <th>DISTRIBUTION / LOOP OTT</th>
                  <th>CENSOR & RUNTIME</th>
                  <th>MASTER SPECS</th>
                  <th>LANGUAGES</th>
                  <th>STATUS</th>
                  <th>RELEASE DATE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTitles.map(t => {
                  const tone = getStatusTone(t.contentStatus);
                  const isSeries = t.category === 'Web Series';

                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="project-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="table-poster-thumb">
                            <img
                              src={getMoviePoster(t.title, t.poster)}
                              alt={t.title}
                              className="table-poster-img"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <strong>{t.title}</strong>
                            <span>{t.category} · {t.seasons}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{t.associatedProject}</span>
                        <div style={{ fontSize: '11px', color: '#8a96a8' }}>Dir: {t.director}</div>
                      </td>
                      <td>
                        <span
                          className="badge-tag platform"
                          style={{
                            background: t.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                            border: t.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                            color: t.platform === 'LoopKids' ? '#facc15' : '#f07842',
                            fontWeight: 650
                          }}
                        >
                          {t.platform}
                        </span>
                        <div style={{ fontSize: '10.5px', color: '#8a96a8', marginTop: '3px' }}>
                          {t.releaseType}
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag rating">{t.censorRating}</span>
                        <div style={{ fontSize: '11px', color: '#a7a09a', marginTop: '3px' }}>
                          {t.runtime}
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag format">{t.masterFormat}</span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11.5px' }}>
                          {t.audioLanguages}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${tone}`}>{t.contentStatus}</span>
                      </td>
                      <td className="date-cell">
                        {t.targetReleaseDate || 'TBD'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            className="icon-button"
                            onClick={() => setDetailModalTitle(t)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => handleOpenEdit(t)}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => setDeleteTargetTitle(t)}
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

        {filteredTitles.length === 0 && (
          <div className="empty-state">
            <Tv size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
              No titles match your criteria
            </strong>
            <p style={{ margin: 0 }}>Try clearing your search filters or catalog a new movie or web series.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenCreate}
            >
              <Plus size={16} /> Add New Title
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE TITLE ================= */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleCreateSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Add Movie or Web Series</h2>
                <p>Register a title release in the catalog with streaming and distribution specs.</p>
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
                Title Name *
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. City of Echoes"
                />
              </label>

              <label>
                Category
                <select
                  value={formData.category}
                  onChange={e => {
                    const cat = e.target.value;
                    setFormData({
                      ...formData,
                      category: cat,
                      seasons: cat === 'Web Series' ? 'Season 1' : 'Feature Film',
                      runtime: cat === 'Web Series' ? '8 Episodes · ~45m each' : '124 minutes'
                    });
                  }}
                >
                  <option>Movie</option>
                  <option>Web Series</option>
                  <option>Documentary</option>
                </select>
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                {formData.category === 'Web Series' ? 'Season Designation' : 'Film Type'}
                <input
                  value={formData.seasons}
                  onChange={e => setFormData({ ...formData, seasons: e.target.value })}
                  placeholder={formData.category === 'Web Series' ? 'Season 1' : 'Feature Film'}
                />
              </label>

              <label>
                {formData.category === 'Web Series' ? 'Number of Episodes' : 'Episode Count'}
                <input
                  type="number"
                  min="1"
                  value={formData.episodes}
                  onChange={e => setFormData({ ...formData, episodes: e.target.value })}
                />
              </label>

              <label>
                Runtime / Format Detail
                <input
                  value={formData.runtime}
                  onChange={e => setFormData({ ...formData, runtime: e.target.value })}
                  placeholder="e.g. 138 minutes or 8 Episodes"
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Associated Production Project
                <select
                  value={formData.associatedProject}
                  onChange={e => setFormData({ ...formData, associatedProject: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                  <option value="Independent Title">Independent Title</option>
                </select>
              </label>

              <label>
                Release Platform / Partner
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="LoopNexus">LoopNexus</option>
                  <option value="LoopKids">LoopKids</option>
                </select>
              </label>

              <label>
                Release Strategy
                <select
                  value={formData.releaseType}
                  onChange={e => setFormData({ ...formData, releaseType: e.target.value })}
                >
                  <option>Loop Exclusive</option>
                  <option>Direct-to-Digital</option>
                  <option>Theatrical + Loop Stream</option>
                  <option>Festival Run</option>
                  <option>Loop PPV (TVOD)</option>
                </select>
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Censor Certification
                <select
                  value={formData.censorRating}
                  onChange={e => setFormData({ ...formData, censorRating: e.target.value })}
                >
                  <option>U (Universal)</option>
                  <option>U/A 7+</option>
                  <option>U/A 13+</option>
                  <option>U/A 16+</option>
                  <option>A (Adult 18+)</option>
                </select>
              </label>

              <label>
                Master Delivery Format
                <input
                  value={formData.masterFormat}
                  onChange={e => setFormData({ ...formData, masterFormat: e.target.value })}
                  placeholder="e.g. 4K Dolby Vision · Atmos"
                />
              </label>

              <label>
                Pipeline Status
                <select
                  value={formData.contentStatus}
                  onChange={e => setFormData({ ...formData, contentStatus: e.target.value })}
                >
                  <option>In Scripting</option>
                  <option>Filming</option>
                  <option>Picture Locked</option>
                  <option>VFX & Grading</option>
                  <option>Ready for Delivery</option>
                  <option>Released</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Audio Tracks / Dubs
                <input
                  value={formData.audioLanguages}
                  onChange={e => setFormData({ ...formData, audioLanguages: e.target.value })}
                  placeholder="e.g. Hindi (Original), Tamil, Telugu, English"
                />
              </label>

              <label>
                Subtitles
                <input
                  value={formData.subtitles}
                  onChange={e => setFormData({ ...formData, subtitles: e.target.value })}
                  placeholder="e.g. English, Hindi, Spanish"
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Director
                <input
                  value={formData.director}
                  onChange={e => setFormData({ ...formData, director: e.target.value })}
                  placeholder="e.g. Anand Gandhi"
                />
              </label>

              <label>
                Target Release Date
                <input
                  type="date"
                  value={formData.targetReleaseDate}
                  onChange={e => setFormData({ ...formData, targetReleaseDate: e.target.value })}
                />
              </label>
            </div>

            <label>
              Movie Poster Image URL (Optional)
              <input
                type="url"
                value={formData.poster}
                onChange={e => setFormData({ ...formData, poster: e.target.value })}
                placeholder="https://images.unsplash.com/... or paste poster image URL"
              />
            </label>

            <label>
              Logline / Synopsis
              <textarea
                value={formData.logline}
                onChange={e => setFormData({ ...formData, logline: e.target.value })}
                placeholder="Hook, logline, or plot premise..."
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
                <Plus size={16} /> Save Title
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT TITLE ================= */}
      {editModalTitle && (
        <div className="modal-backdrop" onClick={() => setEditModalTitle(null)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleEditSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Update Title: {editModalTitle.title}</h2>
                <p>Modify streaming specs, release status, censor rating and distribution.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditModalTitle(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-2">
              <label>
                Title Name *
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </label>

              <label>
                Category
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Movie</option>
                  <option>Web Series</option>
                  <option>Documentary</option>
                </select>
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Season / Film Type
                <input
                  value={formData.seasons}
                  onChange={e => setFormData({ ...formData, seasons: e.target.value })}
                />
              </label>

              <label>
                Episode Count
                <input
                  type="number"
                  min="1"
                  value={formData.episodes}
                  onChange={e => setFormData({ ...formData, episodes: e.target.value })}
                />
              </label>

              <label>
                Runtime / Scale
                <input
                  value={formData.runtime}
                  onChange={e => setFormData({ ...formData, runtime: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Associated Production Project
                <select
                  value={formData.associatedProject}
                  onChange={e => setFormData({ ...formData, associatedProject: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                  <option value="Independent Title">Independent Title</option>
                </select>
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

              <label>
                Release Strategy
                <select
                  value={formData.releaseType}
                  onChange={e => setFormData({ ...formData, releaseType: e.target.value })}
                >
                  <option>Loop Exclusive</option>
                  <option>Direct-to-Digital</option>
                  <option>Theatrical + Loop Stream</option>
                  <option>Festival Run</option>
                  <option>Loop PPV (TVOD)</option>
                </select>
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Censor Certification
                <select
                  value={formData.censorRating}
                  onChange={e => setFormData({ ...formData, censorRating: e.target.value })}
                >
                  <option>U (Universal)</option>
                  <option>U/A 7+</option>
                  <option>U/A 13+</option>
                  <option>U/A 16+</option>
                  <option>A (Adult 18+)</option>
                </select>
              </label>

              <label>
                Master Format
                <input
                  value={formData.masterFormat}
                  onChange={e => setFormData({ ...formData, masterFormat: e.target.value })}
                />
              </label>

              <label>
                Pipeline Status
                <select
                  value={formData.contentStatus}
                  onChange={e => setFormData({ ...formData, contentStatus: e.target.value })}
                >
                  <option>In Scripting</option>
                  <option>Filming</option>
                  <option>Picture Locked</option>
                  <option>VFX & Grading</option>
                  <option>Ready for Delivery</option>
                  <option>Released</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Audio Languages
                <input
                  value={formData.audioLanguages}
                  onChange={e => setFormData({ ...formData, audioLanguages: e.target.value })}
                />
              </label>

              <label>
                Subtitles
                <input
                  value={formData.subtitles}
                  onChange={e => setFormData({ ...formData, subtitles: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Director
                <input
                  value={formData.director}
                  onChange={e => setFormData({ ...formData, director: e.target.value })}
                />
              </label>

              <label>
                Release Date
                <input
                  type="date"
                  value={formData.targetReleaseDate}
                  onChange={e => setFormData({ ...formData, targetReleaseDate: e.target.value })}
                />
              </label>
            </div>

            <label>
              Movie Poster Image URL (Optional)
              <input
                type="url"
                value={formData.poster}
                onChange={e => setFormData({ ...formData, poster: e.target.value })}
                placeholder="https://images.unsplash.com/... or paste poster image URL"
              />
            </label>

            <label>
              Logline / Synopsis
              <textarea
                value={formData.logline}
                onChange={e => setFormData({ ...formData, logline: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditModalTitle(null)}
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
      {detailModalTitle && (
        <div className="modal-backdrop" onClick={() => setDetailModalTitle(null)}>
          <div
            className="modal-card modal-card-lg"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '780px', overflow: 'hidden', padding: 0 }}
          >
            {/* Poster Header */}
            <div style={{ position: 'relative', width: '100%', height: '170px', background: '#111', overflow: 'hidden' }}>
              <img
                src={getMoviePoster(detailModalTitle.title, detailModalTitle.poster)}
                alt={detailModalTitle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) contrast(1.1)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(25,25,25,0.6) 60%, #191919 100%)' }} />
              <button
                type="button"
                className="icon-button"
                onClick={() => setDetailModalTitle(null)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 3 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
              <div className="modal-head" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`project-icon ${getStatusTone(detailModalTitle.contentStatus)}`}>
                    {detailModalTitle.category === 'Web Series' ? <Tv size={22} /> : <Film size={22} />}
                  </div>
                  <div>
                    <h2>{detailModalTitle.title}</h2>
                    <p>{detailModalTitle.category} · {detailModalTitle.seasons} · {detailModalTitle.genre}</p>
                  </div>
                </div>
              </div>

            {/* Synopsis Section */}
            <div className="detail-section">
              <h4>Logline & Creative Premise</h4>
              {detailModalTitle.logline ? (
                <p style={{ fontSize: '11px', lineHeight: '1.7', color: '#c6bdb5', margin: '0 0 14px' }}>
                  {detailModalTitle.logline}
                </p>
              ) : (
                <p style={{ fontSize: '11px', color: '#8a96a8', fontStyle: 'italic', margin: '0 0 14px' }}>
                  No logline available.
                </p>
              )}

              <div className="detail-grid">
                <div className="detail-item">
                  <span>Delivery Status</span>
                  <strong className={`status-pill ${getStatusTone(detailModalTitle.contentStatus)}`}>
                    {detailModalTitle.contentStatus}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Streaming Platform</span>
                  <strong
                    className="badge-tag platform"
                    style={{
                      background: detailModalTitle.platform === 'LoopKids' ? 'rgba(234, 179, 8, 0.2)' : '#2a1c16',
                      border: detailModalTitle.platform === 'LoopKids' ? '1px solid rgba(234, 179, 8, 0.55)' : '1px solid #4a2b1b',
                      color: detailModalTitle.platform === 'LoopKids' ? '#facc15' : '#f07842',
                      fontWeight: 650
                    }}
                  >
                    {detailModalTitle.platform}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Censor Rating</span>
                  <strong className="badge-tag rating">{detailModalTitle.censorRating}</strong>
                </div>
                <div className="detail-item">
                  <span>Distribution Model</span>
                  <strong>{detailModalTitle.releaseType}</strong>
                </div>
              </div>
            </div>

            {/* Technical & Delivery Specs */}
            <div className="detail-section">
              <h4>Technical Master Specifications</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Master Format</span>
                  <strong style={{ color: '#bba0ff' }}>{detailModalTitle.masterFormat}</strong>
                </div>
                <div className="detail-item">
                  <span>Runtime / Structure</span>
                  <strong>{detailModalTitle.runtime}</strong>
                </div>
                <div className="detail-item">
                  <span>Target Release</span>
                  <strong style={{ color: '#67d7a3' }}>{detailModalTitle.targetReleaseDate || 'TBD'}</strong>
                </div>
                <div className="detail-item">
                  <span>Linked Production Project</span>
                  <strong>{detailModalTitle.associatedProject}</strong>
                </div>
              </div>
            </div>

            {/* Languages & Localization */}
            <div className="detail-section">
              <h4>Audio Dubs & Subtitle Localization</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#202020', padding: '10px 12px', borderRadius: '8px', border: '1px solid #2d2d2d' }}>
                  <span style={{ fontSize: '9px', color: '#8a96a8', display: 'block', marginBottom: '4px' }}>
                    Available Audio Tracks:
                  </span>
                  <strong style={{ fontSize: '11px', color: '#f4f0eb' }}>{detailModalTitle.audioLanguages}</strong>
                </div>
                <div style={{ background: '#202020', padding: '10px 12px', borderRadius: '8px', border: '1px solid #2d2d2d' }}>
                  <span style={{ fontSize: '9px', color: '#8a96a8', display: 'block', marginBottom: '4px' }}>
                    Subtitle Tracks:
                  </span>
                  <strong style={{ fontSize: '11px', color: '#f4f0eb' }}>{detailModalTitle.subtitles}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDetailModalTitle(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleOpenEdit(detailModalTitle);
                }}
              >
                <Edit3 size={15} /> Edit Title
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteTargetTitle && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetTitle(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Delete Title from Catalog?</h2>
                <p>Confirm deletion of this movie / web series entry.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeleteTargetTitle(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="delete-confirm-box">
              <strong>Warning: This action cannot be undone.</strong>
              You are about to delete <strong>{deleteTargetTitle.title}</strong> ({deleteTargetTitle.category}).
              All associated metadata, censor tags, and streaming specs will be removed from your catalog.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeleteTargetTitle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} /> Yes, Delete Title
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
