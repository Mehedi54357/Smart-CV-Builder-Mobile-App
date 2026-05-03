const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"SmartCV Builder Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code — SmartCV Builder Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 12px;">
        <div style="background: #0F2044; padding: 24px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SmartCV Builder Pro</h1>
        </div>
        <h2 style="color: #1e293b;">Hello, ${name}!</h2>
        <p style="color: #475569;">Your one-time verification code is:</p>
        <div style="background: #1e3a8a; color: #ffffff; font-size: 36px; font-weight: 900; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #475569;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"SmartCV Builder Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP — SmartCV Builder Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name}, your password reset OTP is:</p>
        <div style="background: #0F2044; color: #fff; font-size: 32px; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 10px;">${otp}</div>
        <p>Valid for 10 minutes only.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
