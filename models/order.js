const mongoose = require('mongoose');



const itemSchema = mongoose.Schema({
  itemId: String,
  name: String,
  logo: {
    imageUrl: String,
    text: String,
  },
  description: String,
  imageUrl: String,
  category: String,
  categoryId: String,
  size: String,
  price: Number,
});


const schema = mongoose.Schema({
  paymentToken: String,
  items: [itemSchema],
  price: {
    total: Number,
    deliveryCharge: Number,
    tax: Number,
  },
  user: {
    id: String,
    name: String,
    mobile: Number,
    email: String,
  },
  address: {
    userName: String,
    phone: String,
    street: String,
    town: String,
    city: String,
    state: String,
    zipcode: String,
  },
  status: String,
});


module.exports = mongoose.model("Order",schema);