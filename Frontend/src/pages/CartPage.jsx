import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function CartPage() {
  const {
    cartItems,
    totalItems,
    itemsPrice,
    deliveryFee,
    totalPrice,
    updateQty,
    removeFromCart,
    clearCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    if (promoCode.trim().toUpperCase() === 'SEMESTER10') {
      setDiscountPercent(10);
      addToast('Promo SEMESTER10 applied: 10% student discount added!', 'success');
    } else if (promoCode.trim().toUpperCase() === 'FREEDEL') {
      setDiscountPercent(5);
      addToast('Special campus code applied!', 'success');
    } else {
      addToast('Invalid promo code. Try "SEMESTER10"', 'error');
    }
  };

  const discountAmount = Math.round((itemsPrice * discountPercent) / 100);
  const finalPayable = Math.max(0, itemsPrice - discountAmount + deliveryFee);
  const freeDeliveryThreshold = 299;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - itemsPrice);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-empty">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Student Cart is Empty</h2>
          <p>
            You haven't added any stationery, calculators, or lab essentials yet.
            Browse our college catalog and pick what you need for this semester!
          </p>
          <Link to="/products" className="btn-browse-mart">
            <span>Browse Products</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-header-row">
        <div>
          <h1 className="page-title">My Student Cart</h1>
          <p className="page-subtitle">
            Review your academic items, adjust quantities, and proceed to checkout.
          </p>
        </div>
        <button
          className="btn-clear-cart"
          onClick={clearCart}
          title="Remove all items"
        >
          <Trash2 size={15} />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="free-delivery-banner">
        <Truck size={20} className="delivery-icon" />
        <div className="delivery-text-wrap">
          {remainingForFreeDelivery === 0 ? (
            <span className="unlocked-msg">
              <CheckCircle2 size={16} />
              <strong>Awesome!</strong> You've unlocked FREE Campus Hostel Delivery!
            </span>
          ) : (
            <span>
              Add <strong>₹{remainingForFreeDelivery}</strong> more of student essentials for{' '}
              <strong>FREE Campus Dorm Delivery</strong>!
            </span>
          )}
          <div className="delivery-progress-track">
            <div
              className="delivery-progress-fill"
              style={{
                width: `${Math.min(100, (itemsPrice / freeDeliveryThreshold) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="cart-layout-grid">
        {/* Items List */}
        <div className="cart-items-column">
          <div className="cart-items-card">
            <div className="cart-table-head">
              <span>Item ({totalItems})</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span>Action</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.product} className="cart-item-row">
                  <div className="cart-item-info">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-thumb"
                    />
                    <div>
                      <h4 className="cart-item-title">{item.name}</h4>
                      <span className="cart-item-cat">{item.category}</span>
                      <span className="cart-item-unit-price">₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="cart-col-price">
                    <strong>₹{item.price}</strong>
                  </div>

                  <div className="cart-col-qty">
                    <div className="qty-picker">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.product, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="qty-display">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.product, item.qty + 1)}
                        disabled={item.qty >= (item.stock || 99)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-col-subtotal">
                    <strong>₹{item.price * item.qty}</strong>
                  </div>

                  <div className="cart-col-action">
                    <button
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.product)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Promo */}
        <div className="cart-summary-column">
          {/* Promo Code Card */}
          <div className="summary-card promo-card">
            <div className="promo-header">
              <Tag size={17} />
              <span>Campus Discount Code</span>
            </div>
            <form onSubmit={handleApplyPromo} className="promo-input-row">
              <input
                type="text"
                placeholder="Try SEMESTER10"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
              />
              <button type="submit" className="btn-apply-promo">
                Apply
              </button>
            </form>
            {discountPercent > 0 && (
              <div className="promo-applied-badge">
                <CheckCircle2 size={14} />
                <span>{discountPercent}% Student Discount Applied!</span>
              </div>
            )}
          </div>

          {/* Checkout Breakdown Card */}
          <div className="summary-card checkout-breakdown-card">
            <h3 className="summary-heading">Order Summary</h3>

            <div className="summary-line">
              <span>Items Total ({totalItems} items)</span>
              <span>₹{itemsPrice}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-line discount-line">
                <span>Student Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="summary-line">
              <span>Campus Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="text-free">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-line">
              <span>Total Payable</span>
              <span className="grand-total">₹{finalPayable}</span>
            </div>

            <p className="summary-tax-note">
              Inclusive of GST and hostel drop fees
            </p>

            <button
              className="btn-checkout-primary"
              onClick={() => {
                navigate('/checkout', {
                  state: { discountAmount, finalPayable, promoCode },
                });
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="summary-guarantee">
              <ShieldCheck size={18} />
              <div>
                <strong>Student Guarantee</strong>
                <p>Faulty pens or damaged books exchanged within 48 hours at student counter.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
