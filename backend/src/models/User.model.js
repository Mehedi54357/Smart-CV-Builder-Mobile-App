const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, unique: true, trim: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  profilePhoto: { type: String, default: null },
  isVerified:   { type: Boolean, default: false },
  otp:          { type: String, select: false },
  otpExpiry:    { type: Date, select: false },
  plan:         { type: String, enum: ['free', 'premium'], default: 'free' },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
