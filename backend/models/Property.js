const mongoose = require('mongoose');

     const propertySchema = new mongoose.Schema({
       title: { type: String, required: true },
       description: { type: String, required: true },
       price: { type: Number, required: true },
       images: [{ type: String }], // Optional array
       createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },


       featured: {
        type: Boolean,
        default: false
      }

     });

     


     module.exports = mongoose.model('Property', propertySchema);