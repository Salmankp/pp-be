const AppError = require('../utils/appError');
const Transaction = require('../models/transectionModel');
const Model = Transaction;
const Wallet = require('../models/walletModel');


exports.getSellerWalletDetails= async (tradingId) => {
	const transaction = await Model.findOne({transactionId:tradingId}).select('sellerId');

	const sellerDetails =  await Wallet.findOne({user:transaction?.sellerId}).select('wallet');

	if(sellerDetails) {
		return {sellerPublicAddress:sellerDetails?.wallet.public,sellerPrivateKey:sellerDetails?.wallet.private}
	}
}
exports.getBuyerWalletDetails= async (tradingId) => {
	const transaction = await Model.findOne({transactionId:tradingId}).select('buyerId');
	const sellerDetails =  await Wallet.findOne({user:transaction.buyerId}).select('wallet');
	if(sellerDetails) {
		return {buyerPublicAddress:sellerDetails.wallet.public,buyerPrivateKey:sellerDetails.wallet.private}
	}
}

