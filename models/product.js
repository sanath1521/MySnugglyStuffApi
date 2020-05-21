const mongoose = require('mongoose');


const schema = mongoose.Schema({
    name: String,
    imageUrl: String,
    description: String,
    category: String,
    categoryId: String,
    sizes: [{
        label: String,
        quantity: Number
    }],
    price: Number,
    isAvailable: Boolean,
    createdOn: String
});


module.exports = mongoose.model("Product", schema);