const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
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
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['created', 'funded', 'shipped', 'delivered', 'released', 'cancelled', 'disputed', 'refunded'],
    default: 'created'
  },
  // Escrow details
  escrowWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  escrowAmount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0
  },
  // Timeline
  fundedAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  releasedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  // Shipping details
  shippingInfo: {
    trackingNumber: {
      type: String
    },
    carrier: {
      type: String
    },
    estimatedDelivery: {
      type: Date
    },
    deliveryAddress: {
      type: String
    }
  },
  // Buyer confirmation
  buyerConfirmed: {
    type: Boolean,
    default: false
  },
  buyerConfirmedAt: {
    type: Date
  },
  // Seller confirmation
  sellerConfirmed: {
    type: Boolean,
    default: false
  },
  sellerConfirmedAt: {
    type: Date
  },
  // Dispute handling
  disputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String
  },
  disputeOpenedAt: {
    type: Date
  },
  disputeResolved: {
    type: Boolean,
    default: false
  },
  disputeResolvedAt: {
    type: Date
  },
  disputeResolution: {
    type: String,
    enum: ['buyer', 'seller', 'split', 'refund']
  },
  adminNotes: {
    type: String
  },
  // Automated handling
  autoReleaseDate: {
    type: Date
  },
  releaseTimeout: {
    type: Number,
    default: 14 // Days after delivery confirmation
  },
  // Communication
  messages: [{
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
  // Evidence (for disputes)
  evidence: [{
    type: String, // URLs to images, documents
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Rating connection
  buyerRating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  },
  sellerRating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
escrowSchema.index({ buyer: 1, createdAt: -1 });
escrowSchema.index({ seller: 1, createdAt: -1 });
escrowSchema.index({ order: 1 }, { unique: true });
escrowSchema.index({ status: 1 });
escrowSchema.index({ disputed: 1 });
escrowSchema.index({ createdAt: -1 });
escrowSchema.index({ autoReleaseDate: 1 });

// Pre-save hook
escrowSchema.pre('save', function(next) {
  // Auto calculate release date for non-disputed escrows
  if (this.status === 'delivered' && 
      !this.autoReleaseDate && 
      !this.disputed) {
    this.autoReleaseDate = new Date(Date.now() + (this.releaseTimeout * 24 * 60 * 60 * 1000));
  }
  
  // Set timestamps for status changes
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'funded':
        this.fundedAt = now;
        break;
      case 'shipped':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
      case 'released':
        this.releasedAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
    }
  }
  
  next();
});

// Static methods
escrowSchema.statics.getActiveEscrows = function(userId) {
  return this.find({
    $or: [{ buyer: userId }, { seller: userId }],
    status: { $in: ['funded', 'shipped', 'delivered'] }
  }).sort({ createdAt: -1 });
};

escrowSchema.statics.getDisputedEscrows = function() {
  return this.find({ disputed: true, disputeResolved: false })
    .sort({ disputeOpenedAt: -1 });
};

escrowSchema.statics.getPendingReleases = function() {
  const now = new Date();
  return this.find({
    status: 'delivered',
    autoReleaseDate: { $lte: now },
    disputed: false
  });
};

// Instance methods
escrowSchema.methods.canBuyerConfirm = function() {
  return this.status === 'shipped' && 
         !this.buyerConfirmed &&
         !this.disputed;
};

escrowSchema.methods.canSellerConfirm = function() {
  return this.status === 'created' && 
         !this.sellerConfirmed;
};

escrowSchema.methods.canRelease = function() {
  return (this.status === 'delivered' && this.buyerConfirmed) ||
         (this.status === 'delivered' && 
          this.autoReleaseDate && 
          new Date() >= this.autoReleaseDate &&
          !this.disputed);
};

escrowSchema.methods.canDispute = function(userId) {
  return this.status === 'delivered' && 
         !this.disputed && 
         (this.buyer.toString() === userId.toString() || 
          this.seller.toString() === userId.toString());
};

escrowSchema.methods.canCancel = function(userId) {
  return ['created', 'funded', 'shipped'].includes(this.status) &&
         (this.buyer.toString() === userId.toString() || 
          this.seller.toString() === userId.toString());
};

escrowSchema.methods.getTrustScoreImpact = function() {
  // Calculate trust impact based on successful completions
  if (this.status === 'released') return 10;
  if (this.status === 'cancelled') return -5;
  if (this.disputed) return -15;
  return 0;
};

escrowSchema.methods.getTimeline = function() {
  const timeline = [];
  
  if (this.fundedAt) {
    timeline.push({
      event: 'Payment Received',
      timestamp: this.fundedAt,
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
      event: 'Delivery Confirmed',
      timestamp: this.deliveredAt,
      status: 'completed'
    });
  }
  
  if (this.releasedAt) {
    timeline.push({
      event: 'Payment Released',
      timestamp: this.releasedAt,
      status: 'completed'
    });
  }
  
  if (this.cancelledAt) {
    timeline.push({
      event: 'Transaction Cancelled',
      timestamp: this.cancelledAt,
      status: 'cancelled'
    });
  }
  
  return timeline.sort((a, b) => a.timestamp - b.timestamp);
};

escrowSchema.methods.getDisplayStatus = function() {
  const statusMap = {
    'created': 'Awaiting Payment',
    'funded': 'Payment Received',
    'shipped': 'Item Shipped',
    'delivered': 'Awaiting Confirmation',
    'released': 'Completed',
    'cancelled': 'Cancelled',
    'disputed': 'Disputed',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
};

module.exports = mongoose.model('Escrow', escrowSchema);