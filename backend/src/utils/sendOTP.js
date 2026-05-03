const crypto = require('crypto');
const { sendOTPEmail, sendPasswordResetEmail } = require('../config/nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendVerificationOTP = async (user) => {
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });
  await sendOTPEmail(user.email, otp, user.fullName);
  return otp;
};

exports.sendPasswordOTP = async (user) => {
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  await sendPasswordResetEmail(user.email, otp, user.fullName);
};
