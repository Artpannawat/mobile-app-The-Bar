const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, upload.single('imageUrl'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, upload.single('imageUrl'), updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
