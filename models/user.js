const mongoose = require('mongoose');


const addressSchema = mongoose.Schema({
    userName: String,
    phone: String,
    town: String,
    steet: String,
    zipcode: String,
    city: String,
    state: String
});


const itemSchema = mongoose.Schema({
  id: String,
  imageUrl: String,
  logo: {
      imageUrl: String,
      text: String,
  },
  name: String,
  description: String,
  category: String,
  categoryId: String,
  size: String,
  price: Number,
});

const orderSchema = mongoose.Schema({
    id: String,
    items: [itemSchema],
    address: addressSchema,
    price: {
        total: Number,
        deliveryCharge: Number,
        tax: Number
    },
    status: String,
    createdOn: Date
});


const schema = mongoose.Schema({
  name: String,
  phone: { type: Number, unique: true },
  email: { type: String, unique: true },
  password: String,
  addresses: [addressSchema],
  orders: [orderSchema],
  savedItems: [itemSchema],
  createdOn: Date,
});


module.exports = mongoose.model("User", schema);