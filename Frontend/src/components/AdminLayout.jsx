import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusSquare,
  Package,
  ClipboardList,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  Database,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, name: 'student_mart' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.database) {
          setDbStatus({
            connected: res.data.database.status === 'Connected',
            name: res.data.database.name || 'student_mart',
          });
        }
      } catch {
        setDbStatus({ connected: false, name: 'offline' });
      }
    };
    checkDb();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="app-layout-root admin-portal-root">
      {/* Mobile Admin Bar */}
      <header className="mobile-header admin-mobile-header">
        <div className="mobile-brand">
          <ShieldCheck className="brand-icon" size={24} color="#f59e0b" />
          <div>
            <span className="brand-title">Student Mart Admin</span>
            <span className="brand-subtitle">Store Operations</span>
          </div>
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle admin menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {isOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Dedicated Admin Sidebar */}
      <aside className={`app-sidebar admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-box">
          <div className="brand-logo-row">
            <div className="brand-icon-wrapper admin-brand-icon">
              <ShieldCheck size={26} />
            </div>
            <div className="brand-text">
              <h1 className="brand-name">ADMIN CONSOLE</h1>
              <p className="brand-tagline">Student Mart Management</p>
            </div>
          </div>

          <div
            className={`db-status-pill ${
              dbStatus.connected ? 'status-online' : 'status-offline'
            }`}
          >
            <span className="status-dot"></span>
            <Database size={13} style={{ marginRight: 4 }} />
            <span>
              {dbStatus.connected ? `MongoDB: ${dbStatus.name}` : 'DB Connecting...'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">ADMIN OPERATIONS</div>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'admin-nav-active' : ''}`
            }
          >
            <LayoutDashboard size={19} />
            <span>Store Overview</span>
          </NavLink>

          <NavLink
            to="/admin/add-product"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'admin-nav-active' : ''}`
            }
          >
            <PlusSquare size={19} />
            <span>Add New Product</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'admin-nav-active' : ''}`
            }
          >
            <Package size={19} />
            <span>Inventory & Products</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'admin-nav-active' : ''}`
            }
          >
            <ClipboardList size={19} />
            <span>Campus Orders</span>
          </NavLink>

          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'admin-nav-active' : ''}`
            }
          >
            <Users size={19} />
            <span>Registered Students</span>
          </NavLink>

          <div className="nav-group-label" style={{ marginTop: '1.25rem' }}>
            STOREFRONT ACCESS
          </div>

          <NavLink to="/" className="nav-item">
            <Store size={19} />
            <span>View Student Portal</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar-circle admin-avatar-circle">A</div>
            <div className="user-info-text">
              <span className="user-name">{user?.name || 'Store Admin'}</span>
              <span className="user-sub">Role: Administrator</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-sidebar-logout"
              title="Sign Out of Admin"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-viewport-wrapper">
        <div className="campus-ticker-bar admin-top-bar">
          <div className="ticker-content">
            <span className="ticker-tag admin-tag">ADMIN MODE</span>
            <span className="ticker-text">
              Changes made here update MongoDB <code>student_mart</code> directly and reflect live in the Student Storefront.
            </span>
          </div>
        </div>

        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
