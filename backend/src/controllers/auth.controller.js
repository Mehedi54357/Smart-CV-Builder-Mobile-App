const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const { sendVerificationOTP, sendPasswordOTP } = require('../utils/sendOTP');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (await User.findOne({ $or: [{ email }, { phone }] }))
      return res.status(400).json({ success: false, message: 'Email or phone already registered.' });
    
    // Create verified user but don't log them in yet
    await User.create({ fullName, email, phone, password, isVerified: true });
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please login with your credentials.'
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (!user.isVerified)
      return res.status(403).json({ success: false, message: 'Account not verified. Check your email for OTP.' });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, plan: user.plan, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { otp, email, phone } = req.body;
    const user = await User.findOne({ $or: [{ email }, { phone }] }).select('+otp +otpExpiry');
    if (!user || user.otp !== otp || user.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    user.isVerified = true; user.otp = undefined; user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Account verified!', token, user: { id: user._id, fullName: user.fullName, email: user.email, plan: user.plan } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await sendVerificationOTP(user);
    res.json({ success: true, message: 'OTP sent!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await sendPasswordOTP(user);
    res.json({ success: true, message: 'Password reset OTP sent.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { emailOrPhone, otp, newPassword } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] }).select('+otp +otpExpiry');
    if (!user || user.otp !== otp || user.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    user.password = newPassword; user.otp = undefined; user.otpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/logout
exports.logout = (req, res) => res.json({ success: true, message: 'Logged out.' });
