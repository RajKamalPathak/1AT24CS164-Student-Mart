const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      studentId: { type: String, default: '' },
      phone: { type: String, required: true },
      hostelRoom: { type: String, required: true },
      department: { type: String, default: '' },
      deliveryNotes: { type: String, default: '' },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Credit Card',
    },
    paymentDetails: {
      cardLast4: { type: String, default: '' },
      cardHolder: { type: String, default: '' },
      cardType: { type: String, default: 'Visa' },
      status: { type: String, default: 'Authorized' },
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    orderStatus: {
      type: String,
      enum: ['Order Placed', 'Packed at Student Mart', 'Out for Campus Delivery', 'Delivered'],
      default: 'Order Placed',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
