const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const user = require("./user");
const { v4: uuidv4 } = require("uuid");

{/*Gets all products */}
router.get('/', async (req, res) => {
    const products = await Product.find();
    if(products) return res.send(products);
});




{/*Gets products by category id*/}
router.post('/', async (req, res) => {
    
    const products = await Product.find({ categoryId:  req.body.categoryId});
    res.send(products);
});


router.post('/getProduct', async (req, res) => {
    const product = await Product.findById(req.body.id)
    res.send(product);
});

router.post('/addProduct', async (req, res) => {
    const imageUrl = await user.saveImgInAWS(req.body.imageBase64, uuidv4()); ;
    const { name, description, category, categoryId, sizes, price } = req.body;
    const product = new Product({
      name,
      imageUrl,
      description,
      category,
      categoryId,
      sizes,
      price,
      isAvailable: true,
      createdOn: new Date(),
    });

    await product.save((err, product) => {
        if(err) return res.send({
            status: 500,
            message: 'An error occured'
        });
        return res.send({
            status: 200,
            product
        });
    })
});


router.post("/delete", async (req, res, next) => {
  await Product.findByIdAndRemove(req.body.id, (err) => {
    if (err)
      return res.send({
        status: 500,
      });

    return res.send({
      status: 200,
    });
  });
});


module.exports = router;