const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'produce', 'livestock', 'agrovet', 'equipment', 'seedlings', 'services',
      'crops', 'vegetables', 'fruits', 'grains', 'poultry', 'dairy', 
      'farm_inputs', 'seeds', 'fertilizers', 'other'
    ]
  },
  subcategory: {
    type: String,
    enum: [
      'maize', 'rice', 'wheat', 'beans', 'potatoes', 'carrots', 
      'tomatoes', 'bananas', 'mangoes', 'cattle', 'goats', 'sheep', 
      'chicken', 'eggs', 'milk', 'honey', 'tractor', 'plow', 
      'seeds_maize', 'seeds_wheat', 'organic_fertilizer', 'pesticides'
    ]
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'KES', // Kenyan Shillings as default for this agriculture platform
    uppercase: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    default: 'kg',
    enum: ['kg', 'grams', 'liters', 'pieces', 'bunches', 'bags', 'tonnes', 'animals', 'seedlings', 'crates']
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'fresh', 'processed', 'live', 'refurbished'],
    default: 'fresh'
  },
  // Animal-specific fields
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: String,
    trim: true
  },
  healthStatus: {
    type: String,
    trim: true
  },
  // Equipment-specific fields
  year: {
    type: Number
  },
  brand: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    county: {
      type: String,
      trim: true
    },
    town: {
      type: String,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  expiryDate: {
    type: Date
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', productSchema);