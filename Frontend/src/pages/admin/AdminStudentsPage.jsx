import { useState, useEffect } from 'react';
import { Users, Mail, Building, Phone } from 'lucide-react';
import api from '../../services/api';

export default function AdminStudentsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="admin-students-page">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Registered Accounts</h1>
          <p className="page-subtitle">
            All student and admin accounts recorded in MongoDB <code>users</code> collection.
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
                  <th>Name & Roll No.</th>
                  <th>Contact</th>
                  <th>Department & Hostel</th>
                  <th>Role</th>
                  <th>Joined</th>
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
