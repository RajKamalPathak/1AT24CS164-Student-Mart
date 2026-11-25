import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      if (redirect === 'checkout') {
        navigate('/checkout');
      } else if (redirect === 'account') {
        navigate('/account');
      } else if (redirect === 'orders') {
        navigate('/orders');
      } else {
        navigate('/');
      }
    } catch (err) {
      // error handled in auth context
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('student@campus.edu');
    setPassword('password123');
    addToast('Demo credentials pre-filled for evaluation!', 'info');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-head">
          <div className="auth-icon-circle">
            <GraduationCap size={32} />
          </div>
          <h2>Sign In to Student Mart</h2>
          <p>Access your saved cards, track orders, and order stationery.</p>
        </div>

        {/* Quick Demo Fill Box for Teacher / Student */}
        <div className="demo-credentials-banner" onClick={fillDemoAccount} role="button" tabIndex={0}>
          <div className="demo-banner-content">
            <div className="demo-banner-title">
              <Sparkles size={14} />
              <strong>Teacher / Evaluator Quick Demo Login:</strong>
            </div>
            <p>
              Click here to auto-fill seeded account: <code>student@campus.edu</code> (Password: <code>password123</code>)
            </p>
          </div>
          <span className="btn-demo-click">Click to Auto-fill</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <Mail size={14} />
              <span>Student Email</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rahul@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={14} />
              <span>Password</span>
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
            className="btn-auth-submit"
            disabled={submitting}
          >
            <LogIn size={16} />
            <span>{submitting ? 'Verifying with MongoDB...' : 'Sign In to Student Mart'}</span>
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>New student on campus? </span>
          <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`} className="auth-link">
            Create an Account <ArrowRight size={14} />
          </Link>
        </div>

        <div className="auth-db-tag">
          <Database size={13} />
          <span>Authenticates securely against local/cloud MongoDB</span>
        </div>
      </div>
    </div>
  );
}
