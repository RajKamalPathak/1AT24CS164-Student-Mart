import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Check,
  X,
  Sparkles,
  Info,
  BookOpen,
  PenTool,
  Cpu,
  FlaskConical,
  Palette,
  Lamp,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORY_ORDER = [
  { name: 'Notebooks & Paper', icon: BookOpen, color: '#2563eb' },
  { name: 'Writing & Pens', icon: PenTool, color: '#0891b2' },
  { name: 'Calculators & Tech', icon: Cpu, color: '#7c3aed' },
  { name: 'Lab & Engineering', icon: FlaskConical, color: '#059669' },
  { name: 'Art & Drafting', icon: Palette, color: '#d97706' },
  { name: 'Study & Dorm', icon: Lamp, color: '#dc2626' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();

  const categories = ['All', ...CATEGORY_ORDER.map((c) => c.name)];

  // Sync category state if URL param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products?`;
        if (category && category !== 'All') {
          url += `category=${encodeURIComponent(category)}&`;
        }
        if (search) {
          url += `search=${encodeURIComponent(search)}&`;
        }
        if (sort === 'price-asc') {
          url += `sort=price-asc&`;
        } else if (sort === 'price-desc') {
          url += `sort=price-desc&`;
        } else if (sort === 'rating') {
          url += `sort=rating&`;
        }

        const res = await api.get(url);
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 200);
    return () => clearTimeout(debounceTimer);
  }, [category, search, sort]);

  // Group products into sorted category sections for the Customer POV
  const groupedSections = useMemo(() => {
    const sections = [];
    const knownNames = new Set(CATEGORY_ORDER.map((c) => c.name));

    for (const catMeta of CATEGORY_ORDER) {
      const items = products.filter((p) => p.category === catMeta.name);
      if (items.length > 0) {
        sections.push({
          ...catMeta,
          items,
        });
      }
    }

    // Fallback for any custom categories
    const extraCategories = [...new Set(products.map((p) => p.category))].filter(
      (name) => !knownNames.has(name)
    );
    for (const extraName of extraCategories) {
      const items = products.filter((p) => p.category === extraName);
      if (items.length > 0) {
        sections.push({
          name: extraName,
          icon: ShoppingBag,
          color: '#334155',
          items,
        });
      }
    }

    return sections;
  }, [products]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: newCat });
    }
  };

  return (
    <div className="products-page-container">
      {/* Header and Controls */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Stationery &amp; Academic Supplies</h1>
          <p className="page-subtitle">
            Organized by academic category — notebooks, calculators, lab gear, and dorm utilities.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Casio, notebooks, lab coats, pens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="filter-sort-toolbar">
        <div className="category-pills-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort-box">
          <SlidersHorizontal size={15} />
          <label htmlFor="sort-select" className="sr-only">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sort-select"
          >
            <option value="featured">Sort: Category &amp; Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Results Counter */}
      <div className="results-count-bar">
        <span>
          Showing <strong>{products.length}</strong> items across{' '}
          <strong>{groupedSections.length}</strong>{' '}
          {groupedSections.length === 1 ? 'category' : 'categories'}
          {search ? ` matching "${search}"` : ''}
        </span>
        {(category !== 'All' || search) && (
          <button
            className="btn-clear-filters"
            onClick={() => {
              setCategory('All');
              setSearch('');
              searchParams.delete('category');
              setSearchParams(searchParams);
            }}
          >
            Show All Categories
          </button>
        )}
      </div>

      {/* Category-Sorted Product Sections */}
      {loading ? (
        <div className="loading-state-box">
          <div className="spinner"></div>
          <p>Querying products from MongoDB...</p>
        </div>
      ) : groupedSections.length === 0 ? (
        <div className="empty-results-box">
          <ShoppingBag size={48} className="empty-icon" />
          <h3>No products found</h3>
          <p>We couldn't find any stationery matching your search criteria.</p>
          <button
            className="btn-reset"
            onClick={() => {
              setCategory('All');
              setSearch('');
              searchParams.delete('category');
              setSearchParams(searchParams);
            }}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="category-sections-stack">
          {groupedSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <section key={section.name} className="category-section-block">
                <div className="category-section-header">
                  <div className="category-section-title-group">
                    <div
                      className="cat-section-icon"
                      style={{
                        backgroundColor: `${section.color}15`,
                        color: section.color,
                      }}
                    >
                      <IconComponent size={19} />
                    </div>
                    <h2 className="category-section-title">{section.name}</h2>
                    <span className="category-section-count">
                      {section.items.length}{' '}
                      {section.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {category === 'All' && (
                    <button
                      type="button"
                      className="btn-clear-filters"
                      onClick={() => handleCategoryChange(section.name)}
                    >
                      Filter only {section.name}
                    </button>
                  )}
                </div>

                <div className="products-grid">
                  {section.items.map((product) => (
                    <div key={product._id} className="product-card">
                      <div
                        className="product-image-wrap clickable"
                        onClick={() => setSelectedProduct(product)}
                        title="Click to view details"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-img"
                          loading="lazy"
                        />
                        {product.badge && (
                          <span className="product-badge-tag">{product.badge}</span>
                        )}
                        <span className="product-category-chip">
                          {product.category}
                        </span>
                      </div>

                      <div className="product-body">
                        <h3
                          className="product-title clickable"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="product-desc-snippet">
                          {product.description}
                        </p>

                        <div className="product-rating-row">
                          <div className="rating-pill">
                            <Star size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>{product.rating}</span>
                          </div>
                          <span className="reviews-text">
                            ({product.numReviews})
                          </span>
                          <span
                            className={`stock-pill ${
                              product.stock <= 5 ? 'stock-low' : ''
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} available`
                              : 'Out of stock'}
                          </span>
                        </div>

                        <div className="product-footer-row">
                          <div className="price-stack">
                            <span className="current-price">
                              ₹{product.price}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="original-price">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="product-btn-group">
                            <button
                              className="btn-info-quick"
                              onClick={() => setSelectedProduct(product)}
                              title="View specifications"
                              aria-label="View specifications"
                            >
                              <Info size={16} />
                            </button>
                            <button
                              className="btn-add-cart"
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                            >
                              <ShoppingBag size={15} />
                              <span>
                                {product.stock > 0 ? 'Add' : 'Sold Out'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="modal-content product-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="modal-grid">
              <div className="modal-image-col">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="modal-product-img"
                />
                {selectedProduct.badge && (
                  <span className="modal-badge-pill">
                    <Sparkles size={13} />
                    <span>{selectedProduct.badge}</span>
                  </span>
                )}
              </div>

              <div className="modal-info-col">
                <div className="modal-category-label">
                  {selectedProduct.category} • {selectedProduct.brand}
                </div>
                <h2 className="modal-title">{selectedProduct.name}</h2>

                <div className="modal-rating-row">
                  <div className="rating-pill">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{selectedProduct.rating}</span>
                  </div>
                  <span className="modal-reviews-count">
                    {selectedProduct.numReviews} Verified Student Reviews
                  </span>
                </div>

                <div className="modal-pricing-box">
                  <div className="modal-price-stack">
                    <span className="modal-price">
                      ₹{selectedProduct.price}
                    </span>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="modal-original-price">
                        ₹{selectedProduct.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="modal-tax-note">
                    Includes all college store taxes
                  </span>
                </div>

                <p className="modal-description">
                  {selectedProduct.description}
                </p>

                {selectedProduct.features &&
                  selectedProduct.features.length > 0 && (
                    <div className="modal-features-list">
                      <h4>Key Product Highlights:</h4>
                      <ul>
                        {selectedProduct.features.map((feat, idx) => (
                          <li key={idx}>
                            <Check size={14} className="feature-check-icon" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="modal-stock-status">
                  <strong>Stock in Student Mart: </strong>
                  {selectedProduct.stock > 0 ? (
                    <span className="in-stock-text">
                      ✓ {selectedProduct.stock} units available for instant
                      dispatch
                    </span>
                  ) : (
                    <span className="out-of-stock-text">
                      Temporarily Sold Out
                    </span>
                  )}
                </div>

                <div className="modal-actions-row">
                  <button
                    className="modal-btn-add"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingBag size={18} />
                    <span>Add to My Cart</span>
                  </button>
                  <button
                    className="modal-btn-cancel"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
