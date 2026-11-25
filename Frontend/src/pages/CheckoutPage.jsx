import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  CreditCard,
  Building,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  PlusCircle,
  Database,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, itemsPrice, deliveryFee, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const discountAmount = location.state?.discountAmount || 0;
  const totalAmount = Math.max(0, itemsPrice - discountAmount + deliveryFee);

  // Delivery details form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    studentId: user?.studentId || '',
    phone: user?.phone || '',
    department: user?.department || '',
    hostelRoom: user?.hostelAddress || '',
    deliveryNotes: '',
  });

  // Saved cards from MongoDB
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');

  // Payment method selection: 'saved-card' | 'new-card' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('saved-card');

  // New card form state
  const [newCard, setNewCard] = useState({
    cardHolder: user?.name || '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardNickname: 'My Campus Card',
    saveCard: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // Sync address if user logs in or profile changes
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        studentId: prev.studentId || user.studentId || '',
        phone: prev.phone || user.phone || '',
        department: prev.department || user.department || '',
        hostelRoom: prev.hostelRoom || user.hostelAddress || '',
      }));
    }
  }, [user]);

  // Load saved cards from MongoDB for this student
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCards = async () => {
        setLoadingCards(true);
        try {
          const res = await api.get('/cards');
          setSavedCards(res.data);
          if (res.data.length > 0) {
            const defaultCard = res.data.find((c) => c.isDefault) || res.data[0];
            setSelectedCardId(defaultCard._id);
            setPaymentMethod('saved-card');
          } else {
            setPaymentMethod('new-card');
          }
        } catch (err) {
          console.error('Error fetching cards:', err);
          setPaymentMethod('new-card');
        } finally {
          setLoadingCards(false);
        }
      };
      fetchCards();
    } else {
      setPaymentMethod('new-card');
    }
  }, [isAuthenticated]);

  // Handle format of card number (spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNewCard({ ...newCard, cardNumber: formatted });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please login to place an order and save your records in MongoDB', 'info');
      navigate('/login?redirect=checkout');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.hostelRoom) {
      addToast('Please fill in complete delivery details (Name, Phone, Hostel/Room)', 'error');
      return;
    }

    let paymentDetails = {};

    let cardSaved = false;

    if (paymentMethod === 'saved-card') {
      const card = savedCards.find((c) => c._id === selectedCardId);
      if (!card) {
        addToast('Please select a saved card or enter new card details', 'error');
        return;
      }
      paymentDetails = {
        cardLast4: card.last4,
        cardHolder: card.cardHolder,
        cardType: card.cardType,
        status: 'Authorized via MongoDB Saved Card',
      };
    } else if (paymentMethod === 'new-card') {
      const cleanNum = newCard.cardNumber.replace(/\D/g, '');
      if (cleanNum.length < 13 || cleanNum.length > 16) {
        addToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
      if (!newCard.expiryMonth || !newCard.expiryYear) {
        addToast('Please enter valid expiry month and year', 'error');
        return;
      }
      if (!newCard.cvv || newCard.cvv.length < 3) {
        addToast('Please enter a 3 or 4-digit CVV', 'error');
        return;
      }

      paymentDetails = {
        cardLast4: cleanNum.slice(-4),
        cardHolder: newCard.cardHolder,
        cardType: cleanNum.startsWith('4') ? 'Visa' : 'Mastercard',
        status: 'Authorized',
      };

      // If user requested to save new card, call MongoDB API silently (single order toast shown below)
      if (newCard.saveCard) {
        try {
          await api.post('/cards', {
            cardHolder: newCard.cardHolder,
            cardNumber: newCard.cardNumber,
            expiryMonth: newCard.expiryMonth,
            expiryYear: newCard.expiryYear,
            cardNickname: newCard.cardNickname || 'College Checkout Card',
            isDefault: savedCards.length === 0,
          });
          cardSaved = true;
        } catch (err) {
          console.warn('Could not auto-save card:', err.message);
        }
      }
    } else {
      paymentDetails = {
        cardLast4: 'COD',
        cardHolder: shippingAddress.fullName,
        cardType: 'Cash on Campus Delivery',
        status: 'Payment on Handover',
      };
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        shippingAddress,
        paymentMethod:
          paymentMethod === 'cod'
            ? 'Cash on Campus Delivery'
            : paymentMethod === 'saved-card'
            ? 'Saved Credit Card'
            : 'New Credit / Debit Card',
        paymentDetails,
        itemsPrice,
        deliveryFee,
        discount: discountAmount,
        totalAmount,
      };

      const res = await api.post('/orders', orderPayload);
      clearCart();
      addToast(
        cardSaved
          ? 'Order placed & card saved in MongoDB!'
          : 'Order placed successfully & saved in MongoDB!',
        'success'
      );
      navigate('/orders', { state: { newOrderPlaced: true, orderId: res.data._id } });
    } catch (err) {
      addToast(err.message || 'Error processing your order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-empty">
        <div className="empty-cart-card">
          <h2>No Items to Checkout</h2>
          <p>Your cart is empty. Please add stationery items before checking out.</p>
          <Link to="/products" className="btn-browse-mart">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-top-nav">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>
        <div className="db-sync-badge">
          <Database size={13} />
          <span>MongoDB Transaction Safe</span>
        </div>
      </div>

      <div className="checkout-header">
        <h1 className="page-title">Campus Delivery & Payment</h1>
        <p className="page-subtitle">
          Confirm your hostel delivery address and select your payment method.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="checkout-form-grid">
        {/* Left Column: Address & Payment */}
        <div className="checkout-main-col">
          {/* Section 1: Hostel Delivery Address */}
          <div className="checkout-card">
            <div className="card-section-title">
              <Building size={18} className="title-icon" />
              <div>
                <h3>Hostel & Campus Delivery Location</h3>
                <p>Orders are delivered directly to your hostel room or department lobby.</p>
              </div>
            </div>

            <div className="form-fields-grid">
              <div className="form-group col-span-2">
                <label>Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Student Roll / ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. 2024CS089"
                  value={shippingAddress.studentId}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, studentId: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-group col-span-2">
                <label>Hostel Block & Room / Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hostel 3 (Aravali), Room 214, North Campus"
                  value={shippingAddress.hostelRoom}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, hostelRoom: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Department / Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science / Mechanical"
                  value={shippingAddress.department}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, department: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call before coming; leave at reception"
                  value={shippingAddress.deliveryNotes}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      deliveryNotes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 2: Credit Card & Payment Options */}
          <div className="checkout-card">
            <div className="card-section-title">
              <CreditCard size={18} className="title-icon" />
              <div>
                <h3>Credit Card & Payment Method</h3>
                <p>Saved in MongoDB `cards` collection for your student profile.</p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="payment-tabs-row">
              {savedCards.length > 0 && (
                <button
                  type="button"
                  className={`payment-tab-btn ${
                    paymentMethod === 'saved-card' ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod('saved-card')}
                >
                  <CreditCard size={16} />
                  <span>Saved Cards ({savedCards.length})</span>
                </button>
              )}

              <button
                type="button"
                className={`payment-tab-btn ${
                  paymentMethod === 'new-card' ? 'active' : ''
                }`}
                onClick={() => setPaymentMethod('new-card')}
              >
                <PlusCircle size={16} />
                <span>Pay with New Card</span>
              </button>

              <button
                type="button"
                className={`payment-tab-btn ${
                  paymentMethod === 'cod' ? 'active' : ''
                }`}
                onClick={() => setPaymentMethod('cod')}
              >
                <Banknote size={16} />
                <span>Cash on Campus Drop</span>
              </button>
            </div>

            {/* Tab A: Saved Cards from MongoDB */}
            {paymentMethod === 'saved-card' && savedCards.length > 0 && (
              <div className="saved-cards-selection">
                <label className="section-micro-label">
                  Choose a saved card stored in your MongoDB account:
                </label>
                <div className="cards-radio-grid">
                  {savedCards.map((card) => (
                    <div
                      key={card._id}
                      className={`card-select-box ${
                        selectedCardId === card._id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedCardId(card._id)}
                    >
                      <div className="card-select-top">
                        <span className="card-badge-type">{card.cardType}</span>
                        {card.isDefault && (
                          <span className="card-default-pill">Default Card</span>
                        )}
                      </div>
                      <div className="card-number-display">{card.cardNumber}</div>
                      <div className="card-meta-row">
                        <span>{card.cardHolder}</span>
                        <span>
                          Exp: {card.expiryMonth}/{card.expiryYear}
                        </span>
                      </div>
                      <div className="card-nickname-tag">{card.cardNickname}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab B: New Card Input */}
            {paymentMethod === 'new-card' && (
              <div className="new-card-form-box">
                {/* Visual card mockup */}
                <div className="visual-card-preview">
                  <div className="visual-card-inner">
                    <div className="visual-card-header">
                      <span className="visual-chip"></span>
                      <span className="visual-brand">
                        {newCard.cardNumber.startsWith('4')
                          ? 'VISA'
                          : newCard.cardNumber.startsWith('5')
                          ? 'MASTERCARD'
                          : 'CAMPUS PAY'}
                      </span>
                    </div>
                    <div className="visual-card-number">
                      {newCard.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="visual-card-bottom">
                      <div>
                        <span className="visual-sub">CARD HOLDER</span>
                        <div className="visual-name">
                          {newCard.cardHolder || 'STUDENT NAME'}
                        </div>
                      </div>
                      <div>
                        <span className="visual-sub">EXPIRES</span>
                        <div className="visual-exp">
                          {newCard.expiryMonth && newCard.expiryYear
                            ? `${newCard.expiryMonth}/${newCard.expiryYear}`
                            : 'MM/YY'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-fields-grid" style={{ marginTop: '1rem' }}>
                  <div className="form-group col-span-2">
                    <label>Cardholder Name *</label>
                    <input
                      type="text"
                      required={paymentMethod === 'new-card'}
                      placeholder="Name as printed on card"
                      value={newCard.cardHolder}
                      onChange={(e) =>
                        setNewCard({ ...newCard, cardHolder: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label>Card Number (16 Digits) *</label>
                    <input
                      type="text"
                      required={paymentMethod === 'new-card'}
                      placeholder="4532 8900 1234 5678"
                      value={newCard.cardNumber}
                      onChange={handleCardNumberChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Month (MM) *</label>
                    <select
                      value={newCard.expiryMonth}
                      onChange={(e) =>
                        setNewCard({ ...newCard, expiryMonth: e.target.value })
                      }
                      required={paymentMethod === 'new-card'}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = (i + 1).toString().padStart(2, '0');
                        return (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Expiry Year (YY) *</label>
                    <select
                      value={newCard.expiryYear}
                      onChange={(e) =>
                        setNewCard({ ...newCard, expiryYear: e.target.value })
                      }
                      required={paymentMethod === 'new-card'}
                    >
                      <option value="">Year</option>
                      {['25', '26', '27', '28', '29', '30', '31', '32'].map(
                        (year) => (
                          <option key={year} value={year}>
                            20{year}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>CVV / CVC (3 Digits) *</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      required={paymentMethod === 'new-card'}
                      value={newCard.cvv}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          cvv: e.target.value.replace(/\D/g, ''),
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Nickname</label>
                    <input
                      type="text"
                      placeholder="e.g. My SBI Debit"
                      value={newCard.cardNickname}
                      onChange={(e) =>
                        setNewCard({ ...newCard, cardNickname: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newCard.saveCard}
                        onChange={(e) =>
                          setNewCard({ ...newCard, saveCard: e.target.checked })
                        }
                      />
                      <span>
                        Save this card to MongoDB for seamless future semester checkouts
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab C: Cash on Delivery */}
            {paymentMethod === 'cod' && (
              <div className="cod-info-box">
                <Truck size={24} className="cod-icon" />
                <div>
                  <h4>Cash on Hostel Drop / Store Counter Pickup</h4>
                  <p>
                    Pay cash directly to the student delivery representative when they
                    bring your stationery to your room. Please keep exact change ready.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="checkout-summary-col">
          <div className="summary-card checkout-review-box">
            <h3 className="summary-heading">Order Items ({cartItems.length})</h3>

            <div className="checkout-items-preview">
              {cartItems.map((item) => (
                <div key={item.product} className="checkout-item-line">
                  <img src={item.image} alt={item.name} />
                  <div className="item-meta">
                    <div className="item-title">{item.name}</div>
                    <div className="item-qty-price">
                      Qty: {item.qty} × ₹{item.price}
                    </div>
                  </div>
                  <div className="item-total">₹{item.qty * item.price}</div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line">
              <span>Items Total</span>
              <span>₹{itemsPrice}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-line discount-line">
                <span>Discount Applied</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="summary-line">
              <span>Campus Delivery</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-line">
              <span>Grand Total</span>
              <span className="grand-total">₹{totalAmount}</span>
            </div>

            <button
              type="submit"
              className="btn-checkout-primary btn-submit-order"
              disabled={submitting}
            >
              <Lock size={16} />
              <span>
                {submitting ? 'Connecting to MongoDB...' : `Place Order (₹${totalAmount})`}
              </span>
            </button>

            <div className="security-assurance">
              <ShieldCheck size={16} />
              <span>Safe 256-bit Student Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
