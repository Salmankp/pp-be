const mongoose = require('mongoose');

const Category = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);

const category = mongoose.model('category', Category);
module.exports = category;

