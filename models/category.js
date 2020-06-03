const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: String,
    imageUrl: String,
    description: String,
    isAvailable: Boolean
});

module.exports = mongoose.model("Category", schema);