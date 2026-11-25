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

// @desc    Admin: Create a new product in Student Mart
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      image,
      features,
      badge,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: 'Please provide product name, description, price, and category',
      });
    }

    const parsedStock = stock !== undefined ? Number(stock) : 25;
    const parsedPrice = Number(price);
    const parsedOriginal = originalPrice
      ? Number(originalPrice)
      : Math.round(parsedPrice * 1.25);

    const parsedFeatures = Array.isArray(features)
      ? features.filter(Boolean)
      : typeof features === 'string'
      ? features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean)
      : [];

    const fallbackImage =
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80';

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      originalPrice: parsedOriginal,
      category,
      brand: brand ? brand.trim() : 'Campus Essentials',
      stock: parsedStock,
      image: image && image.trim() ? image.trim() : fallbackImage,
      features: parsedFeatures,
      badge: badge ? badge.trim() : 'New Arrival',
      inStock: parsedStock > 0,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('[Create Product Error]', error);
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
};

// @desc    Admin: Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      image,
      features,
      badge,
    } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand.trim();
    if (stock !== undefined) {
      product.stock = Number(stock);
      product.inStock = Number(stock) > 0;
    }
    if (image !== undefined && image.trim()) product.image = image.trim();
    if (badge !== undefined) product.badge = badge.trim();
    if (features !== undefined) {
      product.features = Array.isArray(features)
        ? features.filter(Boolean)
        : typeof features === 'string'
        ? features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean)
        : product.features;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('[Update Product Error]', error);
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
};

// @desc    Admin: Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted from Student Mart inventory' });
  } catch (error) {
    console.error('[Delete Product Error]', error);
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
