// User model
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
