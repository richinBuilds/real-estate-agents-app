const express = require('express');
     const router = express.Router();
     const User = require('../models/User');
     const jwt = require('jsonwebtoken');
     const bcrypt = require('bcrypt');
     const nodemailer = require('nodemailer')
     const { body, validationResult } = require('express-validator');
     const rateLimit = require('express-rate-limit');

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    
    // Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Your Real Estate Registration Verification Code',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`
  };
  await transporter.sendMail(mailOptions);
}
  
// Rate limiters
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many OTP requests. Please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.'
});

// Input validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
    
// Send OTP route
router.post(
  '/send-otp',
  otpLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await User.db.collection('otps').updateOne(
        { email },
        { $set: { otp, expiresAt } },
        { upsert: true }
      );

      await sendOTPEmail(email, otp);
      res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Failed to send verification code' });
    }
  }
);
    
    /* /// Register Route
     router.post('/register', async (req, res) => {
      try {
        const { email, password, role, firstName, lastName,  iam, phone } = req.body;

        if (!email || !password || !firstName || !lastName || !iam || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

      const phoneRegex = /^\+1[2-9]\d{9}$/;
if (!phoneRegex.test(phone)) {
  return res.status(400).json({ message: 'Phone number format is invalid' });
}   */
// Register route
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must be at least 8 characters, include uppercase, lowercase, number, and special character'),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('iam').isIn(['buyer', 'seller', 'renter', 'agent']),
    body('phone').matches(/^\+1[2-9]\d{9}$/),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, role, firstName, lastName, iam, phone, otp } = req.body;

      // Verify OTP
      const otpRecord = await User.db.collection('otps').findOne({ email, otp });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      if (otpRecord.expiresAt < new Date()) {
        await User.db.collection('otps').deleteOne({ email });
        return res.status(400).json({ message: 'Verification code expired' });
      }

      // Delete OTP after verification
      await User.db.collection('otps').deleteOne({ email });

    
        //Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const user = new User({ email, password: hashedPassword, role, firstName, lastName, iam, phone });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // Login Route
    router.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        console.log("Login attempt:", email, password);
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user){ 
          console.log("User not found");
          return res.status(401).json({ message: 'Invalid credentials.' });}

       const match = await bcrypt.compare(password, user.password);
       if (!match) {
        console.log("Password mismatch");
        return res.status(401).json({ message: 'Invalid credentials.' });}

        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        
        const token = jwt.sign( { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1d' });
          console.log("Login successful:", token);
          res.status(200).json({ message: 'Login successful', token });

        } catch (err) {
          res.status(500).json({ message: 'Login error.', error: err.message });
        }
        
    });

     module.exports = router;