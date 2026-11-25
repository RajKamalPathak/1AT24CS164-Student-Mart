import { useState, useEffect } from 'react';
import { Mail, Building, Phone, Trash2, Shield } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminStudentsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        addToast(err.message || 'Error loading accounts', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteCustomer = async (targetUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer account "${targetUser.name}" (${targetUser.email})?\n\nThis will permanently remove the account and its saved cards from MongoDB.`
    );
    if (!confirmed) return;

    setDeletingId(targetUser._id);
    try {
      const res = await api.delete(`/admin/users/${targetUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      addToast(res.data?.message || 'Customer account deleted from MongoDB', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to delete customer account', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-students-page">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Registered Accounts</h1>
          <p className="page-subtitle">
            Manage customer (student) and administrator accounts stored in MongoDB <code>users</code> collection.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state-box">
          <div className="spinner"></div>
          <p>Fetching user accounts from MongoDB...</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Name &amp; Roll No.</th>
                  <th>Contact</th>
                  <th>Department &amp; Hostel</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="table-product-name">{u.name}</div>
                      <div className="table-product-brand">
                        ID: {u.studentId || 'Not set'}
                      </div>
                    </td>
                    <td>
                      <div className="table-meta-line">
                        <Mail size={13} />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="table-meta-line">
                          <Phone size={13} />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-meta-line">{u.department || 'General'}</div>
                      <div className="table-meta-line sub">
                        <Building size={13} />
                        <span>{u.hostelAddress || 'No hostel saved'}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`role-badge ${
                          u.role === 'admin' ? 'role-admin' : 'role-student'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role === 'admin' ? (
                        <span className="protected-account-pill" title="Admin accounts cannot be deleted">
                          <Shield size={13} />
                          <span>Protected</span>
                        </span>
                      ) : (
                        <button
                          className="btn-table-delete btn-delete-account"
                          onClick={() => handleDeleteCustomer(u)}
                          disabled={deletingId === u._id}
                          title={`Delete ${u.name}'s account`}
                        >
                          <Trash2 size={14} />
                          <span>{deletingId === u._id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
