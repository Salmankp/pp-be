const mongoose = require('mongoose');

const PaymentCard = new mongoose.Schema({

    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    subPayMethod: {
        type: mongoose.Types.ObjectId,
        ref: 'subPaymentMethod'
    },
    image: {
        type: String,
        default: 'abc'
        // required: trueå
    },
    code: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    }
});

const paymentCard = mongoose.model('paymentCard', PaymentCard);
module.exports = paymentCard;

