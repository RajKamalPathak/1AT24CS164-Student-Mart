import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Award,
  ArrowRight,
  BookOpen,
  PenTool,
  Cpu,
  FlaskConical,
  Palette,
  Lamp,
  Star,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products');
        // Pick 4 top-rated items for homepage
        const top = res.data.slice(0, 4);
        setFeaturedProducts(top);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      name: 'Notebooks & Paper',
      desc: 'Spiral registers, project files & A4 sheets',
      icon: BookOpen,
      count: '30+ items',
      color: '#2563eb',
    },
    {
      name: 'Writing & Pens',
      desc: 'Gel pens, highlighters & fine liners',
      icon: PenTool,
      count: '45+ items',
      color: '#0891b2',
    },
    {
      name: 'Calculators & Tech',
      desc: 'Casio scientific calculators & OTG drives',
      icon: Cpu,
      count: '15+ items',
      color: '#7c3aed',
    },
    {
      name: 'Lab & Engineering',
      desc: 'Cotton lab coats, drafting tools & sets',
      icon: FlaskConical,
      count: '20+ items',
      color: '#059669',
    },
    {
      name: 'Art & Drafting',
      desc: 'Geometry boxes, scales & technical sheets',
      icon: Palette,
      count: '25+ items',
      color: '#d97706',
    },
    {
      name: 'Study & Dorm',
      desc: 'Desk lamps, laptop stands & bottles',
      icon: Lamp,
      count: '18+ items',
      color: '#dc2626',
    },
  ];

  return (
    <div className="home-page-container">
      {/* College Mart Hero Banner */}
      <section className="campus-hero-card">
        <div className="hero-content">
          <div className="hero-badge-pill">
            <Award size={14} />
            <span>Official Campus Student Mart</span>
          </div>
          <h1 className="hero-heading">
            Everything You Need For Your College Semester, Delivered To Your Dorm.
          </h1>
          <p className="hero-subtext">
            From Casio scientific calculators and Classmate spiral notebooks to 100% pure cotton lab aprons
            and midnight study lamps — quality academic supplies at student-discounted rates.
          </p>
          <div className="hero-cta-group">
            <Link to="/products" className="btn-hero-primary">
              <ShoppingBag size={18} />
              <span>Browse All Stationery</span>
            </Link>
            <Link to="/account?tab=cards" className="btn-hero-secondary">
              <CreditCard size={18} />
              <span>Manage Student Cards</span>
            </Link>
          </div>
          <div className="hero-highlights">
            <div className="highlight-item">
              <CheckCircle2 size={16} className="highlight-check" />
              <span>Same-day Hostel Delivery</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={16} className="highlight-check" />
              <span>Teacher & Exam Approved Gear</span>
            </div>
            <div className="highlight-item">
              <CheckCircle2 size={16} className="highlight-check" />
              <span>Real-Time MongoDB Backend</span>
            </div>
          </div>
        </div>
      </section>

      {/* College Category Grid */}
      <section className="section-block">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Shop by Academic Category</h2>
            <p className="section-subtitle">
              Organized supplies tailored for lectures, lab practicals, exams, and dorm living.
            </p>
          </div>
          <Link to="/products" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <div
                  className="cat-icon-bubble"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <IconComponent size={24} />
                </div>
                <div className="cat-details">
                  <h3 className="cat-title">{cat.name}</h3>
                  <p className="cat-desc">{cat.desc}</p>
                </div>
                <span className="cat-count-badge">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Semester Essentials */}
      <section className="section-block">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Featured Semester Bestsellers</h2>
            <p className="section-subtitle">
              Most requested supplies by engineering, science, and arts students this month.
            </p>
          </div>
          <Link to="/products" className="view-all-link">
            <span>See Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Loading student essentials from MongoDB...</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="product-badge-tag">{product.badge}</span>
                  )}
                  <span className="product-category-chip">{product.category}</span>
                </div>

                <div className="product-body">
                  <h3 className="product-title" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="product-desc-snippet">{product.description}</p>

                  <div className="product-rating-row">
                    <div className="rating-pill">
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="reviews-text">({product.numReviews} reviews)</span>
                    <span className="stock-pill">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="product-footer-row">
                    <div className="price-stack">
                      <span className="current-price">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <button
                      className="btn-add-cart"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingBag size={15} />
                      <span>{product.stock > 0 ? 'Add' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Campus Facilities Banner */}
      <section className="campus-perks-banner">
        <div className="perk-banner-item">
          <Truck className="perk-banner-icon" size={28} />
          <div>
            <h4>Hostel & Campus Delivery</h4>
            <p>Direct to room delivery in 2-4 hours during campus hours.</p>
          </div>
        </div>
        <div className="perk-banner-item">
          <CreditCard className="perk-banner-icon" size={28} />
          <div>
            <h4>Saved Cards & Student Accounts</h4>
            <p>Save multiple credit/debit cards safely for quick checkout.</p>
          </div>
        </div>
        <div className="perk-banner-item">
          <ShieldCheck className="perk-banner-icon" size={28} />
          <div>
            <h4>Exam Board Approved</h4>
            <p>Genuine Casio, Classmate & lab gear verified for syllabus practicals.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
