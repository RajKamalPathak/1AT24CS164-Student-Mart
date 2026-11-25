import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  UserPlus,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    phone: '',
    hostelAddress: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      addToast('Please fill in required fields (Name, Email, Password)', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/store');
      }
    } catch (err) {
      // handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card-wide">
        <div className="auth-brand-head">
          <div className="auth-icon-circle">
            <GraduationCap size={32} />
          </div>
          <h2>Create Student Mart Account</h2>
          <p>
            Register with your student details. Your record will be saved in MongoDB
            database instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-fields-grid">
            <div className="form-group col-span-2">
              <label>
                <User size={14} />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Nair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={14} />
                <span>Student Email *</span>
              </label>
              <input
                type="email"
                required
                placeholder="priya@campus.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={14} />
                <span>Password * (Min 6 chars)</span>
              </label>
              <input
                type="password"
                required
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <GraduationCap size={14} />
                <span>Student Roll / ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2024CS112"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <Building size={14} />
                <span>Academic Department</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={14} />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <Building size={14} />
                <span>Hostel & Room No.</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ganga Hostel, Room 102"
                value={formData.hostelAddress}
                onChange={(e) =>
                  setFormData({ ...formData, hostelAddress: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={submitting}
          >
            <UserPlus size={16} />
            <span>
              {submitting ? 'Creating account in MongoDB...' : 'Complete Student Registration'}
            </span>
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already registered with Student Mart? </span>
          <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`} className="auth-link">
            Log In Here <ArrowRight size={14} />
          </Link>
        </div>

        <div className="auth-db-tag">
          <Database size={13} />
          <span>New document created in MongoDB <code>users</code> collection</span>
        </div>
      </div>
    </div>
  );
}
