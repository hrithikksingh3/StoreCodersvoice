const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true, match: [/^\S+@\S+\.\S+$/, 'A valid admin email is required'] },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, default: 'admin', enum: ['admin'] },
  name: { type: String, trim: true, maxlength: 100 },
  sessionVersion: { type: Number, default: 0 },
  lastLoginAt: Date
}, { timestamps: true });
adminSchema.methods.verifyPassword = function(password) { return bcrypt.compare(password, this.passwordHash); };
module.exports = mongoose.model('Admin', adminSchema);
