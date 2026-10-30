import { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Clapperboard,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Briefcase,
  Trash2,
  Edit3,
  Eye,
  X,
  LayoutGrid,
  List,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  Film
} from 'lucide-react';
import {
  getStoredCastCrew,
  getStoredProjects,
  createCastCrew,
  updateCastCrew,
  deleteCastCrew,
  formatCurrency
} from '../utils/productionStorage.js';

export default function CastCrewManagement() {
  const [castCrew, setCastCrew] = useState(() => getStoredCastCrew());
  const [projects] = useState(() => getStoredProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'Cast' | 'Crew'
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalMember, setEditModalMember] = useState(null);
  const [detailModalMember, setDetailModalMember] = useState(null);
  const [deleteTargetMember, setDeleteTargetMember] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    category: 'Cast',
    department: 'Acting / Cast',
    role: '',
    project: projects[0]?.name || 'The Last Monsoon',
    email: '',
    phone: '',
    rate: '',
    rateType: 'Project Contract',
    status: 'Available',
    guild: 'CINTAA (Certified)',
    contractStatus: 'Contract Signed',
    agent: 'Direct',
    daysBooked: 25,
    dietaryNotes: 'Standard',
    tone: 'blue'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Available departments
  const departmentsList = [
    'ALL',
    'Acting / Cast',
    'Direction',
    'Cinematography',
    'Sound & Music',
    'Stunts / Action',
    'Production Design',
    'Costumes & Makeup',
    'Editing'
  ];

  // Filtered List
  const filteredList = useMemo(() => {
    return castCrew.filter(item => {
      const matchSearch =
        (item.name + ' ' + item.role + ' ' + item.project + ' ' + item.department + ' ' + item.email + ' ' + item.agent)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchCategory =
        categoryFilter === 'ALL' || item.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchDept =
        deptFilter === 'ALL' || item.department.toLowerCase() === deptFilter.toLowerCase();

      const matchStatus =
        statusFilter === 'ALL' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchCategory && matchDept && matchStatus;
    });
  }, [castCrew, searchQuery, categoryFilter, deptFilter, statusFilter]);

  // KPI Metrics
  const totalCount = castCrew.length;
  const castCount = castCrew.filter(c => c.category === 'Cast').length;
  const onSetCount = castCrew.filter(c => c.status === 'On Set').length;
  const contractsSignedCount = castCrew.filter(c => c.contractStatus === 'Contract Signed').length;

  // Open Create
  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      project: projects[0]?.name || 'The Last Monsoon'
    });
    setCreateModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (member) => {
    setFormData({
      name: member.name,
      category: member.category,
      department: member.department,
      role: member.role,
      project: member.project,
      email: member.email,
      phone: member.phone,
      rate: member.rate,
      rateType: member.rateType,
      status: member.status,
      guild: member.guild || 'None',
      contractStatus: member.contractStatus || 'Draft',
      agent: member.agent || 'Direct',
      daysBooked: member.daysBooked || 0,
      dietaryNotes: member.dietaryNotes || 'Standard',
      tone: member.tone || 'blue'
    });
    setEditModalMember(member);
  };

  // Submit Create
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const { all } = createCastCrew({
      ...formData,
      rate: Number(formData.rate),
      daysBooked: Number(formData.daysBooked)
    });

    setCastCrew(all);
    setCreateModalOpen(false);
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editModalMember || !formData.name.trim()) return;

    const updated = updateCastCrew(editModalMember.id, {
      ...formData,
      rate: Number(formData.rate),
      daysBooked: Number(formData.daysBooked)
    });

    setCastCrew(updated);
    setEditModalMember(null);
    if (detailModalMember && detailModalMember.id === editModalMember.id) {
      setDetailModalMember(updated.find(m => m.id === editModalMember.id));
    }
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deleteTargetMember) return;
    const updated = deleteCastCrew(deleteTargetMember.id);
    setCastCrew(updated);
    setDeleteTargetMember(null);
    if (detailModalMember && detailModalMember.id === deleteTargetMember.id) {
      setDetailModalMember(null);
    }
  };

  const getStatusTone = (status) => {
    switch (status) {
      case 'On Set':
        return 'orange';
      case 'Wrapped':
        return 'green';
      case 'Available':
        return 'cyan';
      case 'In Studio':
        return 'purple';
      case 'Rehearsals':
        return 'blue';
      default:
        return 'blue';
    }
  };

  return (
    <>
      {/* Premium Cinematic Hover & Interaction Styles for Cast & Crew */}
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

        .prod-card, .prod-list-card {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.24s ease, 
                      box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
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
        .prod-card:hover .avatar, .prod-list-card:hover .avatar {
          transform: scale(1.1) rotate(2deg);
          box-shadow: 0 4px 14px rgba(227, 101, 46, 0.35);
        }
        .prod-card .avatar, .prod-list-card .avatar {
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease;
        }
        .prod-card:hover .prod-card-title-group h3 {
          color: #ffffff;
          transition: color 0.18s ease;
        }
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
        .table-wrap .icon-button[title*="Profile"]:hover {
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
          <h1>Cast & Crew Management</h1>
          <p>Organize talent rosters, department crews, contracts, shoot availability and day rates.</p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <UserPlus size={18} /> Add Cast / Crew
          </button>
        </div>
      </div>

      {/* KPI Mini-Stats */}
      <div className="mini-stats">
        <div className="mini-stat">
          <span>Active Roster</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Cast & Performers</span>
          <strong style={{ color: '#70d5e2' }}>{castCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Currently On Set</span>
          <strong style={{ color: '#f07842' }}>{onSetCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Contracts Executed</span>
          <strong style={{ color: '#67d7a3' }}>{contractsSignedCount}</strong>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel page-panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2>Talent & Technical Roster</h2>
            <p>Showing {filteredList.length} of {castCrew.length} team members registered across productions.</p>
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
                placeholder="Search talent, roles, projects..."
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
              CATEGORY:
            </span>
            <div className="filter-tabs">
              {['ALL', 'Cast', 'Crew'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-tab-pill ${categoryFilter.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'ALL' ? 'All Personnel' : cat === 'Cast' ? 'Cast / Talent' : 'Technical Crew'}
                </button>
              ))}
            </div>
          </div>

          {/* Department Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              DEPARTMENT:
            </span>
            <div className="filter-tabs">
              {departmentsList.map(dept => (
                <button
                  key={dept}
                  type="button"
                  className={`filter-tab-pill ${deptFilter.toLowerCase() === dept.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setDeptFilter(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8a96a8', letterSpacing: '1px' }}>
              STATUS:
            </span>
            <div className="filter-tabs">
              {['ALL', 'On Set', 'In Studio', 'Rehearsals', 'Available', 'Wrapped'].map(st => (
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
        </div>

        {/* Cards Grid */}
        {viewMode === 'grid' && (
          <div className="production-grid">
            {filteredList.map(member => {
              const tone = getStatusTone(member.status);
              const initials = member.name
                .split(' ')
                .map(s => s[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div className="prod-card" key={member.id}>
                  {/* Card Top */}
                  <div className="prod-card-top">
                    <div className="prod-card-title-group">
                      <div className={`avatar avatar-${member.category === 'Cast' ? 'blue' : 'orange'}`} style={{ width: '38px', height: '38px', fontSize: '12px' }}>
                        {initials}
                      </div>
                      <div>
                        <h3>{member.name}</h3>
                        <span>{member.department} · {member.category}</span>
                      </div>
                    </div>
                    <span className={`status-pill ${tone}`}>{member.status}</span>
                  </div>

                  {/* Character/Role Box */}
                  <div style={{ background: '#202020', padding: '10px 12px', borderRadius: '8px', border: '1px solid #2d2d2d' }}>
                    <span style={{ fontSize: '8.5px', color: '#a7a09a', display: 'block', marginBottom: '2px' }}>
                      ASSIGNED DESIGNATION / ROLE
                    </span>
                    <strong style={{ fontSize: '11px', color: '#f4f0eb' }}>{member.role}</strong>
                  </div>

                  {/* Badges */}
                  <div className="prod-meta-tags">
                    <span className="badge-tag platform">{member.project}</span>
                    <span className="badge-tag rating">{member.guild}</span>
                    <span className={`status-pill ${member.contractStatus === 'Contract Signed' ? 'green' : 'orange'}`} style={{ fontSize: '8px' }}>
                      {member.contractStatus}
                    </span>
                  </div>

                  {/* Compensation & Shoot Days */}
                  <div className="prod-finance-row">
                    <div className="prod-finance-item">
                      <span>Rate ({member.rateType})</span>
                      <strong style={{ color: '#67d7a3' }}>{formatCurrency(member.rate)}</strong>
                    </div>
                    <div className="prod-finance-item">
                      <span>Days Booked</span>
                      <strong>{member.daysBooked} Days</strong>
                    </div>
                  </div>

                  {/* Card Foot */}
                  <div className="prod-card-foot">
                    <div className="prod-foot-crew">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Contact / Rep</span>
                        <strong style={{ fontSize: '9px', color: '#ded7d0' }}>
                          {member.agent || member.email || 'Direct'}
                        </strong>
                      </div>
                    </div>

                    <div className="prod-card-actions">
                      <button
                        className="icon-button"
                        onClick={() => setDetailModalMember(member)}
                        title="View Full Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => handleOpenEdit(member)}
                        title="Edit Member"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => setDeleteTargetMember(member)}
                        title="Delete Member"
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
            {filteredList.map(member => {
              const tone = getStatusTone(member.status);
              const initials = member.name
                .split(' ')
                .map(s => s[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  className="prod-list-card"
                  key={member.id}
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
                  {/* Left: Avatar + Name + Category + Project */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: '220px', flex: '1.2' }}>
                    <div className={`avatar avatar-${member.category === 'Cast' ? 'blue' : 'orange'}`} style={{ width: '36px', height: '36px', fontSize: '11px', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#f4f0eb', fontWeight: 750 }}>
                          {member.name}
                        </h3>
                        <span className={`status-pill ${tone}`}>{member.status}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#8a96a8' }}>{member.category}</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>•</span>
                        <span style={{ fontSize: '11px', color: '#ded7d0' }}>{member.department}</span>
                        <span className="badge-tag platform">{member.project}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role / Character */}
                  <div style={{ minWidth: '150px', flex: '1' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>ASSIGNED DESIGNATION</span>
                    <strong style={{ fontSize: '13px', color: '#f4f0eb', display: 'block' }}>{member.role}</strong>
                    <span className="badge-tag rating" style={{ marginTop: '3px', display: 'inline-block' }}>{member.guild}</span>
                  </div>

                  {/* Compensation & Contract */}
                  <div style={{ minWidth: '130px', flex: '0.9' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>RATE / CONTRACT</span>
                    <strong style={{ fontSize: '13px', color: '#67d7a3', display: 'block' }}>{formatCurrency(member.rate)}</strong>
                    <span className={`status-pill ${member.contractStatus === 'Contract Signed' ? 'green' : 'orange'}`} style={{ fontSize: '9.5px', marginTop: '3px' }}>
                      {member.contractStatus}
                    </span>
                  </div>

                  {/* Representative / Contact */}
                  <div style={{ minWidth: '130px', flex: '0.8' }}>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#8a96a8' }}>REPRESENTATIVE</span>
                    <div style={{ fontSize: '12px', color: '#ded7d0', fontWeight: 600 }}>{member.agent || 'Direct'}</div>
                    <div style={{ fontSize: '10.5px', color: '#8a96a8' }}>{member.daysBooked} Days Booked</div>
                  </div>

                  {/* Actions */}
                  <div className="prod-card-actions" style={{ flexShrink: 0 }}>
                    <button
                      className="icon-button"
                      onClick={() => setDetailModalMember(member)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleOpenEdit(member)}
                      title="Edit Member"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setDeleteTargetMember(member)}
                      title="Delete Member"
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
                  <th>PROFESSIONAL</th>
                  <th>CATEGORY & DEPT</th>
                  <th>ROLE / CHARACTER</th>
                  <th>ASSIGNED PRODUCTION</th>
                  <th>SHOOT STATUS</th>
                  <th>COMPENSATION</th>
                  <th>GUILD AFFILIATION</th>
                  <th>CONTRACT</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(member => {
                  const tone = getStatusTone(member.status);
                  const initials = member.name
                    .split(' ')
                    .map(s => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="project-name">
                          <div className={`avatar avatar-${member.category === 'Cast' ? 'blue' : 'orange'}`} style={{ width: '30px', height: '30px', fontSize: '10px' }}>
                            {initials}
                          </div>
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.email || member.phone || 'Direct contact'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{member.category}</span>
                        <div style={{ fontSize: '11px', color: '#8a96a8' }}>{member.department}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#f4f0eb' }}>{member.role}</span>
                      </td>
                      <td>
                        <span className="badge-tag platform">{member.project}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${tone}`}>{member.status}</span>
                      </td>
                      <td>
                        <strong style={{ color: '#67d7a3' }}>{formatCurrency(member.rate)}</strong>
                        <div style={{ fontSize: '10.5px', color: '#8a96a8' }}>{member.rateType}</div>
                      </td>
                      <td>
                        <span className="badge-tag rating">{member.guild}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${member.contractStatus === 'Contract Signed' ? 'green' : 'orange'}`}>
                          {member.contractStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            className="icon-button"
                            onClick={() => setDetailModalMember(member)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => handleOpenEdit(member)}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => setDeleteTargetMember(member)}
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

        {filteredList.length === 0 && (
          <div className="empty-state">
            <Users size={36} style={{ color: '#e3652e', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#f4f0eb', fontSize: '14px', marginBottom: '4px' }}>
              No talent or crew records found
            </strong>
            <p style={{ margin: 0 }}>Try clearing filters or add a new actor or technical crew member to the roster.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenCreate}
            >
              <UserPlus size={16} /> Add Member
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE MEMBER ================= */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleCreateSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Add Cast / Crew Member</h2>
                <p>Register an actor, director, technician or craft professional to a production.</p>
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
                Full Name *
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Radhika Apte"
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
                      department: cat === 'Cast' ? 'Acting / Cast' : 'Cinematography'
                    });
                  }}
                >
                  <option>Cast</option>
                  <option>Crew</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Department
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  <option>Acting / Cast</option>
                  <option>Direction</option>
                  <option>Cinematography</option>
                  <option>Sound & Music</option>
                  <option>Stunts / Action</option>
                  <option>Production Design</option>
                  <option>Costumes & Makeup</option>
                  <option>Editing</option>
                  <option>Production</option>
                </select>
              </label>

              <label>
                Assigned Role / Character *
                <input
                  required
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Lead Actress - Dr. Maya Lyngdoh or DoP"
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Assigned Production Project
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                  <option value="General Roster">General Roster (Unassigned)</option>
                </select>
              </label>

              <label>
                Shoot Status
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>On Set</option>
                  <option>In Studio</option>
                  <option>Rehearsals</option>
                  <option>Available</option>
                  <option>Wrapped</option>
                </select>
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Agreed Rate (₹ INR)
                <input
                  type="number"
                  min="0"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="e.g. 15000000"
                />
              </label>

              <label>
                Rate Structure
                <select
                  value={formData.rateType}
                  onChange={e => setFormData({ ...formData, rateType: e.target.value })}
                >
                  <option>Project Contract</option>
                  <option>Daily Rate</option>
                  <option>Weekly Rate</option>
                </select>
              </label>

              <label>
                Estimated Days Booked
                <input
                  type="number"
                  min="0"
                  value={formData.daysBooked}
                  onChange={e => setFormData({ ...formData, daysBooked: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Guild / Union Affiliation
                <input
                  value={formData.guild}
                  onChange={e => setFormData({ ...formData, guild: e.target.value })}
                  placeholder="e.g. CINTAA, WICA, SWA"
                />
              </label>

              <label>
                Contract Status
                <select
                  value={formData.contractStatus}
                  onChange={e => setFormData({ ...formData, contractStatus: e.target.value })}
                >
                  <option>Contract Signed</option>
                  <option>In Negotiation</option>
                  <option>Draft</option>
                  <option>Dispatched</option>
                </select>
              </label>

              <label>
                Agent / Representation
                <input
                  value={formData.agent}
                  onChange={e => setFormData({ ...formData, agent: e.target.value })}
                  placeholder="e.g. KWAN, Matrix, Direct"
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Contact Email
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="talent@rep.com"
                />
              </label>

              <label>
                Emergency / Direct Phone
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98200 00000"
                />
              </label>
            </div>

            <label>
              Dietary & Set Requirements / Notes
              <input
                value={formData.dietaryNotes}
                onChange={e => setFormData({ ...formData, dietaryNotes: e.target.value })}
                placeholder="e.g. Vegetarian, Gluten-free, specific call-time requirements"
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
                <UserPlus size={16} /> Save to Roster
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT MEMBER ================= */}
      {editModalMember && (
        <div className="modal-backdrop" onClick={() => setEditModalMember(null)}>
          <form
            className="modal-card modal-card-lg"
            onSubmit={handleEditSubmit}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Update Member: {editModalMember.name}</h2>
                <p>Modify role, assigned production, shoot status, contracts and rates.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditModalMember(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid-2">
              <label>
                Full Name *
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label>
                Category
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Cast</option>
                  <option>Crew</option>
                </select>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Department
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  <option>Acting / Cast</option>
                  <option>Direction</option>
                  <option>Cinematography</option>
                  <option>Sound & Music</option>
                  <option>Stunts / Action</option>
                  <option>Production Design</option>
                  <option>Costumes & Makeup</option>
                  <option>Editing</option>
                  <option>Production</option>
                </select>
              </label>

              <label>
                Role / Character *
                <input
                  required
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Assigned Production
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                  <option value="General Roster">General Roster</option>
                </select>
              </label>

              <label>
                Shoot Status
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>On Set</option>
                  <option>In Studio</option>
                  <option>Rehearsals</option>
                  <option>Available</option>
                  <option>Wrapped</option>
                </select>
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Rate (₹ INR)
                <input
                  type="number"
                  min="0"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: e.target.value })}
                />
              </label>

              <label>
                Rate Type
                <select
                  value={formData.rateType}
                  onChange={e => setFormData({ ...formData, rateType: e.target.value })}
                >
                  <option>Project Contract</option>
                  <option>Daily Rate</option>
                  <option>Weekly Rate</option>
                </select>
              </label>

              <label>
                Days Booked
                <input
                  type="number"
                  min="0"
                  value={formData.daysBooked}
                  onChange={e => setFormData({ ...formData, daysBooked: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Guild / Union
                <input
                  value={formData.guild}
                  onChange={e => setFormData({ ...formData, guild: e.target.value })}
                />
              </label>

              <label>
                Contract Status
                <select
                  value={formData.contractStatus}
                  onChange={e => setFormData({ ...formData, contractStatus: e.target.value })}
                >
                  <option>Contract Signed</option>
                  <option>In Negotiation</option>
                  <option>Draft</option>
                  <option>Dispatched</option>
                </select>
              </label>

              <label>
                Agent / Manager
                <input
                  value={formData.agent}
                  onChange={e => setFormData({ ...formData, agent: e.target.value })}
                />
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Contact Email
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </label>

              <label>
                Direct Phone
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>
            </div>

            <label>
              Dietary & Medical Notes
              <input
                value={formData.dietaryNotes}
                onChange={e => setFormData({ ...formData, dietaryNotes: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditModalMember(null)}
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
      {detailModalMember && (
        <div className="modal-backdrop" onClick={() => setDetailModalMember(null)}>
          <div
            className="modal-card modal-card-lg"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '780px' }}
          >
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  className={`avatar avatar-${detailModalMember.category === 'Cast' ? 'blue' : 'orange'}`}
                  style={{ width: '46px', height: '46px', fontSize: '15px' }}
                >
                  {detailModalMember.name
                    .split(' ')
                    .map(s => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2>{detailModalMember.name}</h2>
                  <p>{detailModalMember.department} · {detailModalMember.category} · {detailModalMember.guild}</p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDetailModalMember(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Role & Assignment */}
            <div className="detail-section">
              <h4>Role & Production Assignment</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Assigned Role</span>
                  <strong style={{ fontSize: '13px' }}>{detailModalMember.role}</strong>
                </div>
                <div className="detail-item">
                  <span>Current Production</span>
                  <strong className="badge-tag platform">{detailModalMember.project}</strong>
                </div>
                <div className="detail-item">
                  <span>Shoot Availability</span>
                  <strong className={`status-pill ${getStatusTone(detailModalMember.status)}`}>
                    {detailModalMember.status}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Days on Set</span>
                  <strong>{detailModalMember.daysBooked} Days Booked</strong>
                </div>
              </div>
            </div>

            {/* Compensation & Contract */}
            <div className="detail-section">
              <h4>Financial Agreement & Legal Terms</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Contractual Compensation</span>
                  <strong style={{ fontSize: '16px', color: '#67d7a3' }}>
                    {formatCurrency(detailModalMember.rate)}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Pay Structure</span>
                  <strong>{detailModalMember.rateType}</strong>
                </div>
                <div className="detail-item">
                  <span>Contract Execution</span>
                  <strong className={`status-pill ${detailModalMember.contractStatus === 'Contract Signed' ? 'green' : 'orange'}`}>
                    {detailModalMember.contractStatus}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Guild / Union</span>
                  <strong>{detailModalMember.guild}</strong>
                </div>
              </div>
            </div>

            {/* Logistics & Contact */}
            <div className="detail-section">
              <h4>Logistics & Emergency Contacts</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Email</span>
                  <strong>{detailModalMember.email || 'Not provided'}</strong>
                </div>
                <div className="detail-item">
                  <span>Phone</span>
                  <strong>{detailModalMember.phone || 'Not provided'}</strong>
                </div>
                <div className="detail-item">
                  <span>Talent Representative</span>
                  <strong>{detailModalMember.agent || 'Direct'}</strong>
                </div>
                <div className="detail-item">
                  <span>Dietary & Health Notes</span>
                  <strong style={{ color: '#ffad76' }}>{detailModalMember.dietaryNotes || 'None'}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDetailModalMember(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleOpenEdit(detailModalMember)}
              >
                <Edit3 size={15} /> Edit Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteTargetMember && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetMember(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Remove from Production Roster?</h2>
                <p>Confirm removal of this cast or crew record.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeleteTargetMember(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="delete-confirm-box">
              <strong>Warning: This action will delete the roster record.</strong>
              You are about to remove <strong>{deleteTargetMember.name}</strong> ({deleteTargetMember.role})
              assigned to <em>{deleteTargetMember.project}</em>.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeleteTargetMember(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} /> Yes, Remove Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

