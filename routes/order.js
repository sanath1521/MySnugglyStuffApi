const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const stripe = require('stripe')('sk_test_3gGwnFfFvzxDnfMysuNLX4P900Hv28afPR');


{/*Gets all Orders*/}
router.get('/', async (req, res) => {
    const orders = await Order.find();
    if(orders){
      return res.send({
        status: 200,
        orders,
      });
    }

    return res.send({
      status: 500
    });
    
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
    console.log(orderDetails);
    console.log('ORDER CREATED');
    let user = await User.findById(orderDetails.user.id);
    let order = {
      id: orderDetails._id,
      items: orderDetails.items,
      address: orderDetails.address,
      price: orderDetails.price,
      status: orderDetails.status,
      createdOn: new Date(),
    };
    user.savedItems = [];
    user.orders.push(order);
    console.log(user);
    await user.save((err, user) => {
        if(err) return res.send(500);
        res.send({
          status: 200,
          order: req.order
        });
    })
    
}

const createStripeCustomer = (req, res, next) => {
  console.log('Creating Customer');
  stripe.customers
  .create(
    {
      name: req.body.user.name,
      description: 'Test Customer for testing'
    },
    (err, cus) => {
      req.customer = cus;
      return next();
    }
  )
  
}

router.post(
  "/createOrder",
  async(req, res, next) => {
    console.log(req.body);
    const { totalPrice, tax, deliveryCharge } = req.body.price;

    const customer = await stripe.customers.create({
      source: req.body.paymentToken,
      email: req.body.user.email,
      name: req.body.user.name,
      address: {
        line1: req.body.address.street,
        postal_code: req.body.address.zipcode,
        city: req.body.address.city,
        state: req.body.address.state,
        country: 'Australia',
      },
    });

    console.log('TOTAL ORDER AMOUNT');
    console.log(totalPrice + tax + deliveryCharge);

    stripe.charges
      .create({
        amount: (totalPrice + tax + deliveryCharge) * 100,
        currency: "aud",
        // source: req.body.paymentToken,
        description: 'Product Purchase',
        customer: customer.id,
        shipping:{
          name: req.body.address.userName,
          address: {
            line1: req.body.address.street,
          }
        }
      })
      .then((charge) => {
        console.log(charge);
        req.chargeId = charge.id;
        // req.payload = req.body;
        return next();
      })
      .catch((error) => {
        return res.send({
          message: "An error occured",
        });
      });
  },
  async (req, res, next) => {
    try {
      const order = new Order({
        ...req.body,
        chargeId: req.chargeId,
        status: "received",
        createdOn: new Date(),
      });
      await order.save((err, order) => {
        if (err)
          return res.send({
            message: "An error occured",
          });
        req.order = order;
        return next();
      });
    } catch (error) {
        return res.send({
          message: "An error occured",
        });
    }
  },
  addOrderToUser
);



router.post('/updateStatus', async (req, res) => {
  let order = await Order.findById(req.body.orderId);

  let user = await User.findById(req.body.userId);

  order.status = req.body.status;

  user.orders.forEach(el => {
    if(el.id == req.body.orderId){
      el.status = req.body.status;
    }
  });


  await user.save((err, user) => {
    if (err)
      return res.send({
        status: 500,
      });

    await order.save((err, order) => {
      if(err) return res.send({
        status: 500
      });

      return res.send({
        status: 200,
        order
      });
    })
  })
})

module.exports = router;