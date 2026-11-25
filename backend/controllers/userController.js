const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Update user profile details (full name, student ID, department, phone, hostel address)
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.studentId = req.body.studentId !== undefined ? req.body.studentId : user.studentId;
    user.department = req.body.department !== undefined ? req.body.department : user.department;
    user.hostelAddress = req.body.hostelAddress !== undefined ? req.body.hostelAddress : user.hostelAddress;

    // Email update check if provided
    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email address is already in use' });
      }
      user.email = req.body.email.toLowerCase();
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      studentId: updatedUser.studentId,
      department: updatedUser.department,
      phone: updatedUser.phone,
      hostelAddress: updatedUser.hostelAddress,
      role: updatedUser.role,
      message: 'Profile updated successfully in MongoDB!',
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    // Set new password (the pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('[Change Password Error]', error);
    res.status(500).json({ message: error.message || 'Error changing password' });
  }
};

module.exports = {
  updateUserProfile,
  changePassword,
};
