const express = require("express");
const router = express.Router();
const Product = require("../models/product");

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
    const product = new Product({
        ...req.body,
        createdOn: new Date()
    });

    await product.save((err, product) => {
        if(err) return res.send({
            message: 'An error occured'
        });
        return res.send(product);
    })
});



module.exports = router;