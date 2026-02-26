const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    }
  }],
  // Order details
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'wallet', 'escrow']
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  escrowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow'
  },
  // Shipping
  shippingMethod: {
    type: String,
    enum: ['pickup', 'courier', 'farm_pickup']
  },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    county: String,
    postalCode: String
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  deliveryInstructions: {
    type: String
  },
  // Timeline
  placedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  processingAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  // Cancellation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  },
  // Communication
  notes: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Ratings
  buyerRating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  },
  sellerRating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save hook
orderSchema.pre('save', function(next) {
  // Generate order number if new
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }

  // Calculate total amount if new or items modified
  if (this.isNew || this.isModified('items')) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0) + this.shippingCost;
  }

  // Update status timestamps
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        this.confirmedAt = now;
        break;
      case 'processing':
        this.processingAt = now;
        break;
      case 'shipped':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
      case 'completed':
        this.completedAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
    }
  }

  next();
});

// Static methods
orderSchema.statics.getBuyerOrders = function(buyerId, status = null, limit = 50, skip = 0) {
  const query = { buyer: buyerId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('seller', 'firstName lastName profilePicture')
    .populate('items.product')
    .populate('escrowId');
};

orderSchema.statics.getSellerOrders = function(sellerId, status = null, limit = 50, skip = 0) {
  const query = { seller: sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('buyer', 'firstName lastName profilePicture')
    .populate('items.product')
    .populate('escrowId');
};

orderSchema.statics.getRecentOrders = function(limit = 10) {
  return this.find({ status: { $ne: 'cancelled' } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('buyer', 'firstName lastName')
    .populate('seller', 'firstName lastName');
};

orderSchema.statics.getPendingOrders = function() {
  return this.find({ 
    status: { $in: ['pending', 'confirmed', 'processing'] },
    paymentStatus: 'completed'
  }).sort({ createdAt: -1 });
};

// Instance methods
orderSchema.methods.canCancel = function(userId) {
  return this.status === 'pending' && 
         this.buyer.toString() === userId.toString() &&
         this.paymentStatus !== 'completed';
};

orderSchema.methods.canConfirmDelivery = function(userId) {
  return this.status === 'shipped' && 
         this.buyer.toString() === userId.toString();
};

orderSchema.methods.canShip = function(userId) {
  return this.status === 'confirmed' && 
         this.seller.toString() === userId.toString() &&
         this.paymentStatus === 'completed';
};

orderSchema.methods.canComplete = function() {
  return this.status === 'delivered';
};

orderSchema.methods.addItem = function(product, quantity, price) {
  const existingItem = this.items.find(item => 
    item.product.toString() === product._id.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.price;
  } else {
    this.items.push({
      product: product._id,
      quantity: quantity,
      price: price,
      totalPrice: quantity * price,
      name: product.name,
      image: product.images?.[0]
    });
  }

  // Recalculate total
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0) + this.shippingCost;
};

orderSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  // Recalculate total
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0) + this.shippingCost;
};

orderSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  // Update timestamps
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'processing':
      this.processingAt = now;
      break;
    case 'shipped':
      this.shippedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      if (userId) this.cancelledBy = userId;
      break;
  }
};

orderSchema.methods.getDisplayStatus = function() {
  const statusMap = {
    'pending': 'Order Placed',
    'confirmed': 'Order Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
};

orderSchema.methods.getDisplayPaymentStatus = function() {
  const statusMap = {
    'pending': 'Payment Pending',
    'processing': 'Processing Payment',
    'completed': 'Payment Completed',
    'failed': 'Payment Failed',
    'refunded': 'Refunded'
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
};

orderSchema.methods.getTimeline = function() {
  const timeline = [];
  
  timeline.push({
    event: 'Order Placed',
    timestamp: this.placedAt,
    status: 'completed'
  });
  
  if (this.confirmedAt) {
    timeline.push({
      event: 'Order Confirmed',
      timestamp: this.confirmedAt,
      status: 'completed'
    });
  }
  
  if (this.processingAt) {
    timeline.push({
      event: 'Processing',
      timestamp: this.processingAt,
      status: 'completed'
    });
  }
  
  if (this.shippedAt) {
    timeline.push({
      event: 'Item Shipped',
      timestamp: this.shippedAt,
      status: 'completed'
    });
  }
  
  if (this.deliveredAt) {
    timeline.push({
      event: 'Delivered',
      timestamp: this.deliveredAt,
      status: 'completed'
    });
  }
  
  if (this.completedAt) {
    timeline.push({
      event: 'Order Completed',
      timestamp: this.completedAt,
      status: 'completed'
    });
  }
  
  if (this.cancelledAt) {
    timeline.push({
      event: 'Order Cancelled',
      timestamp: this.cancelledAt,
      status: 'cancelled'
    });
  }
  
  return timeline.sort((a, b) => a.timestamp - b.timestamp);
};

module.exports = mongoose.model('Order', orderSchema);