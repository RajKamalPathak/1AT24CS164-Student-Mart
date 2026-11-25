const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      itemsPrice,
      deliveryFee,
      discount,
      totalAmount,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.hostelRoom) {
      return res.status(400).json({ message: 'Please provide complete delivery details (Name, Phone, Hostel/Room)' });
    }

    // Verify and decrement stock for ordered items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock >= item.qty) {
          product.stock -= item.qty;
          if (product.stock === 0) {
            product.inStock = false;
          }
          await product.save();
        }
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      paymentDetails: paymentDetails || {},
      itemsPrice: Number(itemsPrice) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      totalAmount: Number(totalAmount) || 0,
      orderStatus: 'Order Placed',
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({ message: error.message || 'Error processing order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('[Get My Orders Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching student orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email studentId phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure order belongs to current user or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('[Get Order By ID Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching order details' });
  }
};

// @desc    Admin: Get all student orders across the campus
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email studentId department hostelAddress')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('[Get All Orders Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching all orders' });
  }
};

// @desc    Admin: Update order delivery status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = [
      'Order Placed',
      'Packed at Student Mart',
      'Out for Campus Delivery',
      'Delivered',
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('[Update Order Status Error]', error);
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
