const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'payment', 'refund', 'transfer', 'escrow_release', 'escrow_refund'],
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
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  reference: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // For payment transactions
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For transfers
  recipientWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  recipientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For escrow transactions
  escrowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow'
  },
  // Payment method details
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'wallet'],
    required: true
  },
  paymentReference: {
    type: String // External payment reference (M-Pesa receipt, bank reference, etc.)
  },
  // Fees
  transactionFee: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  // Balance tracking
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  // Fraud detection
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flaggedReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 }, { unique: true });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save hook to generate reference number
transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.reference) {
    const Transaction = mongoose.model('Transaction');
    let reference;
    let isUnique = false;
    
    while (!isUnique) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      reference = `${this.type.toUpperCase().slice(0, 3)}${timestamp}${random}`;
      
      const existing = await Transaction.findOne({ reference });
      if (!existing) isUnique = true;
    }
    
    this.reference = reference;
  }
  next();
});

// Static methods
transactionSchema.statics.findByReference = function(reference) {
  return this.findOne({ reference });
};

transactionSchema.statics.getUserTransactions = function(userId, limit = 50, skip = 0) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('buyer', 'firstName lastName profilePicture')
    .populate('seller', 'firstName lastName profilePicture')
    .populate('relatedProduct', 'name images')
    .populate('recipientUser', 'firstName lastName');
};

transactionSchema.statics.getWalletTransactions = function(walletId, limit = 50, skip = 0) {
  return this.find({ wallet: walletId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

transactionSchema.statics.getPendingTransactions = function(userId) {
  return this.find({ 
    user: userId, 
    status: { $in: ['pending', 'processing'] } 
  }).sort({ createdAt: -1 });
};

// Instance methods
transactionSchema.methods.isRefundable = function() {
  return this.status === 'completed' && 
         ['payment', 'transfer'].includes(this.type) &&
         this.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Within 30 days
};

transactionSchema.methods.getDisplayType = function() {
  const typeMap = {
    'deposit': 'Money Added',
    'withdrawal': 'Money Withdrawn',
    'payment': 'Payment Sent',
    'refund': 'Refund Received',
    'transfer': 'Money Sent',
    'escrow_release': 'Payment Received',
    'escrow_refund': 'Refund Received'
  };
  return typeMap[this.type] || this.type;
};

transactionSchema.methods.getDisplayStatus = function() {
  const statusMap = {
    'pending': 'Processing',
    'processing': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
};

transactionSchema.methods.getDisplayAmount = function() {
  return `KES ${this.amount.toLocaleString()}`;
};

module.exports = mongoose.model('Transaction', transactionSchema);