const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) return res.status(400).json({ msg: 'All fields required' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ msg: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash, role })
    res.status(201).json({ msg: 'Registered successfully', user: { id: user._id, name, email, role } })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'Email does not exist' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ msg: 'Incorrect password' })
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}
