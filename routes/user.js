const express = require('express');
const router = express.Router();
const User = require('../models/user');


{/*Gets all users */}
router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
});


router.post("/getUser", async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    console.log(user);
    if (user) {
        return res.send({
        status: 200,
        user,
        });
    }
    return res.send({
      status: 500,
      message: "user not found",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "An error occured at the server.",
    });
  }
});


{/*Creates a new user */}
router.post('/signup', async (req, res) => {
    const user = new User({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        addresses:[],
        savedItems: [],
        orders: [],
        createdOn: new Date()
    });

   await user.save((err, user) => {
     if (err) {
         console.log(err);
         return res.sendStatus(500);
     }
     res.send({
        status: 200, 
        user
     });
   });
});

{/*Gets user details by email id */}
router.post('/login', async (req, res) => {
    try{
         const user = await User.findOne({ email: req.body.email });
         console.log(user);
         if (user) {
           if (user.password == req.body.password) {
             return res.send({
               status: 200,
               user,
             });
           } else {
             return res.send({
               status: 500,
               message: "Invalid password",
             });
           }
         }
         return res.send({
            status: 500,
            message: "Please enter a valid email",
         });
    }
    catch(error){
         return res.send({
           status: 500,
           message: "An error occured at the server.",
         });
    }
   
});


{/* Saves item added to shopping bag*/}
router.post('/saveItem', async (req, res) => {
    const user = await User.findById(req.body.userId);


    //Before saving store logo image base64 in AWS. Write a function for this
    user.savedItems.push(req.body.item);

    user.save((err, user) => {
        if(err) 
        return res.send({
            message: 'An error occured',
            status: 500
        });

        return res.send(user);
    });

})


const getPriceDetails = (items) => {
    let price = 0;
     for (let i = 0; i < items.length; i++) {
       price = price + items[i].price;
     }

     let taxpc = 10;
     let deliveryCharge = 15;
     return {
                totalPrice: price,
                tax: Math.ceil(price * (taxpc / 100)),
                deliveryCharge
            }
}


router.post('/getSavedItems', async (req, res) => {
    const user = await User.findById(req.body.userId);

    let savedItems = user.savedItems;
    if(savedItems.length > 0){
        let data = {
          items: savedItems,
          priceDetails: getPriceDetails(savedItems),
        };

        return res.send(data);
    }
    else{
        res.send({
            items: []
        });
    }
});


router.post('/removeItem', async (req, res) => {
    const user = await User.findById(req.body.userId);
    let savedItems = user.savedItems;
    console.log(savedItems);
    let newSavedItems = savedItems.filter((el) => el._id != req.body.itemId);

    user.savedItems = newSavedItems;

    user.save((err, user) => {
        if(err) return res.send({
            message: 'An error occured at the server',
            status: 500
        })

        let data = {
            items: user.savedItems,
            priceDetails: getPriceDetails(user.savedItems)
        }

        return res.send(data);
    })
});


router.post("/getSavedAddresses", async (req,res) => {
    const user = await User.findById(req.body.userId);
    return res.send(user.addresses);
});


router.post('/addAddress', async (req, res) => {
    const user = await User.findById(req.body.userId);
    user.addresses.push(req.body.address);
    await user.save((err, user) => {
        if(err) return res.send({
            message: 'An error occured'
        })

        return res.send(user.addresses);
    });
});


router.post('/getOrders', async (req, res) => {
    try{
        const user = await User.findById(req.body.userId);

        if(user){
            return res.send({
                status: 200,
                orders: user.orders
            })
        }

        return res.send(500);

    }

    catch(error){
        return res.send(500);
    }
});

module.exports = router;