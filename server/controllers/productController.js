const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const owner = req.user.userId;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    console.log('Uploaded files:', req.files);
    console.log('Image paths:', images);

    if (!mongoose.connection.readyState) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }

    const product = new Product({ 
      title, 
      description, 
      price: parseFloat(price), 
      category, 
      owner,
      images 
    });
    
    console.log('Saving product with data:', product);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    console.log('\n=== GET /products ===');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    if (!mongoose.connection.readyState) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { category, search } = req.query;
    let filter = {};

    if (category) {
      console.log('Filtering by category:', category);
      filter.category = category;
    }

    if (search) {
      console.log('Searching for:', search);
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Final MongoDB filter:', filter);
    
    const products = await Product.find(filter)
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} products`);
    console.log('Sample product:', products[0]);
    
    res.json(products);
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const product = await Product.findById(req.params.id).populate('owner', 'name avatar');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error getting product:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'No permission' });
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'No permission' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};