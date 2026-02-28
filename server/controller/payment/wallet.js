const Wallet = require('../../model/payment/wallet'); // Adjust path if different
const transactionHistory = require('../../model/payment/transactionHistory');

// Create wallet for a user (only once)

// Get wallet by user ID
exports.getWallet = async (req, res) => {
  try {
        const userId = req.accountId; // Authenticated user ID from token


    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.status(200).json({ wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet', error: error.message });
  }
};

// Credit wallet
exports.creditWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.balance += amount;
    wallet.creditAmount += amount;
    await wallet.save();

    res.status(200).json({ message: 'Wallet credited successfully', wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error crediting wallet', error: error.message });
  }
};

// Debit wallet
exports.debitWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.debitAmount += amount;
    await wallet.save();

    res.status(200).json({ message: 'Wallet debited successfully', wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error debiting wallet', error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const userId = req.accountId; // Authenticated user ID
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch total count and paginated transactions
    const [transactions, totalCount] = await Promise.all([
      transactionHistory.find({ userId }).populate({
        path:'userId',
        select:"name"
      })
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(limit),
      transactionHistory.countDocuments({ userId })
    ]);

    res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalTransactions: totalCount,
      data: transactions,
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};