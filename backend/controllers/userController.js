const User = require('../models/User')
const path = require('path')
const bcrypt = require('bcryptjs')

// Get current user's profile (expects auth middleware to set req.user)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Update profile (name, avatar, remove avatar)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });
    let update = {};
    let options = { new: true };
    if (req.body.name) update.name = req.body.name;
    if (req.body.removeAvatar === '1') {
      // Use $unset to remove the avatar field
      update = { ...update, $unset: { avatar: 1 } };
      options = { ...options, fields: { password: 0 } };
    } else if (req.file) {
      update.avatar = '/' + path.join(req.file.destination, req.file.filename).replace(/\\/g, '/');
    }
    const user = await User.findByIdAndUpdate(userId, update, options).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ msg: 'Email required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ msg: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body
    if (!email || !newPassword) return res.status(400).json({ msg: 'Email and new password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ msg: 'User not found' })
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    user.password = hashedPassword
    await user.save()
    res.json({ msg: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message })
  }
}
