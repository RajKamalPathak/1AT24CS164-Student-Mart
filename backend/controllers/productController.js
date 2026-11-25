const Product = require('../models/Product');

// @desc    Fetch all products with optional filters, search, and sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, sort, maxPrice } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    let sortOptions = {};
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOptions);
    res.json(products);
  } catch (error) {
    console.error('[Get Products Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found in Student Mart' });
    }
  } catch (error) {
    console.error('[Get Product By ID Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching product' });
  }
};

// @desc    Get product categories with counts
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(categories);
  } catch (error) {
    console.error('[Get Categories Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
};
