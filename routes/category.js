const express = require('express');
const Category = require('../models/category');
const router = express.Router();
const user = require('./user');
const { v4: uuidv4 } = require("uuid");

console.log(user.saveImgInAWS);
{/*Gets all categories */}
router.get('/',async (req, res, next) => {
    const categories = await Category.find();
    res.send(categories);
});

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    res.send(category);
})


{/*creates a new category */}
router.post('/', 
async (req, res, next) => {
    const imageUrl = await user.saveImgInAWS(req.body.imageBase64, uuidv4()); ;
    const category = new Category({
        name: req.body.name,
        imageUrl,
        description: req.body.description,
        isAvailable: true

    });
    await category.save((err) => {
        if(err) return res.send({
            status: 500
        });
        res.send({
            status: 200,
            category
        });
    });
    
});

router.post('/delete', async(req, res, next) => {
    await Category.findByIdAndRemove(req.body.id, (err) => {
        if(err) return res.send({
            status: 500
        })

        return res.send({
            status: 200
        });
    });
})


module.exports = router;