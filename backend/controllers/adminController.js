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

// @desc    Admin: Delete a customer (student) account and their saved cards
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteStudentAccount = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'Customer account not found' });
    }

    if (targetUser.role === 'admin' || targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Administrator accounts cannot be deleted from here',
      });
    }

    // Remove saved cards belonging to this customer
    await Card.deleteMany({ user: targetUser._id });
    await targetUser.deleteOne();

    res.json({
      message: `Customer account (${targetUser.email}) deleted from MongoDB`,
    });
  } catch (error) {
    console.error('[Admin Delete User Error]', error);
    res.status(500).json({ message: error.message || 'Error deleting customer account' });
  }
};

module.exports = {
  getAdminStats,
  getAllStudents,
  deleteStudentAccount,
};
