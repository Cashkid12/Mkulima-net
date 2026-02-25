const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const mongoose = require('mongoose'); // Add mongoose for ObjectId conversion
const router = express.Router();

// @route   POST api/products
// @desc    Create a new product listing
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      images,
      price,
      currency,
      quantity,
      unit,
      condition,
      location,
      expiryDate,
      tags,
      // Animal fields
      breed,
      age,
      healthStatus,
      // Equipment fields
      year,
      brand
    } = req.body;

    const newProduct = new Product({
      seller: req.userId,
      name,
      description,
      category,
      subcategory,
      images: images || [],
      price,
      currency: currency || 'KES',
      quantity,
      unit: unit || 'kg',
      condition: condition || 'fresh',
      location: location || null,
      expiryDate,
      tags: tags || [],
      // Animal fields
      breed,
      age,
      healthStatus,
      // Equipment fields
      year,
      brand
    });

    const product = await newProduct.save();

    // Populate seller data
    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'username profilePicture farmName location role verified');

    res.json(populatedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products
// @desc    Get all products with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isAvailable: true }; // Only show available products

    // Apply filters
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.q) {
      // Search in name and description
      query.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    if (req.query.county || req.query.town) {
      if (req.query.county) query['location.county'] = { $regex: req.query.county, $options: 'i' };
      if (req.query.town) query['location.town'] = { $regex: req.query.town, $options: 'i' };
    }

    // Handle freshness filter (posted within X hours)
    if (req.query.freshness) {
      const now = new Date();
      let hoursAgo;
      switch (req.query.freshness) {
        case '24h': hoursAgo = 24; break;
        case '3d': hoursAgo = 72; break;
        case '7d': hoursAgo = 168; break;
        default: hoursAgo = null;
      }
      if (hoursAgo) {
        const cutoffDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        query.createdAt = { $gte: cutoffDate };
      }
    }

    // Handle filters that require post-query processing
    let postQueryFilter = {};
    
    if (req.query.sellerType && req.query.sellerType !== 'all') {
      postQueryFilter.sellerType = req.query.sellerType;
    }
    
    if (req.query.freshness && req.query.freshness !== 'all') {
      postQueryFilter.freshness = req.query.freshness;
    }
    
    // If we have post-query filters, we need to get all matching records first
    if (Object.keys(postQueryFilter).length > 0) {
      // Need to populate seller if filtering by seller type
      const populateOptions = 'username profilePicture farmName location role verified';
      const allProducts = await Product.find(query).populate('seller', populateOptions);
      
      // Apply post-query filters
      let filteredProducts = allProducts;
      
      if (postQueryFilter.sellerType) {
        filteredProducts = filteredProducts.filter(p => 
          p.seller && p.seller.role === postQueryFilter.sellerType
        );
      }
      
      if (postQueryFilter.freshness) {
        const now = new Date();
        filteredProducts = filteredProducts.filter(p => {
          const productDate = new Date(p.createdAt);
          const diffInHours = (now.getTime() - productDate.getTime()) / (1000 * 60 * 60);
          
          switch (postQueryFilter.freshness) {
            case '24h': return diffInHours <= 24;
            case '3d': return diffInHours <= 72;
            case '7d': return diffInHours <= 168;
            default: return true;
          }
        });
      }
      
      // Apply sorting and pagination to filtered results
      const sortedProducts = filteredProducts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const startIndex = skip;
      const endIndex = skip + limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      // Find all products matching base query for total count
      const totalProducts = filteredProducts.length;
      
      return res.json({
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts: totalProducts,
          hasNext: endIndex < totalProducts,
          hasPrev: page > 1
        }
      });
    }
    
    const products = await Product.find(query)
      .populate('seller', 'username profilePicture farmName location role verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username profilePicture farmName location');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update product fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'seller') { // Prevent changing the seller
        product[key] = req.body[key];
      }
    });

    await product.save();

    // Populate seller data
    const updatedProduct = await Product.findById(product._id)
      .populate('seller', 'username profilePicture farmName location');

    res.json(updatedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Product.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/seller/:sellerId
// @desc    Get products by seller ID
// @access  Public
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ 
      seller: req.params.sellerId,
      isAvailable: true
    })
      .populate('seller', 'username profilePicture farmName location')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/products/:id/rate
