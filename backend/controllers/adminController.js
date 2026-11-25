const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Card = require('../models/Card');

// @desc    Admin: Get store overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalProducts, lowStockProducts, totalStudents, totalOrders, totalCards, orders] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ stock: { $lte: 5 } }),
        User.countDocuments({ role: 'student' }),
        Order.countDocuments(),
        Card.countDocuments(),
        Order.find({}).select('totalAmount orderStatus createdAt'),
      ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter((o) => o.orderStatus !== 'Delivered').length;

    res.json({
      totalProducts,
      lowStockProducts,
      totalStudents,
      totalOrders,
      pendingOrders,
      totalCards,
      totalRevenue,
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching admin statistics' });
  }
};

// @desc    Admin: Get all registered students
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('[Admin Get Users Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching users list' });
  }
};

module.exports = {
  getAdminStats,
  getAllStudents,
};
