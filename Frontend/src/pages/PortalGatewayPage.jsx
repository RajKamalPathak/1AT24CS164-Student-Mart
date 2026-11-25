import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Truck,
  PlusSquare,
  ClipboardList,
  Users,
  ArrowRight,
  Database,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PortalGatewayPage() {
  const { user, isAuthenticated } = useAuth();
  const [dbStatus, setDbStatus] = useState({ connected: false, name: 'student_mart' });

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
        setDbStatus({ connected: false, name: 'connecting...' });
      }
    };
    checkDb();
  }, []);

  const isAdminLoggedIn = isAuthenticated && user?.role === 'admin';
  const isStudentLoggedIn = isAuthenticated && user?.role === 'student';

  return (
    <div className="portal-gateway-wrapper">
      <div className="portal-gateway-container">
        {/* Top Header */}
        <header className="gateway-header">
          <div className="gateway-brand-pill">
            <GraduationCap size={20} />
            <span>STUDENT MART • CAMPUS PLATFORM</span>
          </div>

          <h1 className="gateway-title">Choose Your Portal to Continue</h1>
          <p className="gateway-subtitle">
            Select whether you are signing in as a <strong>Student</strong> to shop stationery
            &amp; manage your account, or as an <strong>Administrator</strong> to manage store inventory &amp; orders.
          </p>

          <div
            className={`db-status-pill ${
              dbStatus.connected ? 'status-online' : 'status-offline'
            }`}
            style={{ marginTop: '1rem' }}
          >
            <span className="status-dot"></span>
            <Database size={13} style={{ marginRight: 4 }} />
            <span>
              {dbStatus.connected
                ? `MongoDB Connected: ${dbStatus.name}`
                : 'Connecting to MongoDB...'}
            </span>
          </div>
        </header>

        {/* Two Portal Choice Cards */}
        <div className="portal-cards-grid">
          {/* Card 1: Student Portal */}
          <div className="portal-choice-card portal-student-card">
            <div className="portal-card-top">
              <div className="portal-icon-box student-icon-box">
                <GraduationCap size={30} />
              </div>
              <span className="portal-role-tag student-tag">CUSTOMER / STUDENT</span>
            </div>

            <h2 className="portal-card-heading">Student Mart Storefront</h2>
            <p className="portal-card-desc">
              For students buying semester notebooks, Casio calculators, lab coats, and
              dorm essentials with hostel room delivery.
            </p>

            <ul className="portal-features-list">
              <li>
                <ShoppingBag size={15} />
                <span>Browse &amp; search academic stationery catalog</span>
              </li>
              <li>
                <Truck size={15} />
                <span>Order directly to your hostel block &amp; room</span>
              </li>
              <li>
                <CreditCard size={15} />
                <span>Save credit/debit cards &amp; manage student profile</span>
              </li>
            </ul>

            {isStudentLoggedIn && (
              <div className="portal-session-note">
                <CheckCircle2 size={15} />
                <span>Signed in as {user.name}</span>
              </div>
            )}

            <div className="portal-card-actions">
              <Link to="/store" className="btn-portal-student">
                <span>Enter Student Store</span>
                <ArrowRight size={17} />
              </Link>
              {!isStudentLoggedIn && (
                <Link to="/login" className="btn-portal-outline">
                  <LogIn size={16} />
                  <span>Student Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Card 2: Admin Portal */}
          <div className="portal-choice-card portal-admin-card">
            <div className="portal-card-top">
              <div className="portal-icon-box admin-icon-box">
                <ShieldCheck size={30} />
              </div>
              <span className="portal-role-tag admin-role-tag">STORE MANAGEMENT</span>
            </div>

            <h2 className="portal-card-heading">Admin Operations Portal</h2>
            <p className="portal-card-desc">
              For store administrators to publish new stationery items, update stock &amp;
              pricing, and fulfill campus student orders.
            </p>

            <ul className="portal-features-list">
              <li>
                <PlusSquare size={15} />
                <span>Add new products &amp; edit inventory in MongoDB</span>
              </li>
              <li>
                <ClipboardList size={15} />
                <span>View all student orders &amp; update delivery status</span>
              </li>
              <li>
                <Users size={15} />
                <span>Monitor store revenue, low stock &amp; student accounts</span>
              </li>
            </ul>

            {isAdminLoggedIn && (
              <div className="portal-session-note admin-session-note">
                <CheckCircle2 size={15} />
                <span>Admin session active ({user.email})</span>
              </div>
            )}

            <div className="portal-card-actions">
              <Link
                to={isAdminLoggedIn ? '/admin' : '/admin/login'}
                className="btn-portal-admin"
              >
                <span>{isAdminLoggedIn ? 'Open Admin Console' : 'Enter Admin Portal'}</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="gateway-footer">
          <span>Student Mart Full-Stack MERN System</span>
          <span className="footer-divider">•</span>
          <span>You can switch between portals anytime from the sidebar</span>
        </footer>
      </div>
    </div>
  );
}
