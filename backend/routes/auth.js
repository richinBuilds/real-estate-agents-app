const express = require('express');
     const router = express.Router();
     const User = require('../models/User');
     const jwt = require('jsonwebtoken');
     const bcrypt = require('bcrypt');

     /// Register Route
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
}
    
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