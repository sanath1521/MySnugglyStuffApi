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
  quantity: String,
  size: String,
  price: Number,
});


const schema = mongoose.Schema({
  paymentToken: String,
  items: [itemSchema],
  price: {
    totalPrice: Number,
    deliveryCharge: Number,
    tax: Number,
  },
  user: {
    id: String,
    name: String,
    phone: Number,
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
  createdOn: String,
});


module.exports = mongoose.model("Order",schema);