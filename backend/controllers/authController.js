const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Level = require('../models/Level');
const { sendOTPEmail } = require('../utils/emailService');
require('dotenv').config();

// Signup - Generates OTP and sends to email
exports.signup = async (req, res) => {
  try {
    const { name, email, faculty, level, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !faculty || !level || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation (must be @bicnepal.edu.np)
    if (!email.toLowerCase().endsWith('@bicnepal.edu.np')) {
      return res.status(400).json({ error: 'Only BIC institutional emails are allowed' });
    }

    // Password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate faculty
    const validFaculty = await Faculty.getByName(faculty);
    if (!validFaculty) {
      return res.status(400).json({ error: 'Invalid faculty. Please select a valid faculty.' });
    }

    // Validate level
    const validLevel = await Level.getByName(level);
    if (!validLevel) {
      return res.status(400).json({ error: 'Invalid level. Please select a valid level.' });
    }

    // Check if email already exists
    const existingStudent = await Student.findByEmail(email);
    if (existingStudent) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create student
    const newStudent = await Student.create({ name, email, faculty, level, password });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await Student.storeOTP(email, otp);

    // Send OTP to email (this FAILS without .env credentials)
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      message: 'Signup successful! OTP has been sent to your registered email. Please verify within 10 minutes.',
      email,
      requiresOTPVerification: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP
    const otpRecord = await Student.verifyOTP(email, otp);
    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Mark email as verified
    await Student.markEmailAsVerified(email);

    res.json({
      message: 'Email verified successfully! You can now login.',
      verified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await Student.storeOTP(email, otp);

    // Send OTP to email (non-critical, continue even if fails)
    try {
      await sendOTPEmail(email, otp, student.name);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue anyway - OTP is stored in DB, user can try again
      console.warn(`Warning: Failed to send email to ${email}, but OTP was stored. Error: ${emailError.message}`);
    }

    res.json({
      message: 'OTP has been resent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Email validation
    if (!email.toLowerCase().endsWith('@bicnepal.edu.np')) {
      return res.status(400).json({ error: 'Use your institutional email' });
    }

    // Find student
    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!student.is_verified) {
      return res.status(403).json({ 
        error: 'Email not verified. Please check your email for OTP and verify your account.',
        requiresOTPVerification: true 
      });
    }

    // Validate password
    const isPasswordValid = await Student.validatePassword(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await Student.updateLastLogin(student.id);

    // Generate JWT
    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        faculty: student.faculty,
        level: student.level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
