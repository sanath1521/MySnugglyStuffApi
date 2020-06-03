const express = require('express');
const router = express.Router();
const User = require('../models/user');
const AWS  = require('aws-sdk');


AWS.config.loadFromPath("./s3config.json");

let s3Bucket = new AWS.S3({ params: { Bucket: "snugglybucket" } });


{/*Gets all users */}
router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
});


router.post("/getUser", async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
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


const saveImgInAWS = async (base64Img, id) => {
  let buf = new Buffer(
    base64Img.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  let data = {
    Key: id,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };



  const result = await s3Bucket.upload(data).promise();
  if(result.Location){
    console.log("IMAGE SAVED AND RETURNING");
    return result.Location;
  } 
  
  return null;

}


const saveImgAWS = async (req, res, next) => {
  if(req.body.item.logo.imageBase64){
    let url = await saveImgInAWS(
      req.body.item.logo.imageBase64,
      req.body.userId,
    );
    req.logoImgUrl = url;
    // next();
  }

  next();
   
}


// router.post('/saveImage', async (req, res) => {
//   const data = await saveImgInAWS(req.body.base64Img, req.body.userId);
//   return res.send(data);
// })


{/* Saves item added to shopping bag*/}
router.post('/saveItem', 
saveImgAWS,
async (req, res) => {
  const user = await User.findById(req.body.userId);
  if(user){

    let logo = {
      imageUrl: req.logoImgUrl,
      text: req.body.item.logo.text
    };
  
    req.body.item.logo = logo;

    //Before saving, store logo image base64 in AWS. Write a function for this
    user.savedItems.push(req.body.item);
    user.save((err, user) => {
      if (err)
        return res.send({
          message: "An error occured",
          status: 500,
        });

        console.log('RETURNING USER');
      return res.send(user);
    });
  }

  // else{
  //   console.log("ELSE LOOP");
  //   return res.send({
  //     message: "An error occured",
  //     status: 500,
  //   });
  // }
   

})


const getPriceDetails = (items) => {
    let price = 0;
     for (let i = 0; i < items.length; i++) {
       price = price + items[i].price * Number(items[i].quantity);
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


router.post('/updateUserDetails', async (req, res) => {
  let user = await User.findById(req.body.userId);
  if(user){
    let { name, phone, email, password } = req.body;

    user.name = name;
    user.phone = phone;
    user.email = email;
    user.password = password;

    user.save((err, user) => {
      if(err) return res.send({status: 500});

      return res.send({
        status: 200,
        user
      });

    })
  } 

  else{
    return res.send({ status: 500 });
  }
  
})

router.saveImgInAWS = saveImgInAWS;

module.exports = router;