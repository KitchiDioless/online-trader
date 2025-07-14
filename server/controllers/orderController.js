const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { products, total, address, phone } = req.body;
    const buyer = req.user.userId;
    const order = new Order({ buyer, products, total, address, phone });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId }).populate('products.product');

    if (!orders) return res.status(404).json({ message: 'Orders not found' });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.buyer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No permission' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && req.user.role !== 'master') {
      return res.status(403).json({ message: 'No permission' });
    }
    
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err });
  }
};