const express = require('express');
     const router = express.Router();
     const Property = require('../models/Property');
     const auth = require('../middleware/auth');
     const multer = require('multer');
     const path = require('path');

     // Configure multer for file uploads
     const storage = multer.diskStorage({  //diskStorage() tells multer to save files locally
      destination: (req, file, cb) => {     //destination: saves uploaded files in the uploads/ folder
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });
    const upload = multer({ storage }).array('images', 5);

    // Get all properties
    router.get('/', async (req, res) => {
      try {
        const properties = await Property.find().populate('createdBy', 'firstName');
        res.json(properties);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Get a single property by ID
    router.get('/:id', async (req, res) => {
      try {
        const property = await Property.findById(req.params.id).populate('createdBy', 'firstName');
        if (!property) {
          return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Add a property (protected)
    router.post('/', auth, upload, async (req, res) => {
      try {
        const user =  req.user;
        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' });
        }
        const { title, description, price } = req.body;
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const property = new Property({
          title,
          description,
          price,
          images,
          createdBy: user.userId
        });
        await property.save();
        res.status(201).json(property);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // Update a property (protected)
    router.put('/:id', auth, upload, async (req, res) => {
      try {
        const user = await req.user;
        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' });
        }
        const { title, description, price, existingImages } = req.body;
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const updatedImages = existingImages ? JSON.parse(existingImages) : [];
        const property = await Property.findById(req.params.id);
        if (!property) {
          return res.status(404).json({ message: 'Property not found' });
        }
        property.title = title || property.title;                   //a = b || a;
        property.description = description || property.description;
        property.price = price || property.price;
        property.images = [...updatedImages, ...images];
        await property.save();
        res.json(property);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // Delete a property (protected)
    router.delete('/:id', auth, async (req, res) => {
      try {
        const user = await req.user;
        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' });
        }
        const property = await Property.findById(req.params.id);
        if (!property) {
          return res.status(404).json({ message: 'Property not found' });
        }
        await property.deleteOne();
        res.json({ message: 'Property deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

     module.exports = router;