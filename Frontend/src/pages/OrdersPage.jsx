import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PackageCheck,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        try {
          const res = await api.get('/orders/myorders');
          setOrders(res.data);
        } catch (err) {
          console.error('Error fetching orders:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="orders-unauth-box">
        <div className="unauth-card">
          <PackageCheck size={48} className="unauth-icon" />
          <h2>Student Login Required</h2>
          <p>
            Please log in to your student account to view orders recorded in MongoDB.
          </p>
          <Link to="/login?redirect=orders" className="btn-browse-mart">
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">My Campus Orders</h1>
          <p className="page-subtitle">
            All stationery, calculators, and lab gear orders recorded in MongoDB database.
          </p>
        </div>
        <div className="orders-db-indicator">
          <Database size={14} />
          <span>MongoDB Collection: <code>orders</code></span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state-box">
          <div className="spinner"></div>
          <p>Querying orders from MongoDB...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-results-box">
          <PackageCheck size={48} className="empty-icon" />
          <h3>No Orders Placed Yet</h3>
          <p>
            You haven't ordered any semester supplies yet. Place an order to see it appear
            in the database!
          </p>
          <Link to="/products" className="btn-browse-mart" style={{ marginTop: '1rem' }}>
            <span>Browse Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Order Card Header */}
              <div className="order-card-header">
                <div className="order-id-group">
                  <span className="order-label">ORDER ID</span>
                  <span className="order-id-code">#{order._id}</span>
                </div>

                <div className="order-date-group">
                  <Calendar size={14} />
                  <span>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="order-status-group">
                  <span className="order-status-badge">
                    <Clock size={13} />
                    <span>{order.orderStatus || 'Order Placed'}</span>
                  </span>
                </div>

                <div className="order-total-group">
                  <span className="order-total-label">Total Amount</span>
                  <span className="order-total-val">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Order Meta Row */}
              <div className="order-meta-grid">
                <div className="order-meta-block">
                  <div className="meta-label">
                    <Building size={14} />
                    <span>Hostel Delivery Address</span>
                  </div>
                  <div className="meta-value">
                    <strong>{order.shippingAddress?.fullName}</strong> (Roll: {order.shippingAddress?.studentId || 'N/A'})
                    <br />
                    {order.shippingAddress?.hostelRoom}
                    <br />
                    Dept: {order.shippingAddress?.department || 'General'} • Ph: {order.shippingAddress?.phone}
                  </div>
                </div>

                <div className="order-meta-block">
                  <div className="meta-label">
                    <CreditCard size={14} />
                    <span>Payment & Card Details</span>
                  </div>
                  <div className="meta-value">
                    <strong>{order.paymentMethod}</strong>
                    <br />
                    {order.paymentDetails?.cardLast4 && order.paymentDetails.cardLast4 !== 'COD' ? (
                      <span>Card ending in <code>•••• {order.paymentDetails.cardLast4}</code> ({order.paymentDetails.cardType || 'Card'})</span>
                    ) : (
                      <span>Cash payment on delivery</span>
                    )}
                    <br />
                    <span className="payment-status-tag">Status: {order.paymentDetails?.status || 'Paid / Verified'}</span>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="order-items-table">
                <div className="order-items-title">Ordered Stationery & Essentials:</div>
                <div className="order-items-rows">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="order-item-mini-row">
                      <img src={item.image} alt={item.name} className="mini-thumb" />
                      <div className="mini-info">
                        <span className="mini-name">{item.name}</span>
                        <span className="mini-qty-price">
                          Qty: <strong>{item.qty}</strong> × ₹{item.price}
                        </span>
                      </div>
                      <div className="mini-line-total">
                        ₹{item.qty * item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
