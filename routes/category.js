const express = require('express');
const router = express.Router();
const Category = require('../controllers/category');
const middleware = require('../middlewares/auth');

router.get('/categories_with_offers', Category.getAllCategoriesWithChildren);
router.route('/').get(Category?.getAll).post(Category.createOne);
router.route('/:id').get(Category?.getOne);

// Protect all routes after this middleware
router.use(middleware.protect);


module.exports = router;