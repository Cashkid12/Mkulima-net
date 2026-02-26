const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0.00,
    min: 0
  },
  pendingBalance: {
    type: Number,
    default: 0.00,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true
  },
  pin: {
    type: String, // Will be hashed
    required: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    required: false
  },
  withdrawalLimit: {
    type: Number,
    default: 50000 // KES 50,000 daily limit
  },
  dailyWithdrawn: {
    type: Number,
    default: 0
  },
  lastWithdrawalReset: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String // URLs to document images
  }],
  kycLevel: {
    type: String,
    enum: ['basic', 'verified', 'business'],
    default: 'basic'
  },
  transactionLimits: {
    daily: {
      type: Number,
      default: 100000 // KES 100,000
    },
    monthly: {
      type: Number,
      default: 500000 // KES 500,000
    }
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    autoWithdrawal: {
      enabled: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      destination: { type: String } // M-Pesa number or bank account
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
walletSchema.index({ user: 1 });
walletSchema.index({ accountNumber: 1 }, { unique: true });

// Pre-save hook to generate account number
walletSchema.pre('save', async function(next) {
  if (this.isNew && !this.accountNumber) {
    // Generate unique account number
    const Wallet = mongoose.model('Wallet');
    let accountNumber;
    let isUnique = false;
    
    while (!isUnique) {
      accountNumber = 'MN' + Math.floor(1000000000 + Math.random() * 9000000000);
      const existing = await Wallet.findOne({ accountNumber });
      if (!existing) isUnique = true;
    }
    
    this.accountNumber = accountNumber;
  }
  next();
});

// Methods
walletSchema.methods.canWithdraw = function(amount) {
  return this.balance >= amount && 
         (this.dailyWithdrawn + amount) <= this.withdrawalLimit &&
         this.kycLevel !== 'basic'; // Basic KYC can't withdraw
};

walletSchema.methods.updateDailyWithdrawal = function(amount) {
  const now = new Date();
  const lastReset = new Date(this.lastWithdrawalReset);
  
  // Reset daily limit if it's a new day
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()) {
    this.dailyWithdrawn = 0;
    this.lastWithdrawalReset = now;
  }
  
  this.dailyWithdrawn += amount;
};

walletSchema.methods.getAvailableBalance = function() {
  return this.balance - this.pendingBalance;
};

walletSchema.methods.getTrustScore = function() {
  let score = 0;
  
  // Base score for having a wallet
  score += 10;
  
  // KYC verification bonus
  if (this.kycLevel === 'verified') score += 30;
  if (this.kycLevel === 'business') score += 50;
  
  // Balance bonus (up to KES 10,000 = 20 points)
  score += Math.min(20, Math.floor(this.balance / 500));
  
  // Transaction history bonus (up to 20 points)
  // This would be calculated based on transaction count and regularity
  
  return Math.min(100, score);
};

module.exports = mongoose.model('Wallet', walletSchema);