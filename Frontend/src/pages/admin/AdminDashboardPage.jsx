import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Users,
  ClipboardList,
  IndianRupee,
  PlusSquare,
  ArrowRight,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/orders'),
          api.get('/products'),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
        setLowStockItems(productsRes.data.filter((p) => p.stock <= 10));
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="loading-state-box">
        <div className="spinner"></div>
        <p>Loading store metrics from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Admin Store Overview</h1>
          <p className="page-subtitle">
            Monitor stationery inventory, campus orders, and registered student accounts.
          </p>
        </div>
        <Link to="/admin/add-product" className="btn-admin-primary">
          <PlusSquare size={17} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Package size={22} />
          </div>
          <div>
            <span className="kpi-label">Catalog Products</span>
            <h3 className="kpi-value">{stats?.totalProducts ?? 0}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Orders ({stats?.pendingOrders ?? 0} active)</span>
            <h3 className="kpi-value">{stats?.totalOrders ?? 0}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <span className="kpi-label">Campus Store Revenue</span>
            <h3 className="kpi-value">₹{stats?.totalRevenue ?? 0}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Users size={22} />
          </div>
          <div>
            <span className="kpi-label">Registered Students</span>
            <h3 className="kpi-value">{stats?.totalStudents ?? 0}</h3>
          </div>
        </div>
      </div>

      <div className="admin-dash-split">
        {/* Recent Orders */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3>Recent Student Orders</h3>
            <Link to="/admin/orders" className="view-all-link">
              <span>All Orders</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="panel-empty-note">No orders placed by students yet.</p>
          ) : (
            <div className="admin-list-rows">
              {recentOrders.map((order) => (
                <div key={order._id} className="admin-row-item">
                  <div>
                    <strong>{order.shippingAddress?.fullName || order.user?.name}</strong>
                    <span className="row-subtext">
                      {order.shippingAddress?.hostelRoom} • {order.orderItems?.length} item(s)
                    </span>
                  </div>
                  <div className="row-right-meta">
                    <span className="row-amount">₹{order.totalAmount}</span>
                    <span className="order-status-badge">
                      <Clock size={12} />
                      <span>{order.orderStatus}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watch */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3>
              <AlertTriangle size={16} color="#d97706" style={{ marginRight: 6 }} />
              Inventory Watch (&le; 10 units)
            </h3>
            <Link to="/admin/products" className="view-all-link">
              <span>Manage Stock</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="panel-empty-note">All stationery items are well stocked!</p>
          ) : (
            <div className="admin-list-rows">
              {lowStockItems.map((item) => (
                <div key={item._id} className="admin-row-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="row-subtext">{item.category}</span>
                  </div>
                  <span
                    className={`stock-pill ${item.stock <= 5 ? 'stock-low' : ''}`}
                  >
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
