const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: function () {
        return Math.round(this.price * 1.25);
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: [
        'Notebooks & Paper',
        'Writing & Pens',
        'Calculators & Tech',
        'Lab & Engineering',
        'Art & Drafting',
        'Study & Dorm',
      ],
      index: true,
    },
    brand: {
      type: String,
      default: 'Campus Essentials',
    },
    stock: {
      type: Number,
      default: 20,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.6,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 15,
    },
    image: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
    badge: {
      type: String,
      default: 'Student Special',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
