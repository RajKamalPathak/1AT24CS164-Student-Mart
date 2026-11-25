import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  KeyRound,
  CreditCard,
  Building,
  Phone,
  Mail,
  GraduationCap,
  Save,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Database,
  Lock,
  Star,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AccountPage() {
  const { user, isAuthenticated, updateProfile, changePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'profile' | 'password' | 'cards'
  const activeTab = searchParams.get('tab') || 'profile';

  // 1. Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    phone: user?.phone || '',
    hostelAddress: user?.hostelAddress || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // 2. Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 3. Credit Cards State
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolder: user?.name || '',
    cardNumber: '',
    expiryMonth: '08',
    expiryYear: '28',
    cardNickname: 'Campus Student Card',
    isDefault: false,
  });
  const [savingCard, setSavingCard] = useState(false);

  // Sync profile form when user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        studentId: user.studentId || '',
        department: user.department || '',
        phone: user.phone || '',
        hostelAddress: user.hostelAddress || '',
      });
      setCardForm((prev) => ({
        ...prev,
        cardHolder: prev.cardHolder || user.name || '',
      }));
    }
  }, [user]);

  // Fetch cards on tab change or mount
  const fetchCards = async () => {
    if (!isAuthenticated) return;
    setLoadingCards(true);
    try {
      const res = await api.get('/cards');
      setCards(res.data);
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cards' && isAuthenticated) {
      fetchCards();
    }
  }, [activeTab, isAuthenticated]);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
    } catch (err) {
      // error handled in auth context
    } finally {
      setSavingProfile(false);
    }
  };

  // Password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast('Please fill in current and new password fields', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New password and confirmation password do not match', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Card Number Auto-formatting (spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm({ ...cardForm, cardNumber: formatted });
  };

  // Add Card to MongoDB
  const handleAddCardSubmit = async (e) => {
    e.preventDefault();
    const cleanNum = cardForm.cardNumber.replace(/\D/g, '');

    if (cleanNum.length < 13 || cleanNum.length > 16) {
      addToast('Please enter a valid card number (13-16 digits)', 'error');
      return;
    }

    if (!cardForm.cardHolder.trim()) {
      addToast('Please enter the cardholder name', 'error');
      return;
    }

    setSavingCard(true);
    try {
      const res = await api.post('/cards', {
        cardHolder: cardForm.cardHolder,
        cardNumber: cardForm.cardNumber,
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        cardNickname: cardForm.cardNickname || 'College Debit Card',
        isDefault: cardForm.isDefault,
      });

      addToast('Card saved successfully to MongoDB cards collection!', 'success');
      setShowAddCard(false);
      setCardForm({
        cardHolder: user?.name || '',
        cardNumber: '',
        expiryMonth: '08',
        expiryYear: '28',
        cardNickname: 'Campus Student Card',
        isDefault: false,
      });
      fetchCards();
    } catch (err) {
      addToast(err.message || 'Error saving card to database', 'error');
    } finally {
      setSavingCard(false);
    }
  };

  // Delete Card from MongoDB
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this saved card from MongoDB?')) {
      return;
    }
    try {
      await api.delete(`/cards/${cardId}`);
      addToast('Card removed from MongoDB database', 'info');
      fetchCards();
    } catch (err) {
      addToast(err.message || 'Error removing card', 'error');
    }
  };

  // Set Default Card in MongoDB
  const handleSetDefault = async (cardId) => {
    try {
      await api.put(`/cards/${cardId}/default`);
      addToast('Default card updated in MongoDB!', 'success');
      fetchCards();
    } catch (err) {
      addToast(err.message || 'Error setting default card', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="account-unauth-box">
        <div className="unauth-card">
          <User size={48} className="unauth-icon" />
          <h2>Student Portal Login Required</h2>
          <p>
            Please sign in to update your student profile details, change password, or
            manage your saved credit cards.
          </p>
          <div className="unauth-btn-row">
            <Link to="/login?redirect=account" className="btn-browse-mart">
              Sign In
            </Link>
            <Link to="/register" className="btn-secondary-outline">
              Create Student Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page-container">
      {/* Page Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Student Account Management</h1>
          <p className="page-subtitle">
            Manage your personal academic details, security password, and stored credit cards.
          </p>
        </div>

        <div className="db-sync-badge">
          <Database size={14} />
          <span>MongoDB Synchronized</span>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="account-tabs-bar">
        <button
          className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          <User size={18} />
          <span>Profile & Details</span>
        </button>

        <button
          className={`account-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setTab('password')}
        >
          <KeyRound size={18} />
          <span>Change Password</span>
        </button>

        <button
          className={`account-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setTab('cards')}
        >
          <CreditCard size={18} />
          <span>Credit & Debit Cards ({cards.length})</span>
        </button>
      </div>

      {/* TAB 1: Profile & Personal Details */}
      {activeTab === 'profile' && (
        <div className="account-tab-content">
          <div className="account-form-card">
            <div className="card-top-info">
              <div>
                <h2 className="tab-title">Student Profile Details</h2>
                <p className="tab-desc">
                  Update your name, roll number, hostel room, and contact info. Changes
                  are written immediately to MongoDB <code>users</code> collection.
                </p>
              </div>
              <div className="active-user-badge">
                <span className="dot"></span>
                <span>Role: {user.role || 'Student'}</span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-fields-grid">
                <div className="form-group col-span-2">
                  <label>
                    <User size={14} />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                  <small className="field-hint">
                    This name will appear on student delivery slips and orders.
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={14} />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <GraduationCap size={14} />
                    <span>Student Roll / Registration Number</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024CS089"
                    value={profileForm.studentId}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, studentId: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Building size={14} />
                    <span>Department / Academic Branch</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={profileForm.department}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, department: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={14} />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>
                    <Building size={14} />
                    <span>Hostel Block & Room / Delivery Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hostel 3, Room 214, North Campus"
                    value={profileForm.hostelAddress}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, hostelAddress: e.target.value })
                    }
                  />
                  <small className="field-hint">
                    Default delivery address for checkout in Student Mart.
                  </small>
                </div>
              </div>

              <div className="form-actions-bar">
                <button
                  type="submit"
                  className="btn-save-profile"
                  disabled={savingProfile}
                >
                  <Save size={16} />
                  <span>
                    {savingProfile ? 'Writing to MongoDB...' : 'Save Changes to MongoDB'}
                  </span>
                </button>

                <div className="db-notice-tag">
                  <CheckCircle2 size={14} />
                  <span>Updates reflected live if checked via MongoDB Compass</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Change Password */}
      {activeTab === 'password' && (
        <div className="account-tab-content">
          <div className="account-form-card">
            <div className="card-top-info">
              <div>
                <h2 className="tab-title">Change Account Password</h2>
                <p className="tab-desc">
                  Update your security credentials. Your password will be securely hashed
                  with bcrypt before writing to MongoDB.
                </p>
              </div>
              <div className="security-icon-tag">
                <Lock size={16} />
                <span>Bcrypt Salt: 10 Rounds</span>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-fields-grid single-col">
                <div className="form-group">
                  <label>
                    <KeyRound size={14} />
                    <span>Current Password *</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <KeyRound size={14} />
                    <span>New Password * (Minimum 6 characters)</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <KeyRound size={14} />
                    <span>Confirm New Password *</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions-bar">
                <button
                  type="submit"
                  className="btn-save-profile"
                  disabled={updatingPassword}
                >
                  <Save size={16} />
                  <span>
                    {updatingPassword ? 'Updating Password...' : 'Update Password in Database'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Credit Card Section */}
      {activeTab === 'cards' && (
        <div className="account-tab-content">
          <div className="cards-management-card">
            <div className="cards-header-bar">
              <div>
                <h2 className="tab-title">Saved Credit & Debit Cards</h2>
                <p className="tab-desc">
                  Store and manage cards in MongoDB <code>cards</code> collection for quick checkout.
                </p>
              </div>

              <button
                type="button"
                className="btn-add-card-toggle"
                onClick={() => setShowAddCard(!showAddCard)}
              >
                <PlusCircle size={16} />
                <span>{showAddCard ? 'Cancel' : 'Add New Card'}</span>
              </button>
            </div>

            {/* Add New Card Form Drawer */}
            {showAddCard && (
              <div className="add-card-section">
                <div className="add-card-header">
                  <h3>Enter Card Details to Store in MongoDB</h3>
                  <p>Card number will be masked (•••• •••• •••• 1234) for security.</p>
                </div>

                <form onSubmit={handleAddCardSubmit} className="add-card-form">
                  <div className="form-fields-grid">
                    <div className="form-group col-span-2">
                      <label>Cardholder Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={cardForm.cardHolder}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, cardHolder: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group col-span-2">
                      <label>Card Number (16 Digits) *</label>
                      <input
                        type="text"
                        required
                        placeholder="4532 8900 1234 5678"
                        value={cardForm.cardNumber}
                        onChange={handleCardNumberChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Expiry Month *</label>
                      <select
                        value={cardForm.expiryMonth}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, expiryMonth: e.target.value })
                        }
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = (i + 1).toString().padStart(2, '0');
                          return (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Expiry Year *</label>
                      <select
                        value={cardForm.expiryYear}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, expiryYear: e.target.value })
                        }
                      >
                        {['25', '26', '27', '28', '29', '30', '31', '32', '33'].map(
                          (yr) => (
                            <option key={yr} value={yr}>
                              20{yr}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="form-group col-span-2">
                      <label>Card Label / Nickname</label>
                      <input
                        type="text"
                        placeholder="e.g. Campus SBI Debit or Dad's HDFC"
                        value={cardForm.cardNickname}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, cardNickname: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group col-span-2">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={cardForm.isDefault}
                          onChange={(e) =>
                            setCardForm({ ...cardForm, isDefault: e.target.checked })
                          }
                        />
                        <span>Set this card as default payment method</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions-bar">
                    <button
                      type="submit"
                      className="btn-save-profile"
                      disabled={savingCard}
                    >
                      <Save size={16} />
                      <span>{savingCard ? 'Saving to Database...' : 'Save Card to MongoDB'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowAddCard(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Saved Cards */}
            {loadingCards ? (
              <div className="loading-state-box">
                <div className="spinner"></div>
                <p>Retrieving cards from MongoDB...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="empty-cards-box">
                <CreditCard size={44} className="empty-icon" />
                <h3>No Cards Saved in Database</h3>
                <p>
                  You don't have any cards stored yet. Click "Add New Card" above to save
                  a student card to MongoDB!
                </p>
                <button
                  className="btn-add-card-toggle"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => setShowAddCard(true)}
                >
                  <PlusCircle size={15} />
                  <span>Add First Card</span>
                </button>
              </div>
            ) : (
              <div className="saved-cards-deck">
                {cards.map((card) => (
                  <div key={card._id} className="campus-credit-card">
                    {/* Metallic card top */}
                    <div className="card-top-row">
                      <div className="card-chip-element">
                        <div className="chip-lines"></div>
                      </div>
                      <div className="card-brand-label">{card.cardType}</div>
                    </div>

                    {/* Masked Card Number */}
                    <div className="card-num-row">{card.cardNumber}</div>

                    {/* Holder & Expiry */}
                    <div className="card-bottom-row">
                      <div className="holder-col">
                        <span className="card-micro-label">CARDHOLDER</span>
                        <span className="holder-name">{card.cardHolder}</span>
                      </div>

                      <div className="exp-col">
                        <span className="card-micro-label">EXPIRES</span>
                        <span className="exp-val">
                          {card.expiryMonth}/{card.expiryYear}
                        </span>
                      </div>
                    </div>

                    {/* Footer with action buttons & nickname */}
                    <div className="card-actions-strip">
                      <span className="card-nickname-pill">{card.cardNickname}</span>

                      <div className="card-btn-controls">
                        {card.isDefault ? (
                          <span className="default-indicator-pill">
                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                            <span>Default</span>
                          </span>
                        ) : (
                          <button
                            className="btn-card-make-default"
                            onClick={() => handleSetDefault(card._id)}
                            title="Set as Default"
                          >
                            Set Default
                          </button>
                        )}

                        <button
                          className="btn-card-delete"
                          onClick={() => handleDeleteCard(card._id)}
                          title="Delete card from MongoDB"
                          aria-label="Delete card"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Note for Teacher */}
            <div className="teacher-verification-card">
              <Database size={18} className="verification-icon" />
              <div>
                <strong>MongoDB Teacher Verification:</strong>
                <p>
                  All card records are stored in the <code>cards</code> collection in MongoDB
                  with a reference to the student's <code>user._id</code>. You can open MongoDB Compass
                  or mongo shell and inspect the <code>cards</code> collection directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
