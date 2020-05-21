const express = require('express');
const Category = require('../models/category');
const router = express.Router();



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
router.post('/', async(req, res, next) => {
    const category = new Category({
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        description: req.body.description
    });
    await category.save((err) => {
        if(err) return res.send(500);
        res.send(200);
    });
    
});


module.exports = router;