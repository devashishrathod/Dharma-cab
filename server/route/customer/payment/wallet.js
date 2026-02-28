const express = require('express');
const router = express.Router();
const walletController = require('../../../controller/payment/wallet');
const accountMiddleware = require("../../../middleware/account");

router.get('/',accountMiddleware, walletController.getWallet);
router.post('/credit', walletController.creditWallet);
router.post('/debit', walletController.debitWallet);
router.get('/transactions',accountMiddleware, walletController.getAllTransactions);

module.exports = router;
