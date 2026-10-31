import { useState } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Clapperboard,
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  FolderKanban,
  Film,
  Tv,
  UserCheck,
  Truck,
  Wallet,
  Receipt,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  MapPin,
  Send,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import './MainLayout.css';

const NAVIGATION_GROUPS = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Team & Users', path: '/team', icon: Users },
      { label: 'Departments', path: '/departments', icon: Building2 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
  {
    title: 'PROJECTS & PRODUCTION',
    items: [
      { label: 'Projects', path: '/projects', icon: FolderKanban },
      { label: 'Movies & Series', path: '/movies-series', icon: Film },
      { label: 'Cast & Crew', path: '/cast-crew', icon: UserCheck },
      { label: 'Episodes & Scenes', path: '/episodes-scenes', icon: Tv },
    ],
  },
  {
    title: 'FINANCE & RESOURCES',
    items: [
      { label: 'Vendors & Equipment', path: '/vendors-equipment', icon: Truck },
      { label: 'Budget & Expenses', path: '/budget-expenses', icon: Wallet },
      { label: 'Invoices & Payments', path: '/invoices-payments', icon: Receipt },
    ],
  },
  {
    title: 'PRODUCTION OPERATIONS',
    items: [
      { label: 'Production Schedule', path: '/schedule', icon: Calendar },
      { label: 'Task Management', path: '/tasks', icon: CheckSquare },
      { label: 'Attendance', path: '/attendance', icon: Clock },
      { label: 'Call Sheets', path: '/call-sheets', icon: FileText },
      { label: ' Locations & Shooting Permits', path: '/locations', icon: MapPin },
      { label: 'Final Delivery', path: '/delivery', icon: Send },
      { label: 'Approvals', path: '/approvals', icon: CheckCircle2 },
      { label: 'OTT Publishing', path: '/ott-publishing', icon: PlayCircle },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
      { label: 'Notifications', path: '/notifications', icon: Bell },
    ],
  },
];

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/team': 'Team & Users',
  '/departments': 'Departments',
  '/settings': 'Settings',
  '/projects': 'Projects & Productions',
  '/movies-series': 'Movies & Web Series',
  '/cast-crew': 'Cast & Crew',
  '/episodes-scenes': 'Episodes & Scenes',
  '/vendors-equipment': 'Vendors & Equipment',
  '/budget-expenses': 'Budget & Expenses',
  '/invoices-payments': 'Invoices & Payments',
  '/schedule': 'Schedule',
  '/tasks': 'Tasks',
  '/attendance': 'Attendance',
  '/call-sheets': 'Call Sheets',
  '/locations': 'Locations',
  '/delivery': 'Delivery',
  '/approvals': 'Approvals',
  '/ott-publishing': 'OTT Publishing',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
};

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('frameflow-user') || 'admin@frameflow.com';
  const userName = userEmail.includes('@') ? userEmail.split('@')[0] : 'User';
  const userInitials = userName.slice(0, 2).toUpperCase();
  const currentTitle = ROUTE_TITLES[location.pathname] || 'Workspace';

  const handleLogout = () => {
    localStorage.removeItem('frameflow-auth');
    localStorage.removeItem('frameflow-user');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Clapperboard size={22} />
          </div>
          <div>
            <strong>LOOPSTREAM</strong>
            <span>PRODUCTION CRM</span>
          </div>
          <button
            type="button"
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {NAVIGATION_GROUPS.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-label">{group.title}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar avatar-blue">{userInitials}</div>
            <div className="user-meta">
              <strong>{userName}</strong>
              <span>{userEmail}</span>
            </div>
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            FrameFlow <span>/</span> <strong>{currentTitle}</strong>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Search size={15} />
              <input type="text" placeholder="Search..." aria-label="Search" />
              <kbd>/</kbd>
            </div>

            <button
              type="button"
              className="icon-button notification"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>

            <div className="top-avatar" title={userName}>
              {userInitials}
            </div>
          </div>
        </header>

        <main className="page-content">
          {children || <Outlet />}
        </main>

        <footer className="footer">
          <span>&copy; 2026 LOOPSTREAM CRM &middot; Production Studio</span>
          <span>All systems normal</span>
        </footer>
      </div>
    </div>
  );
}
