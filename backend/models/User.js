const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  
  iam: {
    type: String,
    enum: ['buyer', 'seller', 'renter', 'agent'],
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: /^\+1[2-9]\d{9}$/
  }
});
     module.exports = mongoose.model('User', userSchema);