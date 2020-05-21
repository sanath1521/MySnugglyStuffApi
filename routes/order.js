const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');

{/*Gets all Orders*/}
router.get('/', (req, res) => {
    const orders = Order.find();
    res.send(orders)
});

{/*Gets particular order by order id*/}
router.post('/getOrder', async (req, res) => {
    const order = await Order.findOne({ id: req.body.id });
    if(order){
        return res.send(order);
    }

    res.send({
        message: 'order not found'
    });
});

{/*Creates a new order */}

const addOrderToUser = async (req, res) => {
    const orderDetails = req.order;
    let user = await User.findOne(({ id: orderDetails.user.id }));
    let order = {
      id: orderDetails.id,
      items: orderDetails.items,
      address: orderDetails.address,
      price: orderDetails.price,
      status: orderDetails.status,
      createdOn: new Date(),
    };
    user.orders.push(order);
    await user.save((err, user) => {
        if(err) return res.send(500);
        res.send(req.order);
    })
    
}

router.post('/createOrder', (req, res) => {
    const order = new Order({
      ...req.body,
      status: "received",
      createdOn: new Date()
    });

    order.save((err, order) => {
      if (err)
        return res.send({
          message: "An error occured",
        });
      req.order = order;
      return next();
    }),
    addOrderToUser
})


module.exports = router;