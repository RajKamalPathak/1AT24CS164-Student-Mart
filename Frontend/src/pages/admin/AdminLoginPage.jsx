import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  Sparkles,
  Store,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, logout, user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter admin email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      if (loggedIn.role !== 'admin') {
        addToast(
          'Access Denied: This is a Student account. Admin privileges required.',
          'error'
        );
        logout(false);
        return;
      }
      navigate('/admin');
    } catch {
      // toast handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const fillAdminDemo = () => {
    setEmail('admin@campus.edu');
    setPassword('admin123');
    addToast('Admin credentials filled for store verification!', 'info');
  };

  return (
    <div className="admin-login-wrapper">
      <div className="auth-card admin-auth-card">
        <div className="auth-brand-head">
          <div className="auth-icon-circle admin-icon-circle">
            <ShieldCheck size={32} />
          </div>
          <h2>Student Mart — Admin Portal</h2>
          <p>Sign in with administrator credentials to manage products & campus orders.</p>
        </div>

        {isAuthenticated && user?.role !== 'admin' && (
          <div className="admin-role-warning">
            <AlertCircle size={18} />
            <span>
              Currently signed in as Student (<strong>{user.email}</strong>). Sign in with
              an Admin account to continue.
            </span>
          </div>
        )}

        <div
          className="demo-credentials-banner"
          onClick={fillAdminDemo}
          role="button"
          tabIndex={0}
        >
          <div className="demo-banner-content">
            <div className="demo-banner-title">
              <Sparkles size={14} />
              <strong>Quick Admin Demo Login:</strong>
            </div>
            <p>
              Email: <code>admin@campus.edu</code> | Password: <code>admin123</code>
            </p>
          </div>
          <span className="btn-demo-click">Auto-fill</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <Mail size={14} />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={14} />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit btn-admin-login"
            disabled={submitting}
          >
            <LogIn size={16} />
            <span>{submitting ? 'Authenticating...' : 'Enter Admin Console'}</span>
          </button>
        </form>

        <div className="auth-footer-prompt">
          <Link to="/" className="auth-link">
            <Store size={15} />
            <span>Back to Student Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
