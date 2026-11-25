import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusSquare,
  Save,
  Image as ImageIcon,
  Star,
  ShoppingBag,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'Notebooks & Paper',
  'Writing & Pens',
  'Calculators & Tech',
  'Lab & Engineering',
  'Art & Drafting',
  'Study & Dorm',
];

const SAMPLE_IMAGES = [
  {
    label: 'Notebook',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Pens',
    url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Calculator',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Lab Gear',
    url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Desk Lamp',
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80',
  },
];

export default function AdminAddProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Notebooks & Paper',
    brand: '',
    price: '',
    originalPrice: '',
    stock: '25',
    badge: 'New Arrival',
    image: SAMPLE_IMAGES[0].url,
    description: '',
    features: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      addToast('Please fill in Product Name, Price, and Description', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/products', {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : Math.round(Number(formData.price) * 1.2),
        stock: Number(formData.stock || 0),
      });

      addToast(`"${formData.name}" added to MongoDB & live in Student Store!`, 'success');
      navigate('/admin/products');
    } catch (err) {
      addToast(err.message || 'Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-add-product-page">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Add New Product to Student Mart</h1>
          <p className="page-subtitle">
            Publish new stationery, calculators, or campus gear directly into MongoDB.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary-outline"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft size={15} style={{ marginRight: 6 }} />
          Back to Inventory
        </button>
      </div>

      <div className="admin-add-grid">
        {/* Left: Product Form */}
        <form onSubmit={handleSubmit} className="checkout-card admin-form-card">
          <div className="form-fields-grid">
            <div className="form-group col-span-2">
              <label>Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Staedtler Fineliner Set (Pack of 10)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Academic Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Casio, Classmate, Pilot"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Student Selling Price (₹) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 299"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Original MRP Price (₹)</label>
              <input
                type="number"
                min="1"
                placeholder="Optional (shows discount)"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Store Badge</label>
              <input
                type="text"
                placeholder="e.g. New Arrival, Exam Special"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label>
                <ImageIcon size={14} />
                <span>Product Image URL</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <div className="sample-img-chips">
                <span>Quick presets:</span>
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    className="sample-img-btn"
                    onClick={() => setFormData({ ...formData, image: sample.url })}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group col-span-2">
              <label>Product Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe why students need this item for lectures, labs, or dorm life..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="form-group col-span-2">
              <label>Key Highlights (One feature per line)</label>
              <textarea
                rows={3}
                placeholder={"70 GSM bright paper\nSmudge-free ink\nApproved for semester exams"}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions-bar">
            <button type="submit" className="btn-admin-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving to MongoDB...' : 'Publish Product to Store'}</span>
            </button>
          </div>
        </form>

        {/* Right: Live Storefront Card Preview */}
        <div className="admin-preview-col">
          <div className="preview-label-heading">
            <PlusSquare size={15} />
            <span>Live Student Storefront Preview</span>
          </div>

          <div className="product-card">
            <div className="product-image-wrap">
              <img
                src={formData.image || SAMPLE_IMAGES[0].url}
                alt="Preview"
                className="product-img"
              />
              {formData.badge && (
                <span className="product-badge-tag">{formData.badge}</span>
              )}
              <span className="product-category-chip">{formData.category}</span>
            </div>

            <div className="product-body">
              <h3 className="product-title">
                {formData.name || 'Your New Stationery Product'}
              </h3>
              <p className="product-desc-snippet">
                {formData.description ||
                  'Product description will appear here for students browsing the catalog.'}
              </p>

              <div className="product-rating-row">
                <div className="rating-pill">
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span>4.6</span>
                </div>
                <span className="reviews-text">(New)</span>
                <span className="stock-pill">
                  {Number(formData.stock || 0) > 0
                    ? `${formData.stock} available`
                    : 'Out of stock'}
                </span>
              </div>

              <div className="product-footer-row">
                <div className="price-stack">
                  <span className="current-price">₹{formData.price || 0}</span>
                  {Number(formData.originalPrice) > Number(formData.price) && (
                    <span className="original-price">₹{formData.originalPrice}</span>
                  )}
                </div>
                <button type="button" className="btn-add-cart" disabled>
                  <ShoppingBag size={15} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
