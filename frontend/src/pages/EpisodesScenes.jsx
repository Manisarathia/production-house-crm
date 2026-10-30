import { useState, useMemo } from 'react';
import {
  Tv,
  Film,
  Plus,
  Search,
  Clapperboard,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Eye,
  X,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Users,
  Video,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  getStoredEpisodes,
  getStoredScenes,
  getStoredProjects,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  createScene,
  updateScene,
  deleteScene
} from '../utils/productionStorage.js';

export default function EpisodesScenes() {
  const [episodes, setEpisodes] = useState(() => getStoredEpisodes());
  const [scenes, setScenes] = useState(() => getStoredScenes());
  const [projects] = useState(() => getStoredProjects());

  // Active view tab: 'episodes' (Series / Episode breakdown) or 'stripboard' (Master scene stripboard)
  const [activeTab, setActiveTab] = useState('episodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [settingFilter, setSettingFilter] = useState('ALL'); // 'ALL' | 'INT' | 'EXT'

  // Expanded episodes in breakdown view
  const [expandedEpisodes, setExpandedEpisodes] = useState({ 'EP-401': true, 'EP-403': true });

  // Modals
  const [createEpisodeModalOpen, setCreateEpisodeModalOpen] = useState(false);
  const [editEpisodeModalItem, setEditEpisodeModalItem] = useState(null);
  const [deleteTargetEpisode, setDeleteTargetEpisode] = useState(null);

  const [createSceneModalOpen, setCreateSceneModalOpen] = useState(false);
  const [editSceneModalItem, setEditSceneModalItem] = useState(null);
  const [detailModalScene, setDetailModalScene] = useState(null);
  const [deleteTargetScene, setDeleteTargetScene] = useState(null);

  // Forms State
  const initialEpisodeForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    episodeNumber: 1,
    title: '',
    runtime: '50 mins',
    status: 'Script Locked',
    director: 'Vikramaditya Motwane',
    writer: 'Varun Grover',
    targetAirDate: '',
    synopsis: '',
    scenesCount: 20,
    scenesCompleted: 0
  };

  const initialSceneForm = {
    project: projects[0]?.name || 'The Last Monsoon',
    episodeId: 'EP-401',
    episodeName: 'EP 1 · The Cloudburst',
    sceneNumber: '',
    heading: 'INT. PRODUCTION SET - DAY',
    setting: 'INT',
    timeOfDay: 'DAY',
    pages: '2 0/8',
    location: 'Studio Floor 1',
    characters: 'Lead Cast, Supporting Cast',
    status: 'Scheduled',
    shootDate: '',
    equipment: 'Standard Cinema Camera, Lighting Rig',
    description: ''
  };

  const [episodeForm, setEpisodeForm] = useState(initialEpisodeForm);
  const [sceneForm, setSceneForm] = useState(initialSceneForm);

  // Toggle episode accordion
  const toggleEpisodeExpand = (id) => {
    setExpandedEpisodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered Episodes
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(ep => {
      const matchSearch =
        (ep.title + ' ' + ep.project + ' ' + ep.director + ' ' + ep.writer + ' ' + ep.synopsis)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchProject =
        projectFilter === 'ALL' || ep.project.toLowerCase() === projectFilter.toLowerCase();

      const matchStatus =
        statusFilter === 'ALL' || ep.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchProject && matchStatus;
    });
  }, [episodes, searchQuery, projectFilter, statusFilter]);

  // Filtered Scenes
  const filteredScenes = useMemo(() => {
    return scenes.filter(sc => {
      const matchSearch =
        (sc.heading + ' ' + sc.project + ' ' + sc.location + ' ' + sc.characters + ' ' + sc.sceneNumber + ' ' + sc.description)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchProject =
        projectFilter === 'ALL' || sc.project.toLowerCase() === projectFilter.toLowerCase();

      const matchStatus =
        statusFilter === 'ALL' || sc.status.toLowerCase() === statusFilter.toLowerCase();

      const matchSetting =
        settingFilter === 'ALL' || sc.setting.toLowerCase() === settingFilter.toLowerCase();

      return matchSearch && matchProject && matchStatus && matchSetting;
    });
  }, [scenes, searchQuery, projectFilter, statusFilter, settingFilter]);

  // Summary Metrics
  const totalEpisodesCount = episodes.length;
  const totalScenesCount = scenes.length;
  const completedScenesCount = scenes.filter(s => s.status === 'Shot / Done').length;
  const inProgressScenesCount = scenes.filter(s => s.status === 'In Progress').length;
  const percentShot = totalScenesCount ? Math.round((completedScenesCount / totalScenesCount) * 100) : 0;

  // Open Create Episode
  const handleOpenCreateEpisode = () => {
    setEpisodeForm({
      ...initialEpisodeForm,
      episodeNumber: episodes.length + 1,
      project: projects[0]?.name || 'The Last Monsoon'
    });
    setCreateEpisodeModalOpen(true);
  };

  // Open Edit Episode
  const handleOpenEditEpisode = (ep) => {
    setEpisodeForm({
      project: ep.project,
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      runtime: ep.runtime,
      status: ep.status,
      director: ep.director,
      writer: ep.writer,
      targetAirDate: ep.targetAirDate || '',
      synopsis: ep.synopsis || '',
      scenesCount: ep.scenesCount,
      scenesCompleted: ep.scenesCompleted
    });
    setEditEpisodeModalItem(ep);
  };

  // Submit Create Episode
  const handleCreateEpisodeSubmit = (e) => {
    e.preventDefault();
    if (!episodeForm.title.trim()) return;

    const { all } = createEpisode({
      ...episodeForm,
      episodeNumber: Number(episodeForm.episodeNumber),
      scenesCount: Number(episodeForm.scenesCount),
      scenesCompleted: Number(episodeForm.scenesCompleted)
    });

    setEpisodes(all);
    setCreateEpisodeModalOpen(false);
  };

  // Submit Edit Episode
  const handleEditEpisodeSubmit = (e) => {
    e.preventDefault();
    if (!editEpisodeModalItem || !episodeForm.title.trim()) return;

    const updated = updateEpisode(editEpisodeModalItem.id, {
      ...episodeForm,
      episodeNumber: Number(episodeForm.episodeNumber),
      scenesCount: Number(episodeForm.scenesCount),
      scenesCompleted: Number(episodeForm.scenesCompleted)
    });

    setEpisodes(updated);
    setEditEpisodeModalItem(null);
  };

  // Confirm Delete Episode
  const handleConfirmDeleteEpisode = () => {
    if (!deleteTargetEpisode) return;
    const updated = deleteEpisode(deleteTargetEpisode.id);
    setEpisodes(updated);
    setDeleteTargetEpisode(null);
  };

  // Open Create Scene (optionally pre-selected for an episode)
  const handleOpenCreateScene = (targetEpisode = null) => {
    setSceneForm({
      ...initialSceneForm,
      project: targetEpisode ? targetEpisode.project : (projects[0]?.name || 'The Last Monsoon'),
      episodeId: targetEpisode ? targetEpisode.id : (episodes[0]?.id || 'EP-401'),
      episodeName: targetEpisode ? `EP ${targetEpisode.episodeNumber} · ${targetEpisode.title}` : 'Feature Film Master',
      sceneNumber: `Scene ${scenes.length + 1}`
    });
    setCreateSceneModalOpen(true);
  };

  // Open Edit Scene
  const handleOpenEditScene = (sc) => {
    setSceneForm({
      project: sc.project,
      episodeId: sc.episodeId,
      episodeName: sc.episodeName,
      sceneNumber: sc.sceneNumber,
      heading: sc.heading,
      setting: sc.setting,
      timeOfDay: sc.timeOfDay,
      pages: sc.pages,
      location: sc.location,
      characters: sc.characters,
      status: sc.status,
      shootDate: sc.shootDate || '',
      equipment: sc.equipment,
      description: sc.description || ''
    });
    setEditSceneModalItem(sc);
  };

  // Submit Create Scene
  const handleCreateSceneSubmit = (e) => {
    e.preventDefault();
    if (!sceneForm.heading.trim()) return;

    const { all } = createScene(sceneForm);
    setScenes(all);

    // If linked to an episode, update episode scene counter
    if (sceneForm.episodeId && sceneForm.episodeId !== 'FEATURE') {
      const ep = episodes.find(e => e.id === sceneForm.episodeId);
      if (ep) {
        updateEpisode(ep.id, {
          scenesCount: (Number(ep.scenesCount) || 0) + 1,
          scenesCompleted: sceneForm.status === 'Shot / Done' ? (Number(ep.scenesCompleted) || 0) + 1 : (Number(ep.scenesCompleted) || 0)
        });
        setEpisodes(getStoredEpisodes());
      }
    }

    setCreateSceneModalOpen(false);
  };

  // Submit Edit Scene
  const handleEditSceneSubmit = (e) => {
    e.preventDefault();
    if (!editSceneModalItem || !sceneForm.heading.trim()) return;

    const updated = updateScene(editSceneModalItem.id, sceneForm);
    setScenes(updated);
    setEditSceneModalItem(null);
    if (detailModalScene && detailModalScene.id === editSceneModalItem.id) {
      setDetailModalScene(updated.find(s => s.id === editSceneModalItem.id));
    }
  };

  // Confirm Delete Scene
  const handleConfirmDeleteScene = () => {
    if (!deleteTargetScene) return;
    const updated = deleteScene(deleteTargetScene.id);
    setScenes(updated);
    setDeleteTargetScene(null);
    if (detailModalScene && detailModalScene.id === deleteTargetScene.id) {
      setDetailModalScene(null);
    }
  };

  const getSceneStatusTone = (status) => {
    switch (status) {
      case 'Shot / Done':
        return 'green';
      case 'In Progress':
        return 'orange';
      case 'Scheduled':
        return 'blue';
      case 'Postponed':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getTimeIcon = (time) => {
    switch (time?.toUpperCase()) {
      case 'DAY':
        return <Sun size={13} style={{ color: '#f6b74a' }} />;
      case 'NIGHT':
        return <Moon size={13} style={{ color: '#8064e8' }} />;
      case 'DUSK':
        return <Sunset size={13} style={{ color: '#e3652e' }} />;
      case 'DAWN':
        return <Sunrise size={13} style={{ color: '#70d5e2' }} />;
      default:
        return <Sun size={13} />;
    }
  };

  return (
    <>
      {/* Premium Cinematic Hover & Interaction Styles for Episodes & Scenes */}
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

        .table-wrap .icon-button {
          transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          border-radius: 7px;
        }
        .table-wrap .icon-button:hover {
          transform: scale(1.15);
        }
        .table-wrap .icon-button[title*="View"]:hover,
        .table-wrap .icon-button[title*="Breakdown"]:hover {
          color: #70d5e2 !important;
          background: rgba(112, 213, 226, 0.16) !important;
          box-shadow: 0 0 12px rgba(112, 213, 226, 0.25);
        }
        .table-wrap .icon-button[title*="Edit"]:hover {
          color: #f07842 !important;
          background: rgba(227, 101, 46, 0.18) !important;
          box-shadow: 0 0 12px rgba(227, 101, 46, 0.28);
        }
        .table-wrap .icon-button[title*="Delete"]:hover {
          color: #ff6b6b !important;
          background: rgba(220, 60, 60, 0.2) !important;
          box-shadow: 0 0 12px rgba(220, 60, 60, 0.35);
        }
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
        .badge-tag, .status-pill {
          transition: transform 0.18s ease, filter 0.18s ease;
        }
        .badge-tag:hover, .status-pill:hover {
          transform: scale(1.06);
          filter: brightness(1.2);
          cursor: default;
        }
        .heading-actions .btn-primary, .heading-actions .btn-light {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }
        .heading-actions .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(227, 101, 46, 0.45);
        }
        .heading-actions .btn-light:hover {
          transform: translateY(-2px);
          border-color: #e3652e;
          color: #f4f0eb;
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
          <h1>Episodes & Scenes</h1>
          <p>Plan episode arcs, script sluglines, shooting stripboards, and scene camera calls.</p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={() => handleOpenCreateEpisode()}>
            <Tv size={17} /> Add Episode
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateScene()}>
            <Plus size={18} /> Add Scene
          </button>
        </div>
      </div>

      {/* KPI Mini-Stats */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Episodes Tracked</span>
          <strong>{totalEpisodesCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Scripted Scenes</span>
          <strong style={{ color: '#70d5e2' }}>{totalScenesCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Scenes Shot ({percentShot}%)</span>
          <strong style={{ color: '#67d7a3' }}>{completedScenesCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Currently In Production</span>
          <strong style={{ color: '#f07842' }}>{inProgressScenesCount}</strong>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel page-panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2>Production Script & Breakdown</h2>
            <p>
              {activeTab === 'episodes'
                ? `Tracking ${filteredEpisodes.length} episodes across active series.`
                : `Showing ${filteredScenes.length} scenes in master shooting stripboard.`}
            </p>
          </div>

          <div className="inline-actions" style={{ flexWrap: 'wrap' }}>
            {/* Main Tabs Segmented */}
            <div className="segmented">
              <button
                type="button"
                className={activeTab === 'episodes' ? 'chosen' : ''}
                onClick={() => setActiveTab('episodes')}
              >
                <Tv size={15} /> Episodes Breakdown
              </button>
              <button
                type="button"
                className={activeTab === 'stripboard' ? 'chosen' : ''}
                onClick={() => setActiveTab('stripboard')}
              >
                <Layers size={15} /> Scene Stripboard
              </button>
            </div>

            {/* Search */}
            <label className="table-search">
              <Search size={16} />
              <input
                placeholder="Search sluglines, scenes, characters..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Filters Row */}
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              PROJECT:
            </span>
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab-pill ${projectFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setProjectFilter('ALL')}
              >
                All Projects
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`filter-tab-pill ${projectFilter.toLowerCase() === p.name.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setProjectFilter(p.name)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'stripboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
                SETTING:
              </span>
              <div className="filter-tabs">
                {['ALL', 'INT', 'EXT'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-tab-pill ${settingFilter === st ? 'active' : ''}`}
                    onClick={() => setSettingFilter(st)}
                  >
                    {st === 'ALL' ? 'All Environments' : st === 'INT' ? 'INT (Interior)' : 'EXT (Exterior)'}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px', marginLeft: '12px' }}>
                STATUS:
              </span>
              <div className="filter-tabs">
                {['ALL', 'Scheduled', 'In Progress', 'Shot / Done', 'Postponed'].map(st => (
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
          )}
        </div>

        {/* ================= TAB 1: EPISODES BREAKDOWN VIEW ================= */}
        {activeTab === 'episodes' && (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredEpisodes.map(ep => {
              const isExpanded = !!expandedEpisodes[ep.id];
              const epScenes = scenes.filter(s => s.episodeId === ep.id);
              const progressPct = ep.scenesCount > 0 ? Math.round((ep.scenesCompleted / ep.scenesCount) * 100) : 0;

              return (
                <div
                  key={ep.id}
                  style={{
                    background: '#191919',
                    border: '1px solid #303030',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Episode Header Card */}
                  <div
                    style={{
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      cursor: 'pointer',
                      background: isExpanded ? '#1e1c1b' : '#191919',
                      borderBottom: isExpanded ? '1px solid #2d2d2d' : '0'
                    }}
                    onClick={() => toggleEpisodeExpand(ep.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="project-icon blue">
                        <Tv size={19} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb' }}>
                            Episode {ep.episodeNumber}: {ep.title}
                          </h3>
                          <span className={`status-pill ${ep.status === 'Completed' ? 'green' : ep.status === 'Shooting' ? 'orange' : 'blue'}`}>
                            {ep.status}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#a7a09a', display: 'block', marginTop: '3px' }}>
                          {ep.project} · Runtime: {ep.runtime} · Dir: {ep.director} · Writer: {ep.writer}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Scenes progress */}
                      <div style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa39d', marginBottom: '4px' }}>
                          <span>Scenes Shot</span>
                          <strong>{ep.scenesCompleted} / {ep.scenesCount} ({progressPct}%)</strong>
                        </div>
                        <div className="progress-track" style={{ width: '100%', height: '5px' }}>
                          <div
                            className={`progress-fill ${progressPct === 100 ? 'green' : 'blue'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Episode Actions */}
                      <div className="prod-card-actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-light btn-sm"
                          onClick={() => handleOpenCreateScene(ep)}
                          title="Add Scene to this Episode"
                        >
                          <Plus size={14} /> Add Scene
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleOpenEditEpisode(ep)}
                          title="Edit Episode"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => setDeleteTargetEpisode(ep)}
                          title="Delete Episode"
                          style={{ color: '#dc6464' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Expand Arrow */}
                      <div style={{ color: '#8a96a8' }}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Scenes Sub-table */}
                  {isExpanded && (
                    <div style={{ padding: '14px 18px', background: '#141414' }}>
                      {ep.synopsis && (
                        <p style={{ fontSize: '10px', lineHeight: '1.6', color: '#c0b8b1', margin: '0 0 12px', fontStyle: 'italic' }}>
                          <strong>Premise: </strong> {ep.synopsis}
                        </p>
                      )}

                      {epScenes.length > 0 ? (
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>SCENE #</th>
                                <th>SLUGLINE & HEADING</th>
                                <th>ENV</th>
                                <th>TIME</th>
                                <th>PAGES</th>
                                <th>SHOOT LOCATION</th>
                                <th>STATUS</th>
                                <th>SHOOT DATE</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {epScenes.map(sc => {
                                const tone = getSceneStatusTone(sc.status);
                                return (
                                  <tr key={sc.id}>
                                    <td>
                                      <strong style={{ color: '#f07842', fontSize: '12px' }}>{sc.sceneNumber}</strong>
                                    </td>
                                    <td>
                                      <div style={{ fontWeight: 700, color: '#f4f0eb' }}>{sc.heading}</div>
                                      <div style={{ fontSize: '10.5px', color: '#8a96a8', marginTop: '2px' }}>
                                        {sc.characters}
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`badge-tag ${sc.setting === 'INT' ? 'format' : 'platform'}`}>
                                        {sc.setting}
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                        {getTimeIcon(sc.timeOfDay)} {sc.timeOfDay}
                                      </div>
                                    </td>
                                    <td>{sc.pages}</td>
                                    <td>
                                      <div style={{ fontSize: '11.5px', color: '#ded7d0' }}>{sc.location}</div>
                                    </td>
                                    <td>
                                      <span className={`status-pill ${tone}`}>{sc.status}</span>
                                    </td>
                                    <td className="date-cell">{sc.shootDate || 'TBD'}</td>
                                    <td>
                                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                        <button
                                          className="icon-button"
                                          onClick={() => setDetailModalScene(sc)}
                                          title="View Breakdown"
                                        >
                                          <Eye size={15} />
                                        </button>
                                        <button
                                          className="icon-button"
                                          onClick={() => handleOpenEditScene(sc)}
                                          title="Edit Scene"
                                        >
                                          <Edit3 size={15} />
                                        </button>
                                        <button
                                          className="icon-button"
                                          onClick={() => setDeleteTargetScene(sc)}
                                          title="Delete Scene"
                                          style={{ color: '#dc6464' }}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#8a96a8', fontSize: '11px', background: '#1c1c1c', borderRadius: '8px' }}>
                          No scenes broken down for this episode yet.
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginLeft: '12px' }}
                            onClick={() => handleOpenCreateScene(ep)}
                          >
                            <Plus size={13} /> Add First Scene
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredEpisodes.length === 0 && (
              <div className="empty-state">
                <Tv size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
                <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
                  No episodes found
                </strong>
                <p style={{ margin: 0 }}>Try adjusting your filters or create a new episode breakdown.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => handleOpenCreateEpisode()}
                >
                  <Tv size={16} /> Add Episode
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MASTER SCENE STRIPBOARD VIEW ================= */}
        {activeTab === 'stripboard' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SCENE #</th>
                  <th>SLUGLINE / HEADING</th>
                  <th>PRODUCTION & EPISODE</th>
                  <th>ENV</th>
                  <th>TIME OF DAY</th>
                  <th>PAGES</th>
                  <th>SHOOT LOCATION</th>
                  <th>CAST / CHARACTERS</th>
                  <th>STATUS</th>
                  <th>SHOOT DATE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredScenes.map(sc => {
                  const tone = getSceneStatusTone(sc.status);
                  return (
                    <tr key={sc.id}>
                      <td>
                        <strong style={{ color: '#f07842', fontSize: '12px' }}>{sc.sceneNumber}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 750, color: '#f4f0eb' }}>{sc.heading}</div>
                        {sc.description && (
                          <div style={{ fontSize: '10.5px', color: '#8a96a8', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sc.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{sc.project}</span>
                        <div style={{ fontSize: '10.5px', color: '#8a96a8' }}>{sc.episodeName}</div>
                      </td>
                      <td>
                        <span className={`badge-tag ${sc.setting === 'INT' ? 'format' : 'platform'}`}>
                          {sc.setting}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                          {getTimeIcon(sc.timeOfDay)}
                          <span>{sc.timeOfDay}</span>
                        </div>
                      </td>
                      <td>{sc.pages}</td>
                      <td>
                        <div style={{ fontSize: '11.5px', color: '#ded7d0' }}>{sc.location}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                          {sc.characters}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${tone}`}>{sc.status}</span>
                      </td>
                      <td className="date-cell">{sc.shootDate || 'TBD'}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            className="icon-button"
                            onClick={() => setDetailModalScene(sc)}
                            title="View Scene Breakdown"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => handleOpenEditScene(sc)}
                            title="Edit Scene"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => setDeleteTargetScene(sc)}
                            title="Delete Scene"
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

            {filteredScenes.length === 0 && (
              <div className="empty-state">
                <Layers size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
                <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
                  No scenes found in stripboard
                </strong>
                <p style={{ margin: 0 }}>Try clearing search criteria or add a new scene to the stripboard.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => handleOpenCreateScene()}
                >
                  <Plus size={16} /> Add Scene
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE EPISODE ================= */}
      {createEpisodeModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateEpisodeModalOpen(false)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleCreateEpisodeSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Create New Episode</h2>
                <p>Register an episode into a web series production pipeline.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreateEpisodeModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-3">
              <label>
                Parent Web Series *
                <select
                  value={episodeForm.project}
                  onChange={e => setEpisodeForm({ ...episodeForm, project: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Episode Number
                <input
                  type="number"
                  min="1"
                  required
                  value={episodeForm.episodeNumber}
                  onChange={e => setEpisodeForm({ ...episodeForm, episodeNumber: e.target.value })}
                />
              </label>

              <label>
                Episode Title *
                <input
                  required
                  value={episodeForm.title}
                  onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                  placeholder="e.g. The Cloudburst"
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Target Runtime
                <input
                  value={episodeForm.runtime}
                  onChange={e => setEpisodeForm({ ...episodeForm, runtime: e.target.value })}
                  placeholder="e.g. 52 mins"
                />
              </label>

              <label>
                Production Status
                <select
                  value={episodeForm.status}
                  onChange={e => setEpisodeForm({ ...episodeForm, status: e.target.value })}
                >
                  <option>In Scripting</option>
                  <option>Script Locked</option>
                  <option>Shooting</option>
                  <option>Picture Lock</option>
                  <option>Sound & VFX</option>
                  <option>Completed</option>
                </select>
              </label>

              <label>
                Target Air / Delivery Date
                <input
                  type="date"
                  value={episodeForm.targetAirDate}
                  onChange={e => setEpisodeForm({ ...episodeForm, targetAirDate: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Director
                <input
                  value={episodeForm.director}
                  onChange={e => setEpisodeForm({ ...episodeForm, director: e.target.value })}
                  placeholder="e.g. Vikramaditya Motwane"
                />
              </label>

              <label>
                Lead Writer(s)
                <input
                  value={episodeForm.writer}
                  onChange={e => setEpisodeForm({ ...episodeForm, writer: e.target.value })}
                  placeholder="e.g. Varun Grover"
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Scripted Scenes Count
                <input
                  type="number"
                  min="0"
                  value={episodeForm.scenesCount}
                  onChange={e => setEpisodeForm({ ...episodeForm, scenesCount: e.target.value })}
                />
              </label>

              <label>
                Scenes Completed / Shot
                <input
                  type="number"
                  min="0"
                  value={episodeForm.scenesCompleted}
                  onChange={e => setEpisodeForm({ ...episodeForm, scenesCompleted: e.target.value })}
                />
              </label>
            </div>

            <label>
              Episode Logline / Synopsis
              <textarea
                value={episodeForm.synopsis}
                onChange={e => setEpisodeForm({ ...episodeForm, synopsis: e.target.value })}
                placeholder="Core story beat and premise of this episode..."
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setCreateEpisodeModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Tv size={16} /> Save Episode
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT EPISODE ================= */}
      {editEpisodeModalItem && (
        <div className="modal-backdrop" onClick={() => setEditEpisodeModalItem(null)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleEditEpisodeSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Update Episode {editEpisodeModalItem.episodeNumber}: {editEpisodeModalItem.title}</h2>
                <p>Modify episode status, crew credits, runtime and scene progress.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditEpisodeModalItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-3">
              <label>
                Parent Web Series
                <select
                  value={episodeForm.project}
                  onChange={e => setEpisodeForm({ ...episodeForm, project: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Episode Number
                <input
                  type="number"
                  min="1"
                  required
                  value={episodeForm.episodeNumber}
                  onChange={e => setEpisodeForm({ ...episodeForm, episodeNumber: e.target.value })}
                />
              </label>

              <label>
                Episode Title *
                <input
                  required
                  value={episodeForm.title}
                  onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Runtime
                <input
                  value={episodeForm.runtime}
                  onChange={e => setEpisodeForm({ ...episodeForm, runtime: e.target.value })}
                />
              </label>

              <label>
                Status
                <select
                  value={episodeForm.status}
                  onChange={e => setEpisodeForm({ ...episodeForm, status: e.target.value })}
                >
                  <option>In Scripting</option>
                  <option>Script Locked</option>
                  <option>Shooting</option>
                  <option>Picture Lock</option>
                  <option>Sound & VFX</option>
                  <option>Completed</option>
                </select>
              </label>

              <label>
                Air Date
                <input
                  type="date"
                  value={episodeForm.targetAirDate}
                  onChange={e => setEpisodeForm({ ...episodeForm, targetAirDate: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Director
                <input
                  value={episodeForm.director}
                  onChange={e => setEpisodeForm({ ...episodeForm, director: e.target.value })}
                />
              </label>

              <label>
                Writer
                <input
                  value={episodeForm.writer}
                  onChange={e => setEpisodeForm({ ...episodeForm, writer: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Total Scenes
                <input
                  type="number"
                  min="0"
                  value={episodeForm.scenesCount}
                  onChange={e => setEpisodeForm({ ...episodeForm, scenesCount: e.target.value })}
                />
              </label>

              <label>
                Completed Scenes
                <input
                  type="number"
                  min="0"
                  value={episodeForm.scenesCompleted}
                  onChange={e => setEpisodeForm({ ...episodeForm, scenesCompleted: e.target.value })}
                />
              </label>
            </div>

            <label>
              Synopsis
              <textarea
                value={episodeForm.synopsis}
                onChange={e => setEpisodeForm({ ...episodeForm, synopsis: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditEpisodeModalItem(null)}
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

      {/* ================= MODAL: CREATE SCENE ================= */}
      {createSceneModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateSceneModalOpen(false)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleCreateSceneSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Add Scene to Stripboard</h2>
                <p>Break down a script scene with slugline, environment, location and cast call.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreateSceneModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-3">
              <label>
                Production Project
                <select
                  value={sceneForm.project}
                  onChange={e => {
                    const proj = e.target.value;
                    const matchingEp = episodes.find(ep => ep.project === proj);
                    setSceneForm({
                      ...sceneForm,
                      project: proj,
                      episodeId: matchingEp ? matchingEp.id : 'FEATURE',
                      episodeName: matchingEp ? `EP ${matchingEp.episodeNumber} · ${matchingEp.title}` : 'Feature Film Master'
                    });
                  }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Linked Episode / Unit
                <select
                  value={sceneForm.episodeId}
                  onChange={e => {
                    const epId = e.target.value;
                    const epObj = episodes.find(x => x.id === epId);
                    setSceneForm({
                      ...sceneForm,
                      episodeId: epId,
                      episodeName: epObj ? `EP ${epObj.episodeNumber} · ${epObj.title}` : 'Feature Film Master'
                    });
                  }}
                >
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.project} - Ep {ep.episodeNumber}: {ep.title}
                    </option>
                  ))}
                  <option value="FEATURE">Feature Film Master</option>
                </select>
              </label>

              <label>
                Scene Number *
                <input
                  required
                  value={sceneForm.sceneNumber}
                  onChange={e => setSceneForm({ ...sceneForm, sceneNumber: e.target.value })}
                  placeholder="e.g. Scene 12B"
                />
              </label>
            </div>

            <label>
              Slugline / Heading *
              <input
                required
                value={sceneForm.heading}
                onChange={e => setSceneForm({ ...sceneForm, heading: e.target.value })}
                placeholder="e.g. EXT. CHERRAPUNJI FOREST GORGE - NIGHT [RAIN]"
              />
            </label>

            <div className="form-grid-3">
              <label>
                Setting Environment
                <select
                  value={sceneForm.setting}
                  onChange={e => setSceneForm({ ...sceneForm, setting: e.target.value })}
                >
                  <option>INT</option>
                  <option>EXT</option>
                  <option>INT/EXT</option>
                </select>
              </label>

              <label>
                Time of Day
                <select
                  value={sceneForm.timeOfDay}
                  onChange={e => setSceneForm({ ...sceneForm, timeOfDay: e.target.value })}
                >
                  <option>DAY</option>
                  <option>NIGHT</option>
                  <option>DUSK</option>
                  <option>DAWN</option>
                </select>
              </label>

              <label>
                Script Page Length
                <input
                  value={sceneForm.pages}
                  onChange={e => setSceneForm({ ...sceneForm, pages: e.target.value })}
                  placeholder="e.g. 2 3/8"
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Shoot Location Set
                <input
                  value={sceneForm.location}
                  onChange={e => setSceneForm({ ...sceneForm, location: e.target.value })}
                  placeholder="e.g. Nohkalikai Falls Set / Stage 2"
                />
              </label>

              <label>
                Target Shoot Date
                <input
                  type="date"
                  value={sceneForm.shootDate}
                  onChange={e => setSceneForm({ ...sceneForm, shootDate: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Characters Called
                <input
                  value={sceneForm.characters}
                  onChange={e => setSceneForm({ ...sceneForm, characters: e.target.value })}
                  placeholder="e.g. SP Samarjit, Dr. Maya, 4 Constable Extras"
                />
              </label>

              <label>
                Shooting Status
                <select
                  value={sceneForm.status}
                  onChange={e => setSceneForm({ ...sceneForm, status: e.target.value })}
                >
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Shot / Done</option>
                  <option>Postponed</option>
                </select>
              </label>
            </div>

            <label>
              Camera & Special FX Equipment
              <input
                value={sceneForm.equipment}
                onChange={e => setSceneForm({ ...sceneForm, equipment: e.target.value })}
                placeholder="e.g. Arri Mini LF, Rain FX Rig, Drone, Technocrane"
              />
            </label>

            <label>
              Scene Action Description
              <textarea
                value={sceneForm.description}
                onChange={e => setSceneForm({ ...sceneForm, description: e.target.value })}
                placeholder="Brief narrative beat, action sequencing, camera blocking notes..."
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setCreateSceneModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Save Scene
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT SCENE ================= */}
      {editSceneModalItem && (
        <div className="modal-backdrop" onClick={() => setEditSceneModalItem(null)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleEditSceneSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Update Scene: {editSceneModalItem.sceneNumber}</h2>
                <p>Modify slugline, shoot location, cast call, and filming status.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditSceneModalItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-3">
              <label>
                Production Project
                <select
                  value={sceneForm.project}
                  onChange={e => setSceneForm({ ...sceneForm, project: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Linked Unit / Episode
                <select
                  value={sceneForm.episodeId}
                  onChange={e => {
                    const epId = e.target.value;
                    const epObj = episodes.find(x => x.id === epId);
                    setSceneForm({
                      ...sceneForm,
                      episodeId: epId,
                      episodeName: epObj ? `EP ${epObj.episodeNumber} · ${epObj.title}` : 'Feature Film Master'
                    });
                  }}
                >
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.project} - Ep {ep.episodeNumber}: {ep.title}
                    </option>
                  ))}
                  <option value="FEATURE">Feature Film Master</option>
                </select>
              </label>

              <label>
                Scene Number *
                <input
                  required
                  value={sceneForm.sceneNumber}
                  onChange={e => setSceneForm({ ...sceneForm, sceneNumber: e.target.value })}
                />
              </label>
            </div>

            <label>
              Slugline / Heading *
              <input
                required
                value={sceneForm.heading}
                onChange={e => setSceneForm({ ...sceneForm, heading: e.target.value })}
              />
            </label>

            <div className="form-grid-3">
              <label>
                Setting
                <select
                  value={sceneForm.setting}
                  onChange={e => setSceneForm({ ...sceneForm, setting: e.target.value })}
                >
                  <option>INT</option>
                  <option>EXT</option>
                  <option>INT/EXT</option>
                </select>
              </label>

              <label>
                Time of Day
                <select
                  value={sceneForm.timeOfDay}
                  onChange={e => setSceneForm({ ...sceneForm, timeOfDay: e.target.value })}
                >
                  <option>DAY</option>
                  <option>NIGHT</option>
                  <option>DUSK</option>
                  <option>DAWN</option>
                </select>
              </label>

              <label>
                Page Count
                <input
                  value={sceneForm.pages}
                  onChange={e => setSceneForm({ ...sceneForm, pages: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Shoot Location
                <input
                  value={sceneForm.location}
                  onChange={e => setSceneForm({ ...sceneForm, location: e.target.value })}
                />
              </label>

              <label>
                Shoot Date
                <input
                  type="date"
                  value={sceneForm.shootDate}
                  onChange={e => setSceneForm({ ...sceneForm, shootDate: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Characters Called
                <input
                  value={sceneForm.characters}
                  onChange={e => setSceneForm({ ...sceneForm, characters: e.target.value })}
                />
              </label>

              <label>
                Filming Status
                <select
                  value={sceneForm.status}
                  onChange={e => setSceneForm({ ...sceneForm, status: e.target.value })}
                >
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Shot / Done</option>
                  <option>Postponed</option>
                </select>
              </label>
            </div>

            <label>
              Camera & Special FX Equipment
              <input
                value={sceneForm.equipment}
                onChange={e => setSceneForm({ ...sceneForm, equipment: e.target.value })}
              />
            </label>

            <label>
              Description / Notes
              <textarea
                value={sceneForm.description}
                onChange={e => setSceneForm({ ...sceneForm, description: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditSceneModalItem(null)}
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

      {/* ================= MODAL: VIEW SCENE BREAKDOWN ================= */}
      {detailModalScene && (
        <div className="modal-backdrop" onClick={() => setDetailModalScene(null)}>
          <div
            className="modal-card modal-card-lg"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '780px' }}
          >
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className={`project-icon ${getSceneStatusTone(detailModalScene.status)}`}>
                  <Clapperboard size={22} />
                </div>
                <div>
                  <h2>{detailModalScene.sceneNumber}: {detailModalScene.heading}</h2>
                  <p>{detailModalScene.project} · {detailModalScene.episodeName}</p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDetailModalScene(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Action Description */}
            <div className="detail-section">
              <h4>Script Beat & Action</h4>
              {detailModalScene.description ? (
                <p style={{ fontSize: '11px', lineHeight: '1.7', color: '#f4f0eb', margin: '0 0 12px', background: '#202020', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #e3652e' }}>
                  {detailModalScene.description}
                </p>
              ) : (
                <p style={{ fontSize: '11px', color: '#8a96a8', fontStyle: 'italic', margin: '0 0 12px' }}>
                  No scene action description logged.
                </p>
              )}

              <div className="detail-grid">
                <div className="detail-item">
                  <span>Filming Status</span>
                  <strong className={`status-pill ${getSceneStatusTone(detailModalScene.status)}`}>
                    {detailModalScene.status}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Environment & Time</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge-tag platform">{detailModalScene.setting}</span>
                    {getTimeIcon(detailModalScene.timeOfDay)} {detailModalScene.timeOfDay}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Script Length</span>
                  <strong>{detailModalScene.pages} Pages</strong>
                </div>
                <div className="detail-item">
                  <span>Target Call Date</span>
                  <strong style={{ color: '#67d7a3' }}>{detailModalScene.shootDate || 'TBD'}</strong>
                </div>
              </div>
            </div>

            {/* Location & Cast */}
            <div className="detail-section">
              <h4>Set Location & Cast Call</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Shoot Location</span>
                  <strong>{detailModalScene.location}</strong>
                </div>
                <div className="detail-item">
                  <span>Characters Called</span>
                  <strong>{detailModalScene.characters}</strong>
                </div>
              </div>
            </div>

            {/* Equipment */}
            <div className="detail-section">
              <h4>Special Camera, Grip & FX Requirements</h4>
              <div style={{ background: '#202020', padding: '10px 12px', borderRadius: '8px', border: '1px solid #2d2d2d' }}>
                <span style={{ fontSize: '9px', color: '#8a96a8', display: 'block', marginBottom: '3px' }}>
                  PACKAGE SPECIFICATIONS:
                </span>
                <strong style={{ fontSize: '11px', color: '#f4f0eb' }}>
                  {detailModalScene.equipment || 'Standard production package'}
                </strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDetailModalScene(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleOpenEditScene(detailModalScene)}
              >
                <Edit3 size={15} /> Edit Scene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE SCENE CONFIRMATION ================= */}
      {deleteTargetScene && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetScene(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Delete Scene from Stripboard?</h2>
                <p>Confirm deletion of this shooting scene record.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeleteTargetScene(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="delete-confirm-box">
              <strong>Warning: This action cannot be undone.</strong>
              You are about to delete <strong>{deleteTargetScene.sceneNumber}</strong>: {deleteTargetScene.heading}.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeleteTargetScene(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDeleteScene}
              >
                <Trash2 size={16} /> Yes, Delete Scene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE EPISODE CONFIRMATION ================= */}
      {deleteTargetEpisode && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetEpisode(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Delete Episode?</h2>
                <p>Confirm deletion of this episode breakdown.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeleteTargetEpisode(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="delete-confirm-box">
              <strong>Warning: This action cannot be undone.</strong>
              You are about to delete Episode {deleteTargetEpisode.episodeNumber}: <strong>{deleteTargetEpisode.title}</strong> of <em>{deleteTargetEpisode.project}</em>.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeleteTargetEpisode(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDeleteEpisode}
              >
                <Trash2 size={16} /> Yes, Delete Episode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

