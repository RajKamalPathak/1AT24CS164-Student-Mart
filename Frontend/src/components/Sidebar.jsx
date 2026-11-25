import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  PackageCheck,
  UserCheck,
  CreditCard,
  LogOut,
  LogIn,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Database,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, name: 'student_mart' });
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Check MongoDB connection status for teacher's verification
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await api.get('/health');
        if (res.data && res.data.database) {
          setDbStatus({
            connected: res.data.database.status === 'Connected',
            name: res.data.database.name || 'student_mart',
          });
        }
      } catch (err) {
        setDbStatus({ connected: false, name: 'connecting...' });
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <GraduationCap className="brand-icon" size={26} />
          <div>
            <span className="brand-title">Student Mart</span>
            <span className="brand-subtitle">Campus Store</span>
          </div>
        </div>
        <div className="mobile-actions">
          <NavLink to="/cart" className="mobile-cart-btn" aria-label="Cart">
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Persistent Sidebar */}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-logo-row">
            <div className="brand-icon-wrapper">
              <GraduationCap size={28} className="brand-icon" />
            </div>
            <div className="brand-text">
              <h1 className="brand-name">STUDENT MART</h1>
              <p className="brand-tagline">Campus Stationery & Lab Gear</p>
            </div>
          </div>

          {/* Real-time MongoDB Connection Status Badge */}
          <div
            className={`db-status-pill ${
              dbStatus.connected ? 'status-online' : 'status-offline'
            }`}
            title="Database verification indicator for project evaluation"
          >
            <span className="status-dot"></span>
            <Database size={13} style={{ marginRight: 4 }} />
            <span>
              {dbStatus.connected
                ? `MongoDB: ${dbStatus.name}`
                : 'Connecting to MongoDB...'}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">STORE NAVIGATION</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <Home size={19} className="nav-icon" />
            <span className="nav-label">Home</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <ShoppingBag size={19} className="nav-icon" />
            <span className="nav-label">Stationery & Products</span>
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <div className="nav-cart-wrapper">
              <ShoppingCart size={19} className="nav-icon" />
              {totalItems > 0 && <span className="cart-badge-pill">{totalItems}</span>}
            </div>
            <span className="nav-label">My Cart</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <PackageCheck size={19} className="nav-icon" />
            <span className="nav-label">My Orders</span>
          </NavLink>

          <div className="nav-group-label" style={{ marginTop: '1.25rem' }}>
            STUDENT DASHBOARD
          </div>

          <NavLink
            to="/account"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <UserCheck size={19} className="nav-icon" />
            <span className="nav-label">Account & Profile</span>
          </NavLink>

          <NavLink
            to="/account?tab=cards"
            className={({ isActive }) =>
              `nav-item ${
                isActive && location.search.includes('tab=cards')
                  ? 'nav-item-active'
                  : ''
              }`
            }
          >
            <CreditCard size={19} className="nav-icon" />
            <span className="nav-label">Credit & Debit Cards</span>
          </NavLink>
        </nav>

        {/* Campus Info Widget */}
        <div className="sidebar-campus-perks">
          <div className="perk-title">
            <Sparkles size={14} className="perk-icon" />
            <span>Campus Express</span>
          </div>
          <p className="perk-desc">
            Direct delivery to Hostel Rooms, Departments & Campus Library.
          </p>
          <div className="perk-chip">
            <Building2 size={12} />
            <span>Hostel Free Drop on ₹299+</span>
          </div>
        </div>

        {/* User Footer Profile & Auth Control */}
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <div className="sidebar-user-card">
              <div className="user-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="user-info-text">
                <span className="user-name">{user?.name}</span>
                <span className="user-sub">
                  {user?.studentId || user?.email || 'Student Account'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-sidebar-logout"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="sidebar-guest-box">
              <p className="guest-prompt">Sign in to save cards & track orders</p>
              <div className="guest-btn-row">
                <NavLink to="/login" className="btn-guest-login">
                  <LogIn size={15} />
                  <span>Login</span>
                </NavLink>
                <NavLink to="/register" className="btn-guest-register">
                  Join
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
