const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Help Desk OTP Verification Code',
      html: `
        <h2>Welcome to Help Desk!</h2>
        <p>Hi ${name},</p>
        <p>Your OTP verification code is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Help Desk System - BIC Nepal</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Verify transporter connection
exports.verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service connected successfully');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
};
