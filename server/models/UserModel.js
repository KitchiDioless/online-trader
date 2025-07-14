const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false }, 
  role: { type: String, enum: ['buyer', 'master', 'admin'], default: 'buyer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);