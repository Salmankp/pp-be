const mongoose = require('mongoose');

const subPaymentMethod = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	icon: {
		type: String,
	},
	isPopular: {
		type: Boolean,
		default: false
	},
	slug:{
		type: String,
		required:true
	},
	country: {
		type: String,
		required: true
	},
	paymentMethodId: {
		type: mongoose.Types.ObjectId,
		ref: 'paymentMethod'
	},
	giftCardCategoryId: {
		type: mongoose.Types.ObjectId,
		ref: 'category'
	}
});

const subPayMethod = mongoose.model('subPaymentMethod', subPaymentMethod);
module.exports = subPayMethod;

