import { useState, useEffect } from 'react';
import { ClipboardList, Building, CreditCard, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ORDER_STATUSES = [
  'Order Placed',
  'Packed at Student Mart',
  'Out for Campus Delivery',
  'Delivered',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        addToast(err.message || 'Error loading orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: res.data.orderStatus } : o
        )
      );
      addToast(`Order status updated to "${newStatus}" in MongoDB`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="admin-orders-page">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Campus Orders Fulfillment</h1>
          <p className="page-subtitle">
            Track student orders and update dorm delivery status in MongoDB.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state-box">
          <div className="spinner"></div>
          <p>Loading student orders from MongoDB...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-results-box">
          <ClipboardList size={44} className="empty-icon" />
          <h3>No Campus Orders Yet</h3>
          <p>Orders placed from the Student Portal will show up here automatically.</p>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-id-group">
                  <span className="order-label">ORDER ID</span>
                  <span className="order-id-code">#{order._id}</span>
                </div>

                <div className="order-date-group">
                  <Calendar size={14} />
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>

                <div className="admin-status-control">
                  <label htmlFor={`status-${order._id}`}>Status:</label>
                  <select
                    id={`status-${order._id}`}
                    className="sort-select"
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="order-total-group">
                  <span className="order-total-label">Amount</span>
                  <span className="order-total-val">₹{order.totalAmount}</span>
                </div>
              </div>

              <div className="order-meta-grid">
                <div className="order-meta-block">
                  <div className="meta-label">
                    <Building size={14} />
                    <span>Student & Delivery Location</span>
                  </div>
                  <div className="meta-value">
                    <strong>{order.shippingAddress?.fullName}</strong> (
                    {order.shippingAddress?.studentId || 'No ID'})
                    <br />
                    {order.shippingAddress?.hostelRoom} • Ph: {order.shippingAddress?.phone}
                  </div>
                </div>

                <div className="order-meta-block">
                  <div className="meta-label">
                    <CreditCard size={14} />
                    <span>Payment Info</span>
                  </div>
                  <div className="meta-value">
                    <strong>{order.paymentMethod}</strong>
                    <br />
                    {order.paymentDetails?.cardLast4 &&
                    order.paymentDetails.cardLast4 !== 'COD'
                      ? `Card ending in •••• ${order.paymentDetails.cardLast4}`
                      : 'Cash on Delivery'}
                  </div>
                </div>
              </div>

              <div className="order-items-table">
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
                      <div className="mini-line-total">₹{item.qty * item.price}</div>
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
