const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../../model/payment/payment');
const transactionHistory = require('../../model/payment/transactionHistory');
const wallet = require('../../model/payment/wallet');

// Razorpay instance (replace with your keys)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID||'rzp_test_cEnvzyHa9o3Izi',
  key_secret: process.env.RAZORPAY_KEY_SECRET||'vVhiIcYjDaN8SbalMkTiq2if',
});

// 1. Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.accountId; // Authenticated user ID from token

     let userWallet = await wallet.findOne({ userId });
    if (!userWallet) {
      userWallet = await wallet.create({
        userId,
        balance: 0, // default starting balance,
        creditAmount:0
      });
    }


    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId,
      razorpayOrderId: order.id,
      amount: amount,
      currency: order.currency,
      receipt: order.receipt,
      isWalletPayment:false,
      status: 'created',
      method: 'Add wallet',

    });

    await payment.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// 2. Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isForWallet=true
    } = req.body;
    console.log(req.body,'razorpayOrderId')
    const userId = req.accountId; // Authenticated user ID from token

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET||'vVhiIcYjDaN8SbalMkTiq2if')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Create transaction history entry
    await transactionHistory.create({
      userId: updatedPayment.userId,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      status: 'paid',
      method: 'razorpay', // or derive from payment details if available
      type: 'credit',
      purpose: 'wallet recharge', // or "contest entry", "subscription", etc. (based on context)
      reference: razorpaySignature,
      details: {
        message: 'Payment verified and added to wallet',
      },
    });

    if(isForWallet){
    const userWallet = await wallet.findOne({userId})
    userWallet.balance+= updatedPayment.amount
    userWallet.creditAmount+= updatedPayment.amount

    await userWallet.save()
    }

    res.status(200).json({ success: true, message: 'Payment verified' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

exports.payFromWallet = async (req, res) => {
  try {
    const userId = req.accountId;
    const { amount, purpose } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get user wallet
    const userWallet = await wallet.findOne({ userId });

    if (!userWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check balance
    if (userWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct amount
    userWallet.balance -= amount;
    await userWallet.save();

    // Log transaction
    await Transaction.create({
      userId,
      amount,
      type: 'debit',
      method: 'wallet',
      purpose: purpose || 'Payment',
      date: new Date(),
    });

    // Optionally store in Payment collection
    await Payment.create({
      userId,
      amount,
      currency: 'INR',
      method: 'wallet',
      status: 'paid',
      isWalletPayment: true,
      purpose: purpose || 'Wallet Payment',
    });

    res.status(200).json({
      message: 'Payment successful',
      balance: userWallet.balance,
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createOrderForDriverPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.accountId; // Authenticated user ID from token

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId,
      razorpayOrderId: order.id,
      amount: amount,
      currency: order.currency,
      receipt: order.receipt,
      isWalletPayment:false,
      status: 'created',
      method: 'Online',
    });

    await payment.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

exports.verifyForDriverPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET||'vVhiIcYjDaN8SbalMkTiq2if')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Create transaction history entry
    await transactionHistory.create({
      userId: updatedPayment.userId,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      status: 'paid',
      method: 'Online', // or derive from payment details if available
      type: 'credit',
      purpose: 'wallet recharge', // or "contest entry", "subscription", etc. (based on context)
      reference: razorpaySignature,
      details: {
        message: 'Payment verified and added to wallet',
      },
    });

    res.status(200).json({ success: true, message: 'Payment verified' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};


