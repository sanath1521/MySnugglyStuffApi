const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: String,
    imageUrl: String,
    description: String
});

module.exports = mongoose.model("Category", schema);