const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cardHolder: {
      type: String,
      required: [true, 'Cardholder name is required'],
      trim: true,
    },
    cardNumber: {
      type: String,
      required: [true, 'Card number is required'],
      trim: true,
    },
    last4: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: String,
      required: [true, 'Expiry month is required'],
      match: [/^(0[1-9]|1[0-2])$/, 'Please provide a valid 2-digit month (01-12)'],
    },
    expiryYear: {
      type: String,
      required: [true, 'Expiry year is required'],
      match: [/^\d{2,4}$/, 'Please provide a valid year (YY or YYYY)'],
    },
    cardType: {
      type: String,
      enum: ['Visa', 'Mastercard', 'RuPay', 'American Express', 'Discover', 'Debit / Credit'],
      default: 'Visa',
    },
    cardNickname: {
      type: String,
      default: 'College Expense Card',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
