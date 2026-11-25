import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusSquare,
  Edit3,
  Trash2,
  X,
  Save,
  Package,
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        search ? `/products?search=${encodeURIComponent(search)}` : '/products'
      );
      setProducts(res.data);
    } catch (err) {
      addToast(err.message || 'Error loading inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `Delete "${product.name}" permanently from MongoDB Student Mart catalog?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${product._id}`);
      addToast(`Deleted "${product.name}" from MongoDB`, 'info');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      addToast(err.message || 'Error deleting product', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.put(`/products/${editingProduct._id}`, {
        name: editingProduct.name,
        category: editingProduct.category,
        brand: editingProduct.brand,
        price: Number(editingProduct.price),
        originalPrice: Number(editingProduct.originalPrice),
        stock: Number(editingProduct.stock),
        badge: editingProduct.badge,
        image: editingProduct.image,
        description: editingProduct.description,
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === res.data._id ? res.data : p))
      );
      addToast(`Updated "${res.data.name}" in MongoDB!`, 'success');
      setEditingProduct(null);
    } catch (err) {
      addToast(err.message || 'Failed to update product', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="admin-products-page">
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Inventory & Catalog Manager</h1>
          <p className="page-subtitle">
            Manage all {products.length} products stored in MongoDB <code>products</code> collection.
          </p>
        </div>

        <div className="admin-header-actions">
          <div className="search-input-wrapper">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Filter inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/admin/add-product" className="btn-admin-primary">
            <PlusSquare size={17} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-state-box">
          <div className="spinner"></div>
          <p>Loading MongoDB inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-results-box">
          <Package size={44} className="empty-icon" />
          <h3>No products found</h3>
          <p>Add new student stationery items to populate your store catalog.</p>
          <Link to="/admin/add-product" className="btn-admin-primary">
            <PlusSquare size={16} />
            <span>Add First Product</span>
          </Link>
        </div>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Badge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="table-thumb"
                        />
                        <div>
                          <div className="table-product-name">{product.name}</div>
                          <div className="table-product-brand">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="table-cat-pill">{product.category}</span>
                    </td>
                    <td>
                      <strong>₹{product.price}</strong>
                      {product.originalPrice > product.price && (
                        <span className="table-mrp">₹{product.originalPrice}</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`stock-pill ${
                          product.stock <= 5 ? 'stock-low' : ''
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td>
                      <span className="table-badge-label">{product.badge}</span>
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          className="btn-table-edit"
                          onClick={() => setEditingProduct({ ...product })}
                          title="Edit product"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="btn-table-delete"
                          onClick={() => handleDelete(product)}
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div
            className="modal-content product-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setEditingProduct(null)}
            >
              <X size={20} />
            </button>
            <h2 className="modal-title" style={{ marginBottom: '1.25rem' }}>
              Edit Product Details
            </h2>

            <form onSubmit={handleEditSubmit}>
              <div className="form-fields-grid">
                <div className="form-group col-span-2">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brand: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Original MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Badge</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, badge: e.target.value })
                    }
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.image || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions-bar">
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={savingEdit}
                >
                  <Save size={16} />
                  <span>{savingEdit ? 'Updating...' : 'Save Changes to MongoDB'}</span>
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
