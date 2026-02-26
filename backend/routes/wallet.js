const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Escrow = require('../models/Escrow');
const User = require('../models/User');
const crypto = require('crypto');

// Helper function to generate transaction reference
const generateReference = (type) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${type.toUpperCase().slice(0, 3)}${timestamp}${random}`;
};

// @route   GET /api/wallet
// @desc    Get user wallet info
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      // Create wallet for user if it doesn't exist
      wallet = new Wallet({
        user: req.user.id
      });
      await wallet.save();
    }
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type amount status description createdAt');
    
    res.json({
      success: true,
      wallet: {
        ...wallet.toObject(),
        availableBalance: wallet.getAvailableBalance(),
        trustScore: wallet.getTrustScore()
      },
      recentTransactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get user transactions
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.getUserTransactions(req.user.id, limit, skip);
    const total = await Transaction.countDocuments({ user: req.user.id });
    
    res.json({
      success: true,
      transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/wallet/deposit
// @desc    Add money to wallet
// @access  Private
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, phoneNumber } = req.body;
    
    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required' 
      });
    }
    
    if (!paymentMethod || !['mpesa', 'card', 'bank'].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid payment method is required' 
      });
    }
    
    // Get user wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user.id });
      await wallet.save();
    }
    
    // Create pending transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      user: req.user.id,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      description: `Deposit via ${paymentMethod}`,
      paymentMethod: paymentMethod,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance
    });
    
    await transaction.save();
    
    // Simulate payment processing (in real app, integrate with payment gateway)
    setTimeout(async () => {
      try {
        // Update wallet balance
        wallet.balance += amount;
        wallet.balanceAfter = wallet.balance;
        await wallet.save();
        
        // Update transaction
        transaction.status = 'completed';
        transaction.balanceAfter = wallet.balance;
        await transaction.save();
        
        // Emit real-time update
        req.io.to(`user_${req.user.id}`).emit('wallet_update', {
          balance: wallet.balance,
          transaction: transaction.toObject()
        });
      } catch (err) {
        console.error('Deposit processing error:', err);
        transaction.status = 'failed';
        await transaction.save();
      }
    }, 3000); // Simulate 3 second processing time
    
    res.json({
      success: true,
      message: 'Deposit initiated successfully',
      transaction: transaction.toObject()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/wallet/withdraw
// @desc    Withdraw money from wallet
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, destination, pin } = req.body;
    
    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required' 
      });
    }
    
    if (!destination) {
      return res.status(400).json({ 
        success: false, 
        message: 'Destination is required' 
      });
    }
    
    if (!pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction PIN is required' 
      });
    }
    
    // Get user wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }
    
    // Check if user can withdraw
    if (!wallet.canWithdraw(amount)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance or withdrawal limit exceeded' 
      });
    }
    
    // Verify PIN (in real app, use proper PIN verification)
    if (wallet.pin && wallet.pin !== crypto.createHash('sha256').update(pin).digest('hex')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid PIN' 
      });
    }
    
    // Update daily withdrawal tracking
    wallet.updateDailyWithdrawal(amount);
    
    // Create transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      user: req.user.id,
      type: 'withdrawal',
      amount: amount,
      status: 'processing',
      description: `Withdrawal to ${destination}`,
      paymentMethod: destination.includes('@') ? 'bank' : 'mpesa',
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance - amount
    });
    
    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save();
    await transaction.save();
    
    // Simulate withdrawal processing
    setTimeout(async () => {
      try {
        transaction.status = 'completed';
        await transaction.save();
        
        // Emit real-time update
        req.io.to(`user_${req.user.id}`).emit('wallet_update', {
          balance: wallet.balance,
          transaction: transaction.toObject()
        });
      } catch (err) {
        console.error('Withdrawal processing error:', err);
        // Rollback on failure
        wallet.balance += amount;
        wallet.dailyWithdrawn -= amount;
        transaction.status = 'failed';
        await wallet.save();
        await transaction.save();
      }
    }, 5000); // Simulate 5 second processing time
    
    res.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      transaction: transaction.toObject()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/wallet/transfer
// @desc    Transfer money to another user
// @access  Private
router.post('/transfer', auth, async (req, res) => {
  try {
    const { amount, recipientAccount, description, pin } = req.body;
    
    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required' 
      });
    }
    
    if (!recipientAccount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient account is required' 
      });
    }
    
    if (!pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction PIN is required' 
      });
    }
    
    // Get sender wallet
    const senderWallet = await Wallet.findOne({ user: req.user.id });
    if (!senderWallet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }
    
    // Verify PIN
    if (senderWallet.pin && senderWallet.pin !== crypto.createHash('sha256').update(pin).digest('hex')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid PIN' 
      });
    }
    
    // Check balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }
    
    // Get recipient wallet
    const recipientWallet = await Wallet.findOne({ accountNumber: recipientAccount });
    if (!recipientWallet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient account not found' 
      });
    }
    
    // Prevent self-transfer
    if (recipientWallet.user.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot transfer to your own account' 
      });
    }
    
    // Get recipient user
    const recipientUser = await User.findById(recipientWallet.user);
    
    // Create sender transaction
    const senderTransaction = new Transaction({
      wallet: senderWallet._id,
      user: req.user.id,
      type: 'transfer',
      amount: amount,
      status: 'completed',
      description: description || `Transfer to ${recipientUser.firstName} ${recipientUser.lastName}`,
      recipientWallet: recipientWallet._id,
      recipientUser: recipientUser._id,
      paymentMethod: 'wallet',
      balanceBefore: senderWallet.balance,
      balanceAfter: senderWallet.balance - amount
    });
    
    // Create recipient transaction
    const recipientTransaction = new Transaction({
      wallet: recipientWallet._id,
      user: recipientUser._id,
      type: 'transfer',
      amount: amount,
      status: 'completed',
      description: description || `Transfer from ${req.user.firstName} ${req.user.lastName}`,
      recipientWallet: senderWallet._id,
      recipientUser: req.user.id,
      paymentMethod: 'wallet',
      balanceBefore: recipientWallet.balance,
      balanceAfter: recipientWallet.balance + amount
    });
    
    // Update balances
    senderWallet.balance -= amount;
    recipientWallet.balance += amount;
    
    await Promise.all([
      senderWallet.save(),
      recipientWallet.save(),
      senderTransaction.save(),
      recipientTransaction.save()
    ]);
    
    // Emit real-time updates
    req.io.to(`user_${req.user.id}`).emit('wallet_update', {
      balance: senderWallet.balance,
      transaction: senderTransaction.toObject()
    });
    
    req.io.to(`user_${recipientUser._id}`).emit('wallet_update', {
      balance: recipientWallet.balance,
      transaction: recipientTransaction.toObject()
    });
    
    res.json({
      success: true,
      message: 'Transfer completed successfully',
      transaction: senderTransaction.toObject()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return res.json({
        success: true,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        currency: 'KES'
      });
    }
    
    res.json({
      success: true,
      balance: wallet.balance,
      availableBalance: wallet.getAvailableBalance(),
      pendingBalance: wallet.pendingBalance,
      currency: wallet.currency
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/wallet/pin
// @desc    Set transaction PIN
// @access  Private
router.post('/pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'PIN must be 4 digits' 
      });
    }
    
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }
    
    // Hash the PIN
    wallet.pin = crypto.createHash('sha256').update(pin).digest('hex');
    await wallet.save();
    
    res.json({
      success: true,
      message: 'PIN set successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;