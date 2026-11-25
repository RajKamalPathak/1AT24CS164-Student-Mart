const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllStudents,
  deleteStudentAccount,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllStudents);
router.delete('/users/:id', protect, adminOnly, deleteStudentAccount);

module.exports = router;
