const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        if (req.query.isAvailable) {
            keyword.isAvailable = req.query.isAvailable === 'true';
        }


        const products = await Product.find({ ...keyword });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin (We will just use Private for this demo)
const createProduct = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;
        // Check if file was uploaded
        const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : null; // Normalize path

        const product = new Product({
            name,
            price,
            description,
            imageUrl,
            stock,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, imageUrl, stock, isAvailable } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            if (req.file) {
                product.imageUrl = req.file.path.replace(/\\/g, '/');
            } else if (imageUrl) {
                // If a new URL string is provided (e.g. kept same or cleared)
                product.imageUrl = imageUrl;
            }
            // else keep existing product.imageUrl

            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.stock = stock || product.stock;
            if (isAvailable !== undefined) {
                product.isAvailable = isAvailable;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();;
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
