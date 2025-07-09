const express = require('express');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploads folder
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/realestate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

 // Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);


// Basic Route
app.get('/', (req, res) => {
  res.send('Real Estate Backend API');
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));