// @desc    Rate a product
// @access  Private
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user has already rated this product
    const existingRating = product.ratings.find(r => 
      r.user && r.user.toString() === req.userId
    );

    if (existingRating) {
      return res.status(400).json({ msg: 'Product already rated by this user' });
    }

    // Add new rating
    product.ratings.push({
      user: req.userId,
      rating: rating,
      ratedAt: Date.now()
    });

    // Calculate new average
    const totalRatings = product.ratings.length;
    const sumRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
    product.ratings.average = sumRatings / totalRatings;
    product.ratings.count = totalRatings;

    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/location/nearby
// @desc    Get products near a location
// @access  Public
router.get('/location/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseFloat(maxDistance) || 50; // Default to 50km

    const products = await Product.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance * 1000 // Convert km to meters
        }
      }
    })
      .populate('seller', 'username profilePicture farmName location');

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/search
// @desc    Search products by keyword
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, county, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { isAvailable: true };
    
    // Add search query
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.county': { $regex: q, $options: 'i' } },
        { 'seller.username': { $regex: q, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      query.category = category;
    }
    
    // Add location filter
    if (county) {
      query['location.county'] = { $regex: county, $options: 'i' };
    }
    
    // Add price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Handle filters that require post-query processing
    let postQueryFilter = {};
    
    if (req.query.sellerType && req.query.sellerType !== 'all') {
      postQueryFilter.sellerType = req.query.sellerType;
    }
    
    if (req.query.freshness && req.query.freshness !== 'all') {
      postQueryFilter.freshness = req.query.freshness;
    }
    
    // If we have post-query filters, we need to get all matching records first
    if (Object.keys(postQueryFilter).length > 0) {
      // Need to populate seller if filtering by seller type
      const populateOptions = 'username profilePicture farmName location role verified';
      const allProducts = await Product.find(query).populate('seller', populateOptions);
      
      // Apply post-query filters
      let filteredProducts = allProducts;
      
      if (postQueryFilter.sellerType) {
        filteredProducts = filteredProducts.filter(p => 
          p.seller && p.seller.role === postQueryFilter.sellerType
        );
      }
      
      if (postQueryFilter.freshness) {
        const now = new Date();
        filteredProducts = filteredProducts.filter(p => {
          const productDate = new Date(p.createdAt);
          const diffInHours = (now.getTime() - productDate.getTime()) / (1000 * 60 * 60);
          
          switch (postQueryFilter.freshness) {
            case '24h': return diffInHours <= 24;
            case '3d': return diffInHours <= 72;
            case '7d': return diffInHours <= 168;
            default: return true;
          }
        });
      }
      
      // Apply sorting and pagination to filtered results
      const sortedProducts = filteredProducts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const startIndex = skip;
      const endIndex = skip + parseInt(limit);
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      // Find all products matching base query for total count
      const totalProducts = filteredProducts.length;
      
      return res.json({
        products: paginatedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts: totalProducts,
          hasNext: endIndex < totalProducts,
          hasPrev: parseInt(page) > 1
        }
      });
    }
    
    const products = await Product.find(query)
      .populate('seller', 'username profilePicture farmName location role verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/dashboard/stats
// @desc    Get marketplace stats for a user
// @access  Private
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Get user ID from authenticated token
    const userId = req.userId;
    
    // Count total listings for the user
    const totalListings = await Product.countDocuments({
      seller: userId
    });
    
    // Count active listings for the user
    const activeListings = await Product.countDocuments({
      seller: userId,
      isAvailable: true
    });
    
    // Count sold listings for the user (not available)
    const soldListings = await Product.countDocuments({
      seller: userId,
      isAvailable: false
    });
    
    // Calculate total views for all user's listings
    const totalViewsResult = await Product.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;
    
    // For messages received, we would typically have a separate Messages collection
    // For now, we'll return 0 and this can be enhanced later
    const messagesReceived = 0; // This would come from a messages collection
    
    res.json({
      totalListings,
      activeListings,
      soldListings,
      totalViews,
      messagesReceived
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